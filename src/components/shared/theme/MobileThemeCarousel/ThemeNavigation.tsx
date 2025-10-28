import { MobileThemeNavigationProps } from "@/types/theme";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

export default function ThemeNavigation({
  currentIndex,
  themeCount,
  themeArray,
  handleNext,
  handlePrevious,
}: MobileThemeNavigationProps) {
  return (
    <div className="absolute bottom-6 left-0 right-0 px-6">
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="p-2 rounded-full transition-all duration-300 disabled:opacity-30"
          style={{
            backgroundColor: "var(--color-surface-secondary)",
            color: "var(--color-text)",
          }}
        >
          <IconChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-2">
          {themeArray.map((_, idx) => (
            <div
              key={idx}
              className="transition-all duration-300 rounded-full"
              style={{
                width: currentIndex === idx ? "32px" : "8px",
                height: "8px",
                backgroundColor:
                  currentIndex === idx
                    ? "var(--color-primary)"
                    : "var(--color-border)",
              }}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === themeCount - 1}
          className="p-2 rounded-full transition-all duration-300 disabled:opacity-30"
          style={{
            backgroundColor: "var(--color-surface-secondary)",
            color: "var(--color-text)",
          }}
        >
          <IconChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
