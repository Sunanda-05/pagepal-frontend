"use client"

import React from "react";
import { motion } from "framer-motion";
import { IconCheck } from "@tabler/icons-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
  orientation: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  onStepClick,
  orientation = "horizontal",
}) => {
  const steps = [
    { number: 1, title: "Your details", subtitle: "" },
    { number: 2, title: "Choose", subtitle: "Username" },
    { number: 3, title: "Create", subtitle: "Password" },
  ];

  return (
    <div
      className={`flex ${
        orientation === "horizontal" ? "mb-8" : "flex-col"
      } items-center justify-center`}
    >
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div
            className={`flex ${
              orientation === "horizontal" ? "flex-col" : " justify-center"
            } items-center`}
          >
            <motion.div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer
                transition-colors duration-200 ${
                  orientation === "horizontal" ? "mb-2" : ""
                }
                ${
                  step.number === currentStep
                    ? "bg-accent-light text-text"
                    : step.number < currentStep
                    ? "bg-success"
                    : "bg-primary-light text-bg"
                }
              `}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onStepClick?.(step.number)}
            >
              {step.number < currentStep ? (
                <IconCheck size={16} />
              ) : (
                step.number
              )}
            </motion.div>
            <div className="text-center px-2">
              <div className="text-primary font-medium text-sm">
                {step.title}
              </div>
              {step.subtitle && (
                <div className="text-primary text-xs">{step.subtitle}</div>
              )}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`${
                orientation === "horizontal" ? "w-16 h-0.5 mb-8" : "h-16 w-0.5 mx-4 "
              } bg-gray-600 my-4`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;
