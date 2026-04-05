"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/button";
import BookCover from "@/components/ui/BookCover";
import EmptyState from "@/components/ui/EmptyState";
import StarRating from "@/components/ui/StarRating";
import TagChip from "@/components/ui/TagChip";
import { Book } from "@/types/pagepal";


export function DiscoverStackHero({
  books,
  onSave,
}: {
  books: Book[];
  onSave?: (book: Book) => void;
}) {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [animating, setAnimating] = useState(false);
  const pointerStartRef = useRef<number | null>(null);

  if (books.length === 0) {
    return <EmptyState title="No books to browse." subtitle="Try updating your filters." />;
  }

  const front = books[index % books.length];
  const middle = books[(index + 1) % books.length];
  const back = books[(index + 2) % books.length];

  const dragDistance = Math.abs(dragX);
  const cueOpacity = Math.min(1, dragDistance / 60);

  const advance = (direction: "left" | "right") => {
    if (animating) return;
    setAnimating(true);
    setDragX(direction === "right" ? window.innerWidth : -window.innerWidth);

    window.setTimeout(() => {
      if (direction === "right") {
        onSave?.(front);
      }
      setIndex((prev) => prev + 1);
      setDragX(0);
      setAnimating(false);
    }, 300);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (animating) return;
    pointerStartRef.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartRef.current === null || animating) return;
    setDragX(event.clientX - pointerStartRef.current);
  };

  const onPointerUp = () => {
    if (pointerStartRef.current === null || animating) return;
    const threshold = 80;
    const finalDrag = dragX;
    pointerStartRef.current = null;

    if (Math.abs(finalDrag) > threshold) {
      advance(finalDrag > 0 ? "right" : "left");
      return;
    }

    setDragX(0);
  };

  return (
    <section className="relative h-[240px] w-full select-none">
      <article aria-label={`Upcoming: ${back.title}`} className="absolute inset-x-4 top-4 rounded-2xl border border-border bg-surface" style={{ transform: "translateY(16px) scale(0.88)", height: "206px" }} />
      <article aria-label={`Upcoming: ${middle.title}`} className="absolute inset-x-4 top-4 rounded-2xl border border-border bg-surface" style={{ transform: "translateY(8px) scale(0.94)", height: "206px" }} />

      <article
        className="absolute inset-x-4 top-4 rounded-2xl border border-border bg-[var(--color-primary-subtle)] p-4"
        style={{
          height: "206px",
          transform: `translateX(${dragX}px) rotate(${dragX / 20}deg)`,
          transition: animating
            ? "transform 300ms ease-in"
            : pointerStartRef.current === null
            ? "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)"
            : "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <span className="pointer-events-none absolute left-3 top-3 text-xs text-error" style={{ opacity: dragX < 0 ? cueOpacity : 0 }}>
          Skip
        </span>
        <span className="pointer-events-none absolute right-3 top-3 text-xs text-success" style={{ opacity: dragX > 0 ? cueOpacity : 0 }}>
          Save
        </span>

        <div className="grid h-full grid-cols-[120px_1fr] gap-4">
          <BookCover title={front.title} seed={front.id} size="lg" />
          <div className="flex min-w-0 flex-col">
            <TagChip label={front.genre} zoneStyle="catalog" />
            <h3 className="serif-display mt-2 line-clamp-2 text-[18px] leading-6 text-text">{front.title}</h3>
            <p className="mt-1 truncate text-[13px] text-text-muted">{front.authorName}</p>
            <div className="mt-2">
              <StarRating value={front.avgRating} size="md" count={front.reviewCount} />
            </div>
            <Button className="mt-auto" color="primary" radius="sm" onPress={() => onSave?.(front)}>
              Want to read
            </Button>
            <Link href={`/books/${front.id}`} className="mt-2 text-xs text-primary">
              See details
            </Link>
          </div>
        </div>
      </article>
    </section>
  );
}

