"use client";

import React, { useMemo, useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  count?: number;
}

const displaySizeMap: Record<NonNullable<StarRatingProps["size"]>, number> = {
  sm: 14,
  md: 16,
  lg: 20,
};

const interactiveSizeMap: Record<NonNullable<StarRatingProps["size"]>, number> = {
  sm: 18,
  md: 22,
  lg: 22,
};

export default function StarRating({
  value,
  onChange,
  size = "md",
  className = "",
  count,
}: StarRatingProps) {
  const clampedValue = Math.max(0, Math.min(5, value));
  const interactive = typeof onChange === "function";
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  const renderValue = useMemo(() => {
    if (!interactive) return clampedValue;
    if (hoveredValue === null) return clampedValue;
    return hoveredValue;
  }, [clampedValue, hoveredValue, interactive]);

  const fontSize = interactive ? interactiveSizeMap[size] : displaySizeMap[size];

  if (interactive) {
    const rounded = Math.round(renderValue);

    return (
      <div className={`star-rating ${className}`}>
        <div className="star-rating-row" style={{ fontSize: `${fontSize}px` }}>
          {Array.from({ length: 5 }, (_, index) => {
            const score = index + 1;
            const filled = score <= rounded;

            return (
              <button
                key={score}
                type="button"
                className={`star-action ${filled ? "filled" : ""}`}
                style={{ transitionDelay: `${index * 60}ms` }}
                onMouseEnter={() => setHoveredValue(score)}
                onFocus={() => setHoveredValue(score)}
                onMouseLeave={() => setHoveredValue(null)}
                onBlur={() => setHoveredValue(null)}
                onClick={() => onChange?.(Math.round(clampedValue) === score ? 0 : score)}
                aria-label={`Rate ${score} star${score === 1 ? "" : "s"}`}
              >
                ★
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`star-rating ${className}`}>
      <div className="star-rating-row" style={{ fontSize: `${fontSize}px` }}>
        {Array.from({ length: 5 }, (_, index) => {
          const fillPercent = Math.max(0, Math.min(1, clampedValue - index)) * 100;

          return (
            <span key={index} className="star-shell" aria-hidden="true">
              <span className="star-empty">★</span>
              <span className="star-filled" style={{ width: `${fillPercent}%` }}>
                ★
              </span>
            </span>
          );
        })}
      </div>
      <span className="star-meta">{clampedValue.toFixed(1)}{typeof count === "number" ? ` (${count})` : ""}</span>
    </div>
  );
}
