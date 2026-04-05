"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import RoleGate from "@/components/ui/RoleGate";
import ToastNotice from "@/components/ui/ToastNotice";
import {
  useCreateBookMutation,
  useGetBookByIdQuery,
  usePatchBookMutation,
} from "@/redux/apis/pagepalEndpoints";
import BookEditorForm from "@/components/forms/BookEditorForm";
import { BookFormValues } from "@/schemas/pagepalForms";

export function AuthorManageBookFormScreen({ bookId }: { bookId?: string }) {
  const [toastOpen, setToastOpen] = useState(false);
  const { data: currentBook } = useGetBookByIdQuery(bookId ?? "", { skip: !bookId });
  const [createBook, { isLoading: creating }] = useCreateBookMutation();
  const [patchBook, { isLoading: updating }] = usePatchBookMutation();

  const initialValues = currentBook
    ? {
        title: currentBook.title,
        description: currentBook.description,
        genre: currentBook.genre,
        publishedYear: currentBook.year,
        isbn: currentBook.isbn,
      }
    : undefined;

  const handleSubmit = async (values: BookFormValues) => {
    const { coverColor, ...payload } = values;
    void coverColor;

    if (bookId) {
      await patchBook({ id: bookId, ...payload }).unwrap();
    } else {
      await createBook(payload).unwrap();
    }

    setToastOpen(true);
  };

  return (
    <AppShell zone="C" pageTitle={bookId ? "Edit Book" : "New Book"}>
      <RoleGate allow={["AUTHOR", "ADMIN"]}>
        <section className="space-y-4">
          <h1 className="serif-display text-2xl text-text">{bookId ? "Edit Book" : "Create New Book"}</h1>
          <BookEditorForm initialValues={initialValues} onSubmit={handleSubmit} isSubmitting={creating || updating} />
        </section>
      </RoleGate>
      <ToastNotice open={toastOpen} onClose={() => setToastOpen(false)} message="Book saved." />
    </AppShell>
  );
}