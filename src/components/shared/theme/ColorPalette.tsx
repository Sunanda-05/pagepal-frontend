import { ColorPaletteProps } from "@/types/theme";

export default function ColorPalette({ colors }: ColorPaletteProps) {
  return (
    <div>
      <h3
        className="text-sm font-semibold mb-3 transition-colors duration-300"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Color Palette
      </h3>
      <div className="flex gap-2 flex-wrap">
        {Object.keys(colors)
          .slice(0, 8)
          .map((key, idx) => (
            <div
              key={idx}
              className="w-10 h-10 rounded-lg transition-all duration-300"
              style={{
                backgroundColor: colors[key],
                boxShadow: `0 2px 8px ${colors[key]}40`,
                border: "2px solid var(--color-border)",
              }}
            />
          ))}
      </div>
    </div>
  );
}
