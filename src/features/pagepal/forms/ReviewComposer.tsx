"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@heroui/button";
import StarRating from "@/components/ui/StarRating";
import {
  reviewFormSchema,
  ReviewFormValues,
} from "@/schemas/pagepalForms";

interface ReviewComposerProps {
  onSubmit: (values: ReviewFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

export default function ReviewComposer({
  onSubmit,
  isSubmitting = false,
}: ReviewComposerProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    mode: "onChange",
    defaultValues: {
      rating: 0,
      text: "",
    },
  });

  const handleValidSubmit = async (values: ReviewFormValues) => {
    await onSubmit(values);
    reset({ rating: 0, text: "" });
  };

  return (
    <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-3 rounded-2xl border border-border bg-surface p-4">
      <p className="section-kicker">Write a review</p>

      <Controller
        name="rating"
        control={control}
        render={({ field }) => (
          <div>
            <StarRating value={field.value} onChange={field.onChange} size="lg" />
            {errors.rating ? <p className="mt-1 text-xs text-error">{errors.rating.message}</p> : null}
          </div>
        )}
      />

      <div>
        <textarea
          {...register("text")}
          rows={4}
          className="w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary"
          placeholder="What stayed with you after reading this?"
        />
        {errors.text ? <p className="mt-1 text-xs text-error">{errors.text.message}</p> : null}
      </div>

      <Button type="submit" color="primary" radius="sm" isLoading={isSubmitting} isDisabled={!isValid || isSubmitting}>
        Save review
      </Button>
    </form>
  );
}
