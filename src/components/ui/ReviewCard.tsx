import React from "react";
import Link from "next/link";
import { Review } from "@/types/pagepal";
import { Book } from "@/types/pagepal";
import StarRating from "@/components/ui/StarRating";
import UserAvatar from "@/components/ui/UserAvatar";
import BookCover from "@/components/ui/BookCover";

interface ReviewCardProps {
  review: Review;
  book?: Book;
  styleType?: "standard" | "pull-quote";
  canEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ReviewCard({
  review,
  book,
  styleType = "standard",
  canEdit = false,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  if (styleType === "pull-quote") {
    return (
      <article className="border-l-[3px] border-l-accent pl-4">
        <p className="serif-display text-[15px] italic leading-7 text-text">{review.text}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
          <UserAvatar name={review.userName} size="xs" />
          <span>{review.userName}</span>
          {typeof review.rating === "number" ? <StarRating value={review.rating} size="sm" /> : null}
          <span className="mono-meta">{new Date(review.createdAt).toLocaleDateString()}</span>
        </div>
      </article>
    );
  }

  return (
    <article className="border-b border-divider py-4">
      <header className="flex items-start gap-3">
        <UserAvatar name={review.userName} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-text">{review.userName}</p>
          <p className="mono-meta mt-0.5">{new Date(review.createdAt).toLocaleDateString()}</p>
        </div>
        {book ? (
          <Link href={`/books/${book.id}`}>
            <BookCover title={book.title} seed={book.id} size="xs" hideTitle />
          </Link>
        ) : null}
      </header>

      <div className="mt-2 flex items-center justify-between gap-3">
        {typeof review.rating === "number" ? <StarRating value={review.rating} size="sm" /> : null}
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <button type="button">Like</button>
          <button type="button">Reply</button>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 text-[13px] leading-6 text-text-muted">{review.text}</p>

      <div className="mt-3 flex items-center justify-between">
        <button type="button" className="text-xs text-primary">
          Read more
        </button>
        {canEdit ? (
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <button type="button" onClick={onEdit}>
              Edit
            </button>
            <button type="button" onClick={onDelete} className="danger-text">
              Delete
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
