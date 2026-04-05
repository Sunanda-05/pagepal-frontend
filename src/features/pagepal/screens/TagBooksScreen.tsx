"use client";

import React, {  } from "react";
import Link from "next/link";
import AppShell from "@/features/pagepal/layout/AppShell";
import TagChip from "@/components/ui/TagChip";
import {
  useGetBooksByTagQuery,
  useGetTagsQuery,
} from "@/redux/apis/pagepalEndpoints";
import { BooksGrid } from "@/components/shared/BooksGrid";

export function TagBooksScreen({ tagId }: { tagId: string }) {
  const { data, isLoading } = useGetBooksByTagQuery({ tagId });
  const { data: tagsData } = useGetTagsQuery();
  const books = data?.items ?? [];
  const relatedTags = (tagsData ?? []).filter((tag) => tag.id !== tagId).slice(0, 10);
  const activeTagName = (tagsData ?? []).find((tag) => tag.id === tagId)?.name ?? tagId;

  return (
    <AppShell zone="B" pageTitle="Tag Browse">
      <section className="space-y-4">
        <header className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="serif-display text-[20px] text-text">{activeTagName}</h2>
            <TagChip label={activeTagName} zoneStyle="catalog" />
          </div>
          <p className="text-[13px] text-text-muted">{books.length} books tagged with {activeTagName}</p>
        </header>

        <div className="shelf-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {relatedTags.map((tag) => (
            <Link key={tag.id} href={`/tags/${tag.id}`}>
              <TagChip label={tag.name} zoneStyle="catalog" />
            </Link>
          ))}
        </div>

        <BooksGrid books={books} isLoading={isLoading} />
      </section>
    </AppShell>
  );
}
