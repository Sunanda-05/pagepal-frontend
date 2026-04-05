import React from "react";
import { Button } from "@heroui/button";

interface LoadMoreButtonProps {
  onClick: () => void;
  label: string;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export default function LoadMoreButton({
  onClick,
  label,
  isLoading = false,
  isDisabled = false,
}: LoadMoreButtonProps) {
  return (
    <div className="flex justify-center pt-3">
      <Button
        variant="bordered"
        radius="full"
        onPress={onClick}
        isLoading={isLoading}
        isDisabled={isDisabled}
        className="border-border bg-surface px-5 text-sm text-text-muted"
      >
        {label}
      </Button>
    </div>
  );
}
