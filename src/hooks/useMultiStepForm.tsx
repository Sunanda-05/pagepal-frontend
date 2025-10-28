import { useState, useCallback } from 'react';
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { FormData } from '../types/form';
import { completeFormSchema } from '../schemas/validation';

export const useMultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  
  const form: UseFormReturn<FormData> = useForm<FormData>({
    resolver: zodResolver(completeFormSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const nextStep = useCallback(() => {
    if (currentStep < 3) {
      setDirection('forward');
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setDirection('backward');
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 3) {
      setDirection(step > currentStep ? 'forward' : 'backward');
      setCurrentStep(step);
    }
  }, [currentStep]);

  return {
    currentStep,
    direction,
    nextStep,
    prevStep,
    goToStep,
    form,
    totalSteps: 3,
  };
};
