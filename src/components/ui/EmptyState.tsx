import React from "react";
import Link from "next/link";
import { Button } from "@heroui/button";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
}

export default function EmptyState({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  onCtaClick,
}: EmptyStateProps) {
  const resolvedLabel = ctaLabel ?? "Explore books";
  const resolvedHref = ctaHref ?? (onCtaClick ? undefined : "/discover");

  return (
    <div className="empty-state rounded-2xl border border-border bg-surface px-5 py-8">
      <div className="empty-shape" />
      <p className="serif-display text-base text-text">{title}</p>
      {subtitle ? <p className="mt-2 text-[13px] leading-[1.6] text-text-muted">{subtitle}</p> : null}
      <div className="mt-4">
        {resolvedHref ? (
          <Button as={Link} href={resolvedHref} color="primary" radius="full" size="sm">
            {resolvedLabel}
          </Button>
        ) : (
          <Button color="primary" radius="full" size="sm" onPress={onCtaClick}>
            {resolvedLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
