"use client";

import React, { useEffect, useState } from "react";

interface TagChipProps {
  label: string;
  zoneStyle?: "catalog" | "pill";
  isActive?: boolean;
  onClick?: () => void;
}

export default function TagChip({
  label,
  zoneStyle = "pill",
  isActive = false,
  onClick,
}: TagChipProps) {
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    setPop(true);
    const timer = window.setTimeout(() => setPop(false), 220);
    return () => window.clearTimeout(timer);
  }, [isActive]);

  const baseClass = zoneStyle === "catalog" ? "catalog-chip" : "pill-chip";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClass} whitespace-nowrap ${isActive ? "chip-active" : ""} ${pop ? "chip-pop" : ""}`}
      aria-pressed={isActive}
    >
      {label}
    </button>
  );
}
