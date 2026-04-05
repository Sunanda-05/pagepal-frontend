"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@heroui/button";
import {
  authorApplySchema,
  AuthorApplyValues,
} from "@/schemas/pagepalForms";

interface AuthorApplicationFormProps {
  onSubmit: (values: AuthorApplyValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

export default function AuthorApplicationForm({
  onSubmit,
  isSubmitting = false,
}: AuthorApplicationFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<AuthorApplyValues>({
    resolver: zodResolver(authorApplySchema),
    mode: "onChange",
    defaultValues: {
      bio: "",
      writingHistory: "",
    },
  });

  const bioValue = watch("bio") ?? "";
  const writingValue = watch("writingHistory") ?? "";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-border bg-surface p-4">
      <div>
        <label className="mb-1 block text-sm text-text">Why do you want to be an author?</label>
        <textarea
          rows={6}
          {...register("bio")}
          className="w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm text-text outline-none focus:border-primary"
          placeholder="Tell us what you write and what readers can expect from your work."
        />
        <p className="mt-1 text-right text-[11px] text-text-muted">{(bioValue ?? "").length}/1500</p>
        {errors.bio ? <p className="mt-1 text-xs text-error">{errors.bio.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm text-text">What have you written?</label>
        <textarea
          rows={4}
          {...register("writingHistory")}
          className="w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm text-text outline-none focus:border-primary"
          placeholder="Optional: publications, genres, or notable writing projects."
        />
        <p className="mt-1 text-right text-[11px] text-text-muted">{(writingValue ?? "").length}/1200</p>
      </div>

      <Button type="submit" color="primary" radius="full" className="w-full" isLoading={isSubmitting} isDisabled={!isValid || isSubmitting}>
        Submit application
      </Button>
      <p className="text-center text-[12px] text-text-muted">You&apos;ll hear back within a few days.</p>
    </form>
  );
}
