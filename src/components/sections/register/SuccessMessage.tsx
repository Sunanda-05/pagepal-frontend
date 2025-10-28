import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@heroui/button';
import { IconCheck } from '@tabler/icons-react';

interface SuccessMessageProps {
  onReset?: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ onReset }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <IconCheck size={40} className="text-white" />
      </motion.div>
      
      <h2 className="text-2xl font-bold text-white mb-4">Account Created!</h2>
      <p className="text-gray-400 mb-8">
        Your account has been successfully created. You can now sign in.
      </p>
      
      {onReset && (
        <Button
          color="primary"
          size="lg"
          onPress={onReset}
        >
          Create Another Account
        </Button>
      )}
    </motion.div>
  );
};

export default SuccessMessage;
