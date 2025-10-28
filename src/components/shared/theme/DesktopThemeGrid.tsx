import { IconCheck, IconPalette } from "@tabler/icons-react";
import { Theme } from "@/types/theme";

interface DesktopThemeGridProps {
  selectedTheme: Theme;
  appliedTheme?: Theme;
  themeArray: Theme[];
  handleThemeSelect: (theme: Theme, index: number) => void;
  handleThemeApply?: (theme: Theme) => void;
}

export default function DesktopThemeGrid({
  selectedTheme,
  appliedTheme,
  themeArray,
  handleThemeSelect,
  handleThemeApply,
}: DesktopThemeGridProps) {
  return (
    <div className="hidden lg:block min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="p-3 rounded-xl transition-colors duration-300"
              style={{ backgroundColor: "var(--color-surface)" }}
            >
              <IconPalette
                className="w-8 h-8"
                style={{ color: "var(--color-primary)" }}
              />
            </div>
          </div>
          <h1
            className="text-4xl font-bold mb-3 transition-colors duration-300"
            style={{ color: "var(--color-text)" }}
          >
            Choose Your Reading Theme
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto transition-colors duration-300"
            style={{ color: "var(--color-text-muted)" }}
          >
            Select a theme that matches your mood and enhance your book review
            experience
          </p>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
          {themeArray.map((theme, index) => {
            const isSelected = selectedTheme.id === theme.id;
            const isApplied = appliedTheme?.id === theme.id;
            return (
              <div
                key={theme.id}
                className="group relative text-left transition-all duration-500 hover:scale-100"
                style={{
                  transform: isSelected
                    ? "scale(1.05) rotateY(-2deg)"
                    : "scale(1)",
                  transformStyle: "preserve-3d",
                  perspective: "1000px",
                }}
              >
                {/* Overlay button to make the whole card clickable and keyboard-accessible */}
                <button
                  type="button"
                  onClick={() => handleThemeSelect(theme, index)}
                  aria-label={`Select ${theme.name} theme`}
                  aria-pressed={isSelected}
                  className="absolute inset-0 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    background: "transparent",
                    // Using CSS variables to keep theming consistent
                    // @ts-ignore - CSS var not known to TS
                    ["--tw-ring-color" as any]: "var(--color-primary)",
                  }}
                />

                <div
                  className="rounded-2xl overflow-hidden transition-all duration-500"
                  style={{
                    boxShadow: isSelected
                      ? `
                          0 25px 50px -12px var(--color-shadow),
                          0 12px 24px -8px var(--color-shadow),
                          10px 10px 20px -10px var(--color-shadow)
                        `
                      : `0 4px 6px -1px var(--color-shadow)`,
                    backgroundColor: "var(--color-surface)",
                    borderWidth: "2px",
                    borderStyle: "solid",
                    borderColor: isSelected
                      ? "var(--color-primary)"
                      : "var(--color-border)",
                    transform: isSelected
                      ? "translateZ(20px)"
                      : "translateZ(0)",
                  }}
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={theme.image}
                      alt={theme.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-120"
                    />

                    <div
                      className="absolute inset-0 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(to bottom, transparent 0%, var(--color-overlay) 100%)`,
                        opacity: isSelected ? 0.8 : 0.6,
                      }}
                    />

                    {isSelected && (
                      <div className="absolute top-4 right-4 p-2 rounded-full transition-all duration-300 bg-primary text-bg">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleThemeApply?.(theme);
                          }}
                          className="w-full flex gap-1 items-center justify-center cursor-pointer px-1"
                          disabled={isApplied}
                        >
                          {isApplied ? "Applied" : "Apply"}
                          <IconCheck className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {!isSelected && isApplied && (
                      <div className="absolute top-4 right-4 p-2 rounded-full transition-all duration-300 bg-primary text-bg">
                        <IconCheck className="w-5 h-5" />
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-xl font-bold mb-1 text-white">
                        {theme.name}
                      </h3>
                      <p className="text-sm text-white/90">
                        {theme.description}
                      </p>
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="p-5">
                    <div className="flex gap-2 flex-wrap">
                      {Object.keys(theme.colors)
                        .slice(0, 6)
                        .map((key, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded-lg transition-all duration-300"
                            style={{
                              backgroundColor: theme.colors[key],
                              boxShadow: `0 2px 6px ${theme.colors[key]}30`,
                              border: "1px solid var(--color-border)",
                            }}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
