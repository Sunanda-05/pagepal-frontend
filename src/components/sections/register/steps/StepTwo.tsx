import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/button";
import { IconUser, IconCheck, IconX } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import FormInput from "../../../base/FormInput";
import { FormData } from "../../../../types/form";

interface StepTwoProps {
  onNext: () => void;
  onBack: () => void;
}

const StepTwo: React.FC<StepTwoProps> = ({ onNext, onBack }) => {
  const { control, trigger, watch } = useFormContext<FormData>();
  const [isChecking, setIsChecking] = useState(false);
  const username = watch("username");

  // Mock username availability check
  const checkUsernameAvailability = async (username: string) => {
    setIsChecking(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsChecking(false);
    return !["admin", "user", "test"].includes(username.toLowerCase());
  };

  const handleNext = async () => {
    const isValid = await trigger(["username"]);
    if (isValid) {
      onNext();
    }
  };

  const getEndContent = () => {
    if (isChecking) {
      return (
        <div className="w-4 h-4 border-2 border-info border-t-transparent rounded-full animate-spin" />
      );
    }
    if (username && username.length >= 3) {
      return <IconCheck size={18} className="text-success" />;
    }
    return null;
  };

  useEffect(() => {
    if (!username) return;

    const timer = setTimeout(() => {
      trigger("username").finally(() => {
        checkUsernameAvailability(username);
      });
    }, 1000); // Debounce for 500ms

    return () => clearTimeout(timer);
  }, [username, trigger]);

  return (
    <div
      // initial={{ opacity: 0, x: 50 }}
      // animate={{ opacity: 1, x: 0 }}
      // exit={{ opacity: 0, x: -50 }}
      // transition={{ duration: 0.3 }}
      className="space-y-6 md:w-[25rem]"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <IconUser size={32} className="text-text" />
        </motion.div>
        <h2 className="text-2xl font-bold text-text mb-2">Choose Username</h2>
        <p className="text-muted">Pick a unique username for your account</p>
      </div>

      <FormInput
        name="username"
        control={control}
        label="Username"
        placeholder="Enter your username"
        startContent={<span className="text-gray-400">@</span>}
        endContent={getEndContent()}
        isRequired
      />

      <div className="text-xs text-gray-500">
        Username must be 3-20 characters long and can only contain letters,
        numbers, and underscores.
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="bordered"
          size="md"
          radius="sm"
          onPress={onBack}
          className="min-w-24 border-primary text-primary"
        >
          Back
        </Button>
        <Button
          color="primary"
          size="md"
          radius="sm"
          onPress={handleNext}
          className="min-w-24"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default StepTwo;
