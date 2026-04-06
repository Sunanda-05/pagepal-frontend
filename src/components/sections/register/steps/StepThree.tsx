import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/button";
import { IconLock, IconEye, IconEyeOff, IconCheck } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import FormInput from "../../../base/FormInput";
import { FormData } from "../../../../types/form";

interface StepThreeProps {
  onBack: () => void;
  onSubmit: () => Promise<void> | void;
  isSubmitting?: boolean;
}

const StepThree: React.FC<StepThreeProps> = ({
  onBack,
  onSubmit,
  isSubmitting = false,
}) => {
  const { control, watch, handleSubmit } = useFormContext<FormData>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const passMatchErr =
    password === confirmPassword ? "" : "Passwords don't match";

  const passwordStrength = {
    hasLength: password?.length >= 8,
    hasLower: /[a-z]/.test(password || ""),
    hasUpper: /[A-Z]/.test(password || ""),
    hasNumber: /\d/.test(password || ""),
  };

  const handleFormSubmit = async () => {
    await onSubmit();
  };

  return (
    <div className="space-y-6 md:w-[25rem]">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <IconLock size={32} className="text-text" />
        </motion.div>
        <h2 className="text-2xl font-bold text-text mb-2">Create Password</h2>
        <p className="text-muted">Choose a strong password for your account</p>
      </div>

      <FormInput
        name="password"
        control={control}
        label="Password"
        type={showPassword ? "text" : "password"}
        placeholder="Enter your password"
        startContent={<IconLock size={18} className="text-gray-400" />}
        endContent={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-white"
          >
            {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
          </button>
        }
        isRequired
      />

      {password && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-2"
        > 
          <div className="text-sm text-gray-300 mb-2">
            Password requirements:
          </div>
          <div className="space-y-1">
            {Object.entries({
              "At least 8 characters": passwordStrength.hasLength,
              "One lowercase letter": passwordStrength.hasLower,
              "One uppercase letter": passwordStrength.hasUpper,
              "One number": passwordStrength.hasNumber,
            }).map(([requirement, met]) => (
              <div key={requirement} className="flex items-center gap-2">
                <IconCheck
                  size={16}
                  className={met ? "text-green-500" : "text-gray-600"}
                />
                <span
                  className={`text-xs ${
                    met ? "text-green-500" : "text-gray-500"
                  }`}
                >
                  {requirement}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <FormInput
        name="confirmPassword"
        control={control}
        label="Confirm Password"
        type={showConfirmPassword ? "text" : "password"}
        placeholder="Confirm your password"
        startContent={<IconLock size={18} className="text-gray-400" />}
        endContent={
          <div className="flex items-center gap-2">
            {confirmPassword && password === confirmPassword && (
              <IconCheck size={18} className="text-green-500" />
            )}
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-white"
            >
              {showConfirmPassword ? (
                <IconEyeOff size={18} />
              ) : (
                <IconEye size={18} />
              )}
            </button>
          </div>
        }
        isRequired
      />

      {passMatchErr && <p className="text-danger text-xs">{passMatchErr}</p>}

      <div className="flex justify-between pt-4">
        <Button
          variant="bordered"
          size="md"
          radius="sm"
          onPress={onBack}
          className="min-w-24 border-primary text-primary"
          isDisabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          color="primary"
          size="md"
          radius="sm"
          onPress={() => {
            void handleSubmit(handleFormSubmit)();
          }}
          className="min-w-24"
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </div>
    </div>
  );
};

export default StepThree;
