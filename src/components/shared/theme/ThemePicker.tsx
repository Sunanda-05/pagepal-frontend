"use client";

import { applyTheme } from "@/utils/applyTheme";
import { useThemeCarousel } from "@/hooks/theme/useThemeCarousel";
import MobileThemeCarousel from "./MobileThemeCarousel";
import DesktopThemeGrid from "./DesktopThemeGrid";
import { Theme } from "@/types/theme";

export default function ThemePicker({
  initialTheme,
}: {
  initialTheme: string;
}) {
  const {
    themeArray,
    selectedTheme,
    appliedTheme,
    currentIndex,
    handleNext,
    handlePrevious,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    handleThemeSelect,
    isDragging,
  } = useThemeCarousel(initialTheme);

  const handleThemeApply = async (theme: Theme) => {
    await applyTheme(theme);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-700 ease-in-out theme-${selectedTheme.id} p-4`}
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      <MobileThemeCarousel
        selectedTheme={selectedTheme}
        appliedTheme={appliedTheme}
        currentIndex={currentIndex}
        themeArray={themeArray}
        handleNext={handleNext}
        handlePrevious={handlePrevious}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        isDragging={isDragging}
        handleThemeApply={handleThemeApply}
      />

      <DesktopThemeGrid
        selectedTheme={selectedTheme}
        appliedTheme={appliedTheme}
        themeArray={themeArray}
        handleThemeSelect={handleThemeSelect}
        handleThemeApply={handleThemeApply}
      />
    </div>
  );
}
