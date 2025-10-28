import { useState } from "react";
import { Theme } from "@/types/theme";
import { themes } from "@/data/theme";

const themeArray = Object.values(themes);
const themeCount = themeArray.length;

export function useThemeCarousel(initialTheme: string) {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(
    themes[initialTheme]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const minSwipeDistance = 50;

  const appliedTheme = themes[initialTheme];

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const index = currentIndex - 1;
      setCurrentIndex(index);
      setSelectedTheme(themeArray[index]);
    }
  };

  const handleNext = () => {
    if (currentIndex < themeCount - 1) {
      const index = currentIndex + 1;
      setCurrentIndex(index);
      setSelectedTheme(themeArray[index]);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
    setIsDragging(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) handleNext();
    if (distance < -minSwipeDistance) handlePrevious();
    setIsDragging(false);
  };

  const handleThemeSelect = (theme: Theme, index: number) => {
    setSelectedTheme(theme);
    setCurrentIndex(index);
  };

  return {
    themeArray,
    themeCount,
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
  };
}
