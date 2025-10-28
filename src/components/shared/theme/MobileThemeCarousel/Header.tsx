import { IconChevronLeft } from "@tabler/icons-react";

export default function Header() {
  return (
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
  );
}
