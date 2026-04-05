import React from "react";

export type BookCoverSize = "xs" | "sm" | "lg" | "xl";

interface BookCoverProps {
  title: string;
  seed?: string;
  size?: BookCoverSize;
  className?: string;
  hideTitle?: boolean;
}

interface CoverFamily {
  base: string;
  spine: string;
}

const coverFamilies: CoverFamily[] = [
  { base: "var(--color-primary)", spine: "var(--color-primary-hover)" },
  { base: "var(--color-accent)", spine: "var(--color-accent-text)" },
  { base: "var(--color-highlight)", spine: "var(--color-primary)" },
  { base: "var(--color-primary-light)", spine: "var(--color-primary)" },
  { base: "var(--color-info)", spine: "var(--color-primary-hover)" },
  { base: "var(--color-warning)", spine: "var(--color-accent-text)" },
];

function hashSeed(value: string): number {
  return value.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

export default function BookCover({
  title,
  seed,
  size = "sm",
  className = "",
  hideTitle = false,
}: BookCoverProps) {
  const family = coverFamilies[hashSeed(seed ?? title) % coverFamilies.length];

  return (
    <div
      className={`book-cover cover-${size} ${className}`.trim()}
      style={
        {
          "--cover-base": family.base,
          "--cover-spine": family.spine,
        } as React.CSSProperties
      }
      aria-label={`Cover for ${title}`}
    >
      {!hideTitle ? <span className="book-cover-title">{title}</span> : null}
    </div>
  );
}
