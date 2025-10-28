import { Theme } from "@/types/theme";
import { IconCheck } from "@tabler/icons-react";

const ApplyButton = ({
  isApplied,
  onApply,
  theme,
}: {
  isApplied: boolean;
  onApply?: (theme: Theme) => void;
  theme: Theme;
}) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onApply?.(theme);
      }}
      disabled={isApplied}
      className="w-full flex gap-1 items-center justify-center cursor-pointer px-2 py-1 rounded-full bg-primary text-bg text-sm font-medium transition-all duration-300 hover:opacity-90 disabled:opacity-60"
    >
      {isApplied ? "Applied" : "Apply"}
      <IconCheck className="w-4 h-4" />
    </button>
  );
};

export default ApplyButton;