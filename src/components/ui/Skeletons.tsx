import React from "react";

export function BookCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="skeleton-shimmer h-[112px] w-[82px] rounded-md" />
      <div className="mt-3 space-y-2">
        <div className="skeleton-shimmer h-3 w-4/5 rounded" />
        <div className="skeleton-shimmer h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function FeedItemSkeleton() {
  return (
    <div className="flex items-start gap-3 border-b border-divider py-4">
      <div className="skeleton-shimmer h-8 w-8 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="skeleton-shimmer h-3 w-[70%] rounded" />
        <div className="skeleton-shimmer h-3 w-[90%] rounded" />
        <div className="skeleton-shimmer h-3 w-[60%] rounded" />
      </div>
    </div>
  );
}

export function ReviewCardSkeleton() {
  return (
    <div className="border-b border-divider py-4">
      <div className="flex items-center gap-3">
        <div className="skeleton-shimmer h-11 w-11 rounded-full" />
        <div className="space-y-2">
          <div className="skeleton-shimmer h-3 w-28 rounded" />
          <div className="skeleton-shimmer h-3 w-20 rounded" />
        </div>
      </div>
      <div className="mt-3 flex gap-1">
        <div className="skeleton-shimmer h-4 w-4 rounded" />
        <div className="skeleton-shimmer h-4 w-4 rounded" />
        <div className="skeleton-shimmer h-4 w-4 rounded" />
        <div className="skeleton-shimmer h-4 w-4 rounded" />
        <div className="skeleton-shimmer h-4 w-4 rounded" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="skeleton-shimmer h-3 w-[92%] rounded" />
        <div className="skeleton-shimmer h-3 w-[84%] rounded" />
        <div className="skeleton-shimmer h-3 w-[68%] rounded" />
      </div>
    </div>
  );
}
