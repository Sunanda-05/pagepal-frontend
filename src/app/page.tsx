"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@heroui/button";
import {
  IconEye,
  IconEyeOff,
  IconMail,
  IconLock,
  IconLogin2,
} from "@tabler/icons-react";
import { loginSchema, LoginFormData } from "@/schemas/validation";
import FormInput from "@/components/base/FormInput";
import { useLoginMutation } from "@/redux/apis/authApi";
import { log } from "console";

interface LoginFormProps {
  onSubmitSuccess: (data: LoginFormData) => void;
}

const LoginForm: React.FC<LoginFormProps> = () => {
  // const LoginForm: React.FC<LoginFormProps> = ({ onSubmitSuccess }) => {
  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const { handleSubmit, control } = methods;
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [login, { isLoading, isSuccess, isError, error, data: loginData }] = useLoginMutation();

  const handleFormSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      // Mock API call
      login(data);
      console.log(loginData)
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setIsSubmitting(false);
      console.log({ isSuccess, isError, error });
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-6 md:w-[24rem]"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <IconLogin2 size={32} className="text-text" />
          </motion.div>
          <h2 className="text-2xl font-bold text-text mb-2">Welcome Back</h2>
          <p className="text-muted">Sign in to your account</p>
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

        <div className="flex justify-between items-center text-sm text-gray-400">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="accent-primary" />
            Remember me
          </label>
          <a href="/forgot-password" className="hover:text-primary">
            Forgot password?
          </a>
        </div>

        <Button
          color="primary"
          size="md"
          radius="sm"
          type="submit"
          className="w-full"
          isLoading={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </FormProvider>
  );
};

export default LoginForm;
