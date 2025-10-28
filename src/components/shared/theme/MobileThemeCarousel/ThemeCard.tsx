import { MobileThemeCardProps } from "@/types/theme";
import ApplyButton from "../ApplyButton";
import ColorPalette from "../ColorPalette";



export default function ThemeCard({
  theme,
  appliedTheme,
  isDragging,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onApply,
}: MobileThemeCardProps) {
  const isApplied = appliedTheme.id === theme.id;

  return (
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
        {/* Image & Text */}
        <div className="relative h-3/5 overflow-hidden">
          <img
            src={theme.image}
            alt={theme.name}
            className="w-full h-full object-cover transition-transform duration-700"
            style={{ transform: isDragging ? "scale(1.05)" : "scale(1)" }}
          />
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, var(--color-overlay) 100%)`,
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">
              {theme.name}
            </h2>
            <p className="text-base text-white/90 drop-shadow">
              {theme.description}
            </p>
          </div>

          {/* Apply Button */}
          <div
            className="absolute top-6 right-6 p-3 rounded-full transition-all duration-300 bg-primary text-bg"
            style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)" }}
          >
            {/* <button
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
            </button> */}
            <ApplyButton
                isApplied={isApplied}
                onApply={onApply}
                theme={theme}
              />
          </div>
        </div>

        {/* Palette */}
        <div className="h-2/5 p-6 flex flex-col justify-between">
          <ColorPalette colors={theme.colors} />
        </div>
      </div>
    </div>
  );
}
