"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@heroui/button";
import Link from "next/link";
import { profileEditSchema, ProfileEditValues } from "@/schemas/pagepalForms";

interface ProfileEditFormProps {
  initialValues: ProfileEditValues;
  onSubmit: (values: ProfileEditValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

export default function ProfileEditForm({
  initialValues,
  onSubmit,
  isSubmitting = false,
}: ProfileEditFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ProfileEditValues>({
    resolver: zodResolver(profileEditSchema),
    mode: "onChange",
    defaultValues: initialValues,
  });

  const bioLength = (watch("bio") ?? "").length;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-border bg-surface p-4">
      <div>
        <label className="text-sm text-text-muted" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          {...register("name")}
          className="mt-1 w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm text-text outline-none focus:border-primary"
        />
        {errors.name ? <p className="mt-1 text-xs text-error">{errors.name.message}</p> : null}
      </div>

      <div>
        <label className="text-sm text-text-muted" htmlFor="bio">
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          {...register("bio")}
          className="mt-1 w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm text-text outline-none focus:border-primary"
        />
        <p className="mt-1 text-right text-[11px] text-text-muted">{bioLength}/160</p>
        {errors.bio ? <p className="mt-1 text-xs text-error">{errors.bio.message}</p> : null}
      </div>

      <div>
        <label className="text-sm text-text-muted" htmlFor="avatar">
          Avatar upload
        </label>
        <input id="avatar" type="file" accept="image/*" className="mt-1 block w-full text-sm text-text-muted" />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" color="primary" radius="full" className="w-full" isLoading={isSubmitting} isDisabled={!isValid || isSubmitting}>
          Save changes
        </Button>
        <Link href="/profile/me" className="text-sm text-text-muted">
          Cancel
        </Link>
      </div>
    </form>
  );
}
