import React from "react";
import Link from "next/link";
import { Book } from "@/types/pagepal";
import StarRating from "@/components/ui/StarRating";
import TagChip from "@/components/ui/TagChip";
import BookCover from "@/components/ui/BookCover";

interface BookCardProps {
  book: Book;
  size?: "compact" | "full";
  showDescription?: boolean;
  matchStrength?: number;
}

export default function BookCard({
  book,
  size = "compact",
  showDescription = false,
  matchStrength,
}: BookCardProps) {
  const compact = size === "compact";
  const strength = typeof matchStrength === "number" ? Math.max(0, Math.min(100, matchStrength)) : null;

  return (
    <Link
      href={`/books/${book.id}`}
      className={`book-hoverable block rounded-xl border border-border bg-surface p-3 transition-all duration-200 hover:border-primary/45 ${compact ? "" : "p-4"}`}
    >
      <div className={`flex ${compact ? "flex-col" : "gap-4"}`}>
        <BookCover title={book.title} seed={`${book.title}-${book.authorName}`} size={compact ? "sm" : "lg"} className={compact ? "mx-auto" : "shrink-0"} />

        <div className={`min-w-0 ${compact ? "mt-3" : "flex-1"}`}>
          <h3 className="serif-display line-clamp-2 text-[0.98rem] leading-5 text-text">
            {book.title}
          </h3>
          <p className="book-title-secondary mt-1 truncate text-[11px] text-text-muted">{book.authorName}</p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {book.tags.slice(0, compact ? 1 : 3).map((tag) => (
              <TagChip key={`${book.id}-${tag}`} label={tag} zoneStyle={compact ? "catalog" : "pill"} />
            ))}
          </div>

          <div className="mt-2">
            <StarRating value={book.avgRating} size={compact ? "sm" : "md"} count={book.reviewCount} />
          </div>

          {!compact && showDescription ? (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-text-muted">{book.description}</p>
          ) : null}

          {!compact ? (
            <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
              <span className="mono-meta">{book.year}</span>
              <span className="mono-meta">ISBN {book.isbn}</span>
            </div>
          ) : null}

          {strength !== null ? (
            <div className="mt-3">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${strength}%` }} />
              </div>
              <p className="mono-meta mt-1">{strength >= 70 ? "Strong match" : "Good match"}</p>
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
