"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@heroui/button";
import {
  collectionFormSchema,
  CollectionFormValues,
} from "@/schemas/pagepalForms";

interface CollectionFormProps {
  initialValues?: CollectionFormValues;
  submitLabel?: string;
  onSubmit: (values: CollectionFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  disableName?: boolean;
}

const defaults: CollectionFormValues = {
  name: "",
  description: "",
  isPublic: true,
};

export default function CollectionForm({
  initialValues,
  submitLabel = "Save collection",
  onSubmit,
  isSubmitting = false,
  disableName = false,
}: CollectionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionFormSchema),
    mode: "onChange",
    defaultValues: { ...defaults, ...initialValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label htmlFor="collection-name" className="text-sm text-text-muted">
          Name
        </label>
        <input
          id="collection-name"
          {...register("name")}
          disabled={disableName}
          className="mt-1 w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm text-text outline-none focus:border-primary"
        />
        {errors.name ? <p className="mt-1 text-xs text-error">{errors.name.message}</p> : null}
        {disableName ? <p className="mt-1 text-xs text-text-muted">Shelf name is locked.</p> : null}
      </div>

      <div>
        <label htmlFor="collection-description" className="text-sm text-text-muted">
          Description
        </label>
        <textarea
          id="collection-description"
          rows={4}
          {...register("description")}
          className="mt-1 w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm text-text outline-none focus:border-primary"
        />
        {errors.description ? <p className="mt-1 text-xs text-error">{errors.description.message}</p> : null}
      </div>

      <div>
        <label htmlFor="collection-visibility" className="text-sm text-text-muted">
          Visibility
        </label>
        <select
          id="collection-visibility"
          {...register("isPublic", {
            setValueAs: (value) => value === "true",
          })}
          className="mt-1 w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm text-text outline-none focus:border-primary"
        >
          <option value="true">Public</option>
          <option value="false">Private</option>
        </select>
        {errors.isPublic ? <p className="mt-1 text-xs text-error">{errors.isPublic.message}</p> : null}
      </div>

      <Button type="submit" color="primary" radius="sm" isLoading={isSubmitting} isDisabled={!isValid || isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
