"use client";

import React, { useState } from "react";
import {
  IconAdjustments,
  IconFilter,
  IconSearch,
} from "@tabler/icons-react";
import { Input } from "@heroui/input";
import AppShell from "@/components/layout/AppShell";
import TagChip from "@/components/ui/TagChip";
import ToastNotice from "@/components/ui/ToastNotice";
import GenreSearchSelect from "@/components/ui/GenreSearchSelect";
import {
  useAddBookToCollectionMutation,
  useCreateCollectionMutation,
  useGetBooksByTagQuery,
  useGetFilteredBooksQuery,
  useGetMyCollectionsQuery,
  useGetTagsQuery,
} from "@/redux/apis/pagepalEndpoints";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { Book } from "@/types/pagepal";
import { BooksGrid } from "@/components/shared/BooksGrid";
import { DiscoverStackHero } from "@/components/shared/DiscoverStackHero";
import { isShelfCollectionName } from "@/utils/bookUtil";

export function DiscoverScreen() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("Saved to your shelf.");
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [publishedYear, setPublishedYear] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);
  const debouncedAuthorName = useDebouncedValue(authorName, 350);
  const debouncedPublishedYear = useDebouncedValue(publishedYear, 350);

  const { data: tagsData } = useGetTagsQuery();
  const { data: myCollectionsData } = useGetMyCollectionsQuery();
  const [createCollection] = useCreateCollectionMutation();
  const [addBookToCollection, { isLoading: savingToShelf }] = useAddBookToCollectionMutation();

  const shelfCollection = (myCollectionsData?.items ?? []).find((collection) => isShelfCollectionName(collection.name));

  const { data: filteredData, isLoading: filterLoading } = useGetFilteredBooksQuery({
    page: 1,
    limit: 16,
    search: debouncedSearch || undefined,
    genre: genre || undefined,
    authorName: debouncedAuthorName || undefined,
    publishedYear: debouncedPublishedYear ? Number(debouncedPublishedYear) : undefined,
  });

  const { data: taggedData, isLoading: taggedLoading } = useGetBooksByTagQuery(
    { tagId: activeTag ?? "" },
    { skip: !activeTag }
  );

  const books = activeTag ? taggedData?.items ?? [] : filteredData?.items ?? [];
  const tags = tagsData ?? [];

  const ensureShelfCollection = async () => {
    if (shelfCollection?.id) {
      return shelfCollection.id;
    }

    const created = await createCollection({
      name: "Shelf",
      description: "Your default reading shelf.",
      isPublic: false,
    })
      .unwrap()
      .catch(() => null);

    return created?.id ?? null;
  };

  const handleSaveToShelf = async (book: Book) => {
    const shelfId = await ensureShelfCollection();

    if (!shelfId) {
      setToastMessage("Unable to find your Shelf collection.");
      setToastOpen(true);
      return;
    }

    const success = await addBookToCollection({
      collectionId: shelfId,
      bookId: book.id,
      readingStatus: "want_to_read",
    })
      .unwrap()
      .then(() => true)
      .catch(() => false);

    setToastMessage(success ? `\"${book.title}\" saved to Shelf.` : "Could not save this book to Shelf.");
    setToastOpen(true);
  };

  return (
    <AppShell zone="B" pageTitle="Discover" actionSlot={<IconFilter size={18} className="text-text-muted" />}>
      <section className="space-y-5">
        <div className="rounded-full border border-border bg-surface px-3 py-2">
          <div className="flex items-center gap-2">
            <IconSearch size={16} className="text-text-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search books, authors, genres..."
              className="w-full bg-transparent text-sm text-text outline-none"
            />
            <button type="button" onClick={() => setFilterOpen((prev) => !prev)}>
              <IconAdjustments size={16} className="text-primary" />
            </button>
          </div>
        </div>

        {filterOpen ? (
          <section className="space-y-2 border-b border-border pb-3">
            <div className="grid grid-cols-2 gap-2">
              <GenreSearchSelect
                className="col-span-2"
                value={genre}
                onChange={setGenre}
                placeholder="Genre"
              />
              <Input
                value={authorName}
                onValueChange={setAuthorName}
                variant="bordered"
                radius="sm"
                size="sm"
                placeholder="Author"
              />
              <Input
                value={publishedYear}
                onValueChange={setPublishedYear}
                variant="bordered"
                radius="sm"
                size="sm"
                placeholder="Year"
              />
            </div>
            <p className="text-xs text-text-muted">Filters auto-apply as you type.</p>
            <button
              type="button"
              className="text-xs text-text-muted"
              onClick={() => {
                setSearch("");
                setGenre("");
                setAuthorName("");
                setPublishedYear("");
                setActiveTag(null);
              }}
            >
              Clear
            </button>
          </section>
        ) : null}

        <DiscoverStackHero
          books={books.slice(0, 8)}
          onSave={(book) => {
            if (savingToShelf) return;
            void handleSaveToShelf(book);
          }}
        />

        <div className="shelf-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <TagChip label="All" zoneStyle="catalog" isActive={activeTag === null} onClick={() => setActiveTag(null)} />
          {tags.map((tag) => (
            <TagChip
              key={tag.id}
              label={tag.name}
              zoneStyle="catalog"
              isActive={activeTag === tag.id}
              onClick={() => setActiveTag(activeTag === tag.id ? null : tag.id)}
            />
          ))}
        </div>

        <BooksGrid books={books} isLoading={activeTag ? taggedLoading : filterLoading} />
      </section>

      <ToastNotice open={toastOpen} onClose={() => setToastOpen(false)} message={toastMessage} />
    </AppShell>
  );
}