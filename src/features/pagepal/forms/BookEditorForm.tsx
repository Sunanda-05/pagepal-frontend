"use client";

import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@heroui/button";
import { bookFormSchema, BookFormValues } from "@/schemas/pagepalForms";
import GenreSearchSelect from "@/components/ui/GenreSearchSelect";

interface BookEditorFormProps {
  initialValues?: BookFormValues;
  onSubmit: (values: BookFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

const defaultValues: BookFormValues = {
  title: "",
  description: "",
  genre: "",
  publishedYear: new Date().getFullYear(),
  isbn: "",
  coverColor: "var(--color-primary)",
};

const coverSwatches = [
  "#6b4f4f",
  "#4f709c",
  "#2e4a41",
  "#a67b5b",
  "#be123c",
  "#7c3aed",
  "#059669",
  "#171717",
];

export default function BookEditorForm({
  initialValues,
  onSubmit,
  isSubmitting = false,
}: BookEditorFormProps) {
  const mergedDefaults = useMemo(() => ({ ...defaultValues, ...initialValues }), [initialValues]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    mode: "onChange",
    defaultValues: mergedDefaults,
  });

  const activeCoverColor = watch("coverColor") ?? coverSwatches[0];
  const selectedGenre = watch("genre") ?? "";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-border bg-surface p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <label htmlFor="title" className="text-sm text-text-muted">
            Title
          </label>
          <input
            id="title"
            {...register("title")}
            className="mt-1 w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          {errors.title ? <p className="mt-1 text-xs text-error">{errors.title.message}</p> : null}

          <div>
            <label htmlFor="description" className="text-sm text-text-muted">
              Description
            </label>
            <textarea
              id="description"
              rows={6}
              {...register("description")}
              className="mt-1 w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
            {errors.description ? <p className="mt-1 text-xs text-error">{errors.description.message}</p> : null}
          </div>

          <div>
            <label htmlFor="publishedYear" className="text-sm text-text-muted">
              Published Year
            </label>
            <input
              id="publishedYear"
              type="number"
              {...register("publishedYear", { valueAsNumber: true })}
              className="mt-1 w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
            {errors.publishedYear ? <p className="mt-1 text-xs text-error">{errors.publishedYear.message}</p> : null}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="genre" className="text-sm text-text-muted">
              Genre
            </label>
            <GenreSearchSelect
              id="genre"
              className="mt-1"
              value={selectedGenre}
              onChange={(nextGenre) => {
                setValue("genre", nextGenre, { shouldValidate: true, shouldDirty: true });
              }}
              placeholder="Select genre"
            />
            {errors.genre ? <p className="mt-1 text-xs text-error">{errors.genre.message}</p> : null}
          </div>

          <div>
            <label htmlFor="isbn" className="text-sm text-text-muted">
              ISBN
            </label>
            <input
              id="isbn"
              {...register("isbn")}
              className="mono-meta mt-1 w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
            {errors.isbn ? <p className="mt-1 text-xs text-error">{errors.isbn.message}</p> : null}
          </div>

          <div>
            <p className="text-sm text-text-muted">Cover color</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {coverSwatches.map((color) => {
                const active = activeCoverColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue("coverColor", color, { shouldValidate: true })}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border ${active ? "ring-2 ring-primary" : ""}`}
                    style={{ backgroundColor: color }}
                    aria-label={`Cover color ${color}`}
                  >
                    {active ? <span className="text-xs text-white">✓</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-surface-secondary p-3">
        <p className="text-sm text-text">Tags</p>
        <p className="mt-1 text-xs text-text-muted">Add tags after creating the book from the edit screen.</p>
      </section>

      <div>
        <Button type="submit" color="primary" radius="full" className="w-full md:w-auto" isLoading={isSubmitting} isDisabled={!isValid || isSubmitting}>
          Save book
        </Button>
      </div>
    </form>
  );
}
