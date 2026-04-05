import React from "react";
import Image from "next/image";

interface UserAvatarProps {
  name: string;
  src?: string;
  showReadingRing?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const colorFamilies = [
  { bg: "var(--color-primary)", text: "#ffffff" },
  { bg: "var(--color-accent)", text: "#ffffff" },
  { bg: "var(--color-highlight)", text: "#ffffff" },
  { bg: "var(--color-primary-light)", text: "#ffffff" },
  { bg: "var(--color-info)", text: "#ffffff" },
  { bg: "var(--color-warning)", text: "var(--color-text)" },
] as const;

const sizeMap: Record<NonNullable<UserAvatarProps["size"]>, number> = {
  xs: 24,
  sm: 32,
  md: 44,
  lg: 64,
  xl: 96,
};

function hashName(name: string): number {
  return name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  const first = words[0]?.[0] ?? "U";
  const second = words[1]?.[0] ?? "";
  return `${first}${second}`.toUpperCase();
}

export default function UserAvatar({
  name,
  src,
  showReadingRing = false,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const family = colorFamilies[hashName(name) % colorFamilies.length];
  const px = sizeMap[size];

  return (
    <span
      className={`inline-flex rounded-full ${className}`}
      style={
        showReadingRing
          ? {
              padding: "2px",
              backgroundColor: "var(--color-accent)",
            }
          : undefined
      }
    >
      <span
        className="inline-flex items-center justify-center overflow-hidden rounded-full"
        style={{ width: `${px}px`, height: `${px}px`, backgroundColor: family.bg, color: family.text }}
        aria-label={name}
      >
        {src ? (
          <Image src={src} alt={name} width={px} height={px} className="h-full w-full object-cover" />
        ) : (
          <span style={{ fontSize: `${Math.max(10, Math.round(px * 0.34))}px`, fontWeight: 600 }}>
            {initials(name)}
          </span>
        )}
      </span>
    </span>
  );
}
