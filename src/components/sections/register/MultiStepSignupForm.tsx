"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FormProvider } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
const StepIndicator = dynamic(() => import("@/components/sections/register/StepIndicator"), {
  ssr: false,
});
import StepOne from "@/components/sections/register/steps/StepOne";
import StepTwo from "@/components/sections/register/steps/StepTwo";
import StepThree from "@/components/sections/register/steps/StepThree";
import SuccessMessage from "@/components/sections/register/SuccessMessage";
import { useIsMobile } from "@/hooks/useResponsive";
import { useRegisterMutation } from "@/redux/apis/authApi";

const MultiStepSignupForm: React.FC = () => {
  const { currentStep, direction, nextStep, prevStep, goToStep, form } =
    useMultiStepForm();
    const [register, { isSuccess }] = useRegisterMutation()
  const [isCompleted, setIsCompleted] = useState(true);

  const isMobile = useIsMobile();

  const handleComplete = async () => {
    await register(form.getValues());
    if(isSuccess)
    setIsCompleted(true);
  };

  const handleReset = () => {
    setIsCompleted(false);
    form.reset();
    goToStep(1);
  };

  const renderStep = () => {
    if (isCompleted) {
      return <SuccessMessage onReset={handleReset} />;
    }

    switch (currentStep) {
      case 1:
        return <StepOne onNext={nextStep} />;
      case 2:
        return <StepTwo onNext={nextStep} onBack={prevStep} />;
      case 3:
        return <StepThree onBack={prevStep} onSubmit={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-bg p-4 flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full flex-1 flex flex-col"
      >
        {!isCompleted && (
          <div className="text-right mb-6">
            <Link href="#" className="text-gray-400 hover:text-white text-sm">
              Already have an account?{" "}
              <span className="text-primary">Sign in→</span>
            </Link>
          </div>
        )}

        <FormProvider {...form}>
          <div className={`flex grow flex-col md:flex-row`}>
            {!isCompleted && (
              <div className="flex-1/4 my-auto">
                <StepIndicator
                  currentStep={currentStep}
                  totalSteps={3}
                  orientation={isMobile ? "horizontal" : "vertical"}
                />
              </div>
            )}

            <div className="flex-3/4 h-fit my-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isCompleted ? "success" : currentStep}
                  initial={{
                    opacity: 0,
                    x: direction === "forward" ? 50 : -50,
                  }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction === "forward" ? -50 : 50 }}
                  transition={{ duration: 0.3 }}
                  className=" flex flex-col items-center"
                >
                  {renderStep()}
                  {!isCompleted && (
                    <div className="flex justify-center mt-8">
                      <div className="flex space-x-2">
                        {Array.from({ length: 3 }, (_, i) => (
                          <motion.div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i + 1 === currentStep
                                ? "bg-accent-light"
                                : "bg-primary-light"
                            }`}
                            animate={{
                              scale: i + 1 === currentStep ? 1.2 : 1,
                            }}
                            transition={{ duration: 0.2 }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </FormProvider>
      </motion.div>
    </div>
  );
};

export default MultiStepSignupForm;
