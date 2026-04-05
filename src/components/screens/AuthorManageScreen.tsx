"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  IconPlus,
} from "@tabler/icons-react";
import { Button } from "@heroui/button";
import AppShell from "@/components/layout/AppShell";
import RoleGate from "@/components/ui/RoleGate";
import BookCover from "@/components/ui/BookCover";
import EmptyState from "@/components/ui/EmptyState";
import StarRating from "@/components/ui/StarRating";
import TagChip from "@/components/ui/TagChip";
import BottomSheet from "@/components/ui/BottomSheet";
import {
  useDeleteBookMutation,
  useGetFilteredBooksQuery,
  useGetMeQuery,
} from "@/redux/apis/pagepalEndpoints";

export function AuthorManageScreen() {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteBook, { isLoading }] = useDeleteBookMutation();
  const { data: me } = useGetMeQuery();
  const { data } = useGetFilteredBooksQuery(
    {
      page: 1,
      limit: 24,
      authorName: me?.displayName,
    },
    { skip: !me?.displayName }
  );

  const books = data?.items ?? [];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteBook({ id: deleteTarget }).unwrap();
    setDeleteTarget(null);
  };

  return (
    <AppShell zone="C" pageTitle="My Books" actionSlot={<Link href="/author/manage/new"><IconPlus size={18} className="text-text-muted" /></Link>}>
      <RoleGate allow={["AUTHOR", "ADMIN"]}>
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="serif-display text-[20px] text-text">My books</h2>
              <p className="text-[13px] text-text-muted">You&apos;ve published {books.length} books</p>
            </div>
            <Button as={Link} href="/author/manage/new" size="sm" color="primary">
              New book
            </Button>
          </div>

          {books.length === 0 ? (
            <EmptyState title="No books found for this author." />
          ) : (
            <div className="space-y-0">
              {books.map((book) => (
                <article key={book.id} className="flex items-center gap-3 border-b border-divider py-3">
                  <BookCover title={book.title} seed={book.id} size="sm" hideTitle />
                  <div className="min-w-0 flex-1">
                    <p className="serif-display truncate text-[15px] text-text">{book.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <TagChip label={book.genre} zoneStyle="catalog" />
                      <StarRating value={book.avgRating} size="sm" count={book.reviewCount} />
                    </div>
                  </div>
                  <Button as={Link} href={`/author/manage/${book.id}/edit`} size="sm" variant="light">
                    Edit
                  </Button>
                  <Button size="sm" color="danger" variant="light" onPress={() => setDeleteTarget(book.id)}>
                    Delete
                  </Button>
                </article>
              ))}
            </div>
          )}
        </section>

        <BottomSheet isOpen={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)} title="Delete this book?">
          <p className="text-sm text-text-muted">This will remove all reviews and ratings for this title.</p>
          <Button className="mt-3" color="danger" onPress={handleDelete} isLoading={isLoading}>
            Delete permanently
          </Button>
        </BottomSheet>
      </RoleGate>
    </AppShell>
  );
}