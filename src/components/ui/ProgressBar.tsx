import React from "react";

interface ProgressBarProps {
  value: number;
  className?: string;
  animate?: boolean;
}

export default function ProgressBar({ value, className = "", animate = true }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={`progress-track ${className}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeValue} aria-label={`Progress ${safeValue}%`}>
      <div
        className="progress-fill"
        style={{ width: `${safeValue}%`, transitionDuration: animate ? "600ms" : "0ms" }}
      />
    </div>
  );
}
