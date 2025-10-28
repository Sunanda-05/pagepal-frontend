import { MobileThemeCarouselProps } from "@/types/theme";
import Header from "./Header";
import ThemeCard from "./ThemeCard";
import ThemeNavigation from "./ThemeNavigation";

export default function MobileThemeCarousel({
  selectedTheme,
  appliedTheme,
  currentIndex,
  themeArray,
  handleNext,
  handlePrevious,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  isDragging,
  handleThemeApply,
}: MobileThemeCarouselProps) {
  const themeCount = themeArray.length;

  return (
    <div className="lg:hidden min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 pb-8 perspective-1000">
        <div
          className="relative w-full max-w-md"
          style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
        >
          <ThemeCard
            theme={selectedTheme}
            appliedTheme={appliedTheme}
            isDragging={isDragging}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onApply={handleThemeApply}
          />

          <ThemeNavigation
            currentIndex={currentIndex}
            themeCount={themeCount}
            handleNext={handleNext}
            handlePrevious={handlePrevious}
            themeArray={themeArray}
          />
        </div>
      </div>
    </div>
  );
}
