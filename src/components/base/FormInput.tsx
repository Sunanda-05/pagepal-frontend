import React from 'react';
import { Input } from '@heroui/input';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { motion } from 'framer-motion';

interface FormInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  type?: string;
  placeholder?: string;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  isRequired?: boolean;
}

const FormInput = <T extends FieldValues>({
  name,
  control,
  label,
  type = 'text',
  placeholder,
  startContent,
  endContent,
  isRequired = false,
}: FormInputProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Input
            {...field}
            type={type}
            label={label}
            placeholder={placeholder}
            isRequired={isRequired}
            isInvalid={!!error}
            errorMessage={error?.message}
            startContent={startContent}
            endContent={endContent}
            variant="bordered"
            classNames={{
              input: "text-text-secondary outline-none",
              inputWrapper: "bg-surface-secondary border-border hover:border-border-light outline-hidden",
              label: "text-muted",
            }}
          />
        </motion.div>
      )}
    />
  );
};

export default FormInput;
