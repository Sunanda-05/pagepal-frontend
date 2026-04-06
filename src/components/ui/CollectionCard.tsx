import React from "react";
import Link from "next/link";
import { Collection, Book } from "@/types/pagepal";
import UserAvatar from "@/components/ui/UserAvatar";
import BookCover from "@/components/ui/BookCover";

interface CollectionCardProps {
  collection: Collection;
  books?: Book[];
}

function visibilityLabel(value: Collection["visibility"]): string {
  if (value === "public") return "Public";
  if (value === "shared") return "Shared";
  return "Private";
}

function visibilityClass(value: Collection["visibility"]): string {
  if (value === "public") return "bg-[var(--color-primary-subtle)] text-[var(--color-primary-text)]";
  if (value === "shared") return "bg-[var(--color-accent-subtle)] text-[var(--color-accent-text)]";
  return "border border-border bg-surface text-text-secondary";
}

export default function CollectionCard({ collection, books }: CollectionCardProps) {
  const sourceBooks = books?.length
    ? books.map((book) => ({ id: book.id, title: book.title }))
    : collection.books
        .map((entry) => entry.book)
        .filter((book): book is NonNullable<(typeof collection.books)[number]["book"]> => Boolean(book))
        .map((book) => ({ id: book.id, title: book.title }));
  const visibleCovers = sourceBooks.slice(0, 4);
  const mosaicSlots = Array.from({ length: 4 }, (_slot, index) => visibleCovers[index] ?? null);

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="block rounded-xl border border-border bg-surface-secondary p-3 transition-all duration-200 hover:border-primary/45"
    >
      <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          {mosaicSlots.map((book, index) =>
            book ? (
              <BookCover
                key={`${collection.id}-${book.id}`}
                title={book.title}
                seed={book.id}
                size="xs"
                className="h-full w-full"
                hideTitle
              />
            ) : (
              <div
                key={`${collection.id}-placeholder-${index}`}
                className="flex aspect-[4/5] items-center justify-center rounded-md border border-dashed border-border bg-surface-secondary"
              >
                {visibleCovers.length === 0 && index === 0 ? (
                  <div className="empty-shape scale-50" />
                ) : null}
              </div>
            )
          )}
        </div>
        <span className={`absolute bottom-2 right-2 rounded-full px-2 py-0.5 text-[10px] ${visibilityClass(collection.visibility)}`}>
          {visibilityLabel(collection.visibility)}
        </span>
      </div>

      <h3 className="serif-display mt-3 line-clamp-2 text-[15px] text-text">{collection.name}</h3>

      <div className="mt-2 flex items-center gap-2">
        <UserAvatar name={collection.ownerName} size="xs" />
        <span className="truncate text-xs text-text-secondary">{collection.ownerName}</span>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="mono-meta">{collection.books.length} books</span>
        <span className="text-text-secondary">by {collection.ownerName}</span>
      </div>
    </Link>
  );
}
