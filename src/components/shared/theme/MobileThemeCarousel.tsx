import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { Theme } from "@/types/theme";

interface MobileThemeCarouselProps {
  selectedTheme: Theme;
  appliedTheme: Theme;
  currentIndex: number;
  themeArray: Theme[];
  handleNext: () => void;
  handlePrevious: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  handleThemeApply: (theme: Theme) => void;
  isDragging: boolean;
}

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
      {/* Header */}
      <div className="px-4 pt-6 pb-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <IconChevronLeft
            className="w-6 h-6"
            style={{ color: "var(--color-primary)" }}
          />
          <h1
            className="text-2xl font-bold transition-colors duration-300"
            style={{ color: "var(--color-text)" }}
          >
            Choose Theme
          </h1>
        </div>
        <p
          className="text-sm transition-colors duration-300"
          style={{ color: "var(--color-text-muted)" }}
        >
          Swipe to explore themes
        </p>
      </div>

      {/* Carousel */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8 perspective-1000">
        <div
          className="relative w-full max-w-md"
          style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
        >
          <div
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="relative w-full"
            style={{
              transformStyle: "preserve-3d",
              height: "70vh",
              maxHeight: "600px",
            }}
          >
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden transition-all duration-700 ease-out"
              style={{
                transform: isDragging
                  ? "scale(0.98) rotateY(0deg)"
                  : "scale(1) rotateY(-5deg)",
                boxShadow: `
                    0 50px 100px -20px var(--color-shadow),
                    0 30px 60px -30px var(--color-shadow),
                    20px 20px 40px -20px var(--color-shadow)
                  `,
                backgroundColor: "var(--color-surface)",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Image */}
              <div className="relative h-3/5 overflow-hidden">
                <img
                  src={selectedTheme.image}
                  alt={selectedTheme.name}
                  className="w-full h-full object-cover transition-transform duration-700"
                  style={{
                    transform: isDragging ? "scale(1.05)" : "scale(1)",
                  }}
                />
                <div
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(to bottom, transparent 0%, var(--color-overlay) 100%)`,
                  }}
                />

                {/* Name */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">
                    {selectedTheme.name}
                  </h2>
                  <p className="text-base text-white/90 drop-shadow">
                    {selectedTheme.description}
                  </p>
                </div>

                {/* Check */}
                <div
                  className="absolute top-6 right-6 p-3 rounded-full transition-all duration-300 bg-primary text-bg"
                  style={{
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleThemeApply?.(selectedTheme);
                    }}
                    className="w-full flex gap-1 items-center justify-center cursor-pointer px-1"
                    disabled={appliedTheme.id === selectedTheme.id}
                  >
                    {appliedTheme.id === selectedTheme.id ? "Applied" : "Apply"}
                    <IconCheck className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="h-2/5 p-6 flex flex-col justify-between">
                {/* Colors */}
                <div>
                  <h3
                    className="text-sm font-semibold mb-3 transition-colors duration-300"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Color Palette
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {Object.keys(selectedTheme.colors)
                      .slice(0, 8)
                      .map((colorKey, idx) => (
                        <div
                          key={idx}
                          className="w-10 h-10 rounded-lg transition-all duration-300"
                          style={{
                            backgroundColor: selectedTheme.colors[colorKey],
                            boxShadow: `0 2px 8px ${selectedTheme.colors[colorKey]}40`,
                            border: "2px solid var(--color-border)",
                          }}
                        />
                      ))}
                  </div>
                </div>

                {/* Navigation */}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
