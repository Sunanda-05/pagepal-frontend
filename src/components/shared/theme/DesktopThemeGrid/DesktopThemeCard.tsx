import { DesktopThemeCardProps } from "@/types/theme";
import { IconCheck } from "@tabler/icons-react";
import ApplyButton from "../ApplyButton";
import ColorPalette from "../ColorPalette";

const ThemeCard = ({
  theme,
  index,
  isSelected,
  isApplied,
  onSelect,
  onApply,
}: DesktopThemeCardProps) => {
  const handleSelect = () => onSelect(theme, index);

  const transformStyle = isSelected
    ? { transform: "scale(1.05) rotateY(-2deg)" }
    : { transform: "scale(1)" };

  const cardShadow = isSelected
    ? `0 25px 50px -12px var(--color-shadow), 0 12px 24px -8px var(--color-shadow), 10px 10px 20px -10px var(--color-shadow)`
    : `0 4px 6px -1px var(--color-shadow)`;

  const themeImage = theme.image || "/placeholder-theme.jpg";

  return (
    <div
      key={theme.id}
      className="group relative text-left transition-all duration-500 hover:scale-100"
      style={{
        ...transformStyle,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      <button
        type="button"
        onClick={handleSelect}
        aria-label={`Select ${theme.name} theme`}
        aria-pressed={isSelected}
        className="absolute inset-0 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          background: "transparent",
        }}
      />

      <div
        className="rounded-2xl overflow-hidden transition-all duration-500 bg-surface border-2"
        style={{
          boxShadow: cardShadow,
          borderColor: isSelected
            ? "var(--color-primary)"
            : "var(--color-border)",
          transform: isSelected ? "translateZ(20px)" : "translateZ(0)",
        }}
      >
        <div className="relative h-56 overflow-hidden">
          <img
            src={themeImage}
            alt={theme.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, var(--color-overlay) 100%)`,
              opacity: isSelected ? 0.8 : 0.6,
            }}
          />

          <div className="absolute top-4 right-4">
            {isSelected ? (
              <ApplyButton
                isApplied={isApplied}
                onApply={onApply}
                theme={theme}
              />
            ) : (
              isApplied && (
                <div className="p-2 rounded-full bg-primary text-bg">
                  <IconCheck className="w-5 h-5" />
                </div>
              )
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-xl font-bold mb-1 text-white">{theme.name}</h3>
            <p className="text-sm text-white/90">{theme.description}</p>
          </div>
        </div>

        <div className="p-5">
          <ColorPalette colors={theme.colors} />
        </div>
      </div>
    </div>
  );
};

export default ThemeCard;
