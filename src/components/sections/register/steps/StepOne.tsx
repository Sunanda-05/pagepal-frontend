import React from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/button";
import { IconMail, IconUser } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import FormInput from "../../../base/FormInput";
import { FormData } from "../../../../types/form";
import { stepOneSchema } from "../../../../schemas/validation";
import Image from "next/image";

interface StepOneProps {
  onNext: () => void;
}

const StepOne: React.FC<StepOneProps> = ({ onNext }) => {
  const { control, trigger } = useFormContext<FormData>();

  const handleNext = async () => {
    const isValid = await trigger(["email", "firstName", "lastName"]);
    if (isValid) {
      onNext();
    }
  };

  return (
    //     <motion.div
    //       initial={{ opacity: 0, x: 50 }}
    //       animate={{ opacity: 1, x: 0 }}
    //       exit={{ opacity: 0, x: -50 }}
    //       transition={{ duration: 0.3 }}
    //       className="space-y-6"
    //     >
    <div className="space-y-6 max-w-md w-full">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <IconUser size={32} className="text-primary" />
        </motion.div>
        <h2 className="text-2xl font-bold text-text mb-2">Your details</h2>
        <p className="text-muted">Please enter your name and email</p>
      </div>

      <FormInput
        name="email"
        control={control}
        label="Email"
        type="email"
        placeholder="Enter your email"
        startContent={<IconMail size={18} className="text-gray-400" />}
        isRequired
      />

      <FormInput
        name="firstName"
        control={control}
        label="First Name"
        placeholder="Enter your first name"
        isRequired
      />

      <FormInput
        name="lastName"
        control={control}
        label="Last Name"
        placeholder="Enter your last name"
        isRequired
      />

      <div className="flex justify-between pt-4">
        <Button
          variant="bordered"
          size="md"
          radius="sm"
          onPress={handleNext}
          className="min-w-24 border-muted text-muted"
          disabled
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
    // </motion.div>
  );
};

export default StepOne;
