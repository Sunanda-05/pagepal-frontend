"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@heroui/button";
import {
  adminRejectSchema,
  AdminRejectValues,
} from "@/schemas/pagepalForms";

interface RejectApplicationInlineFormProps {
  onSubmit: (values: AdminRejectValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

export default function RejectApplicationInlineForm({
  onSubmit,
  isSubmitting = false,
}: RejectApplicationInlineFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<AdminRejectValues>({
    resolver: zodResolver(adminRejectSchema),
    mode: "onChange",
    defaultValues: {
      reason: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 rounded-xl border border-danger/40 bg-danger/5 p-3">
      <label htmlFor="reject-reason" className="text-sm text-text-muted">
        Rejection reason
      </label>
      <textarea
        id="reject-reason"
        rows={3}
        {...register("reason")}
        className="w-full rounded-lg border border-danger/30 bg-surface px-3 py-2 text-sm text-text outline-none focus:border-danger"
      />
      {errors.reason ? <p className="text-xs text-error">{errors.reason.message}</p> : null}
      <Button type="submit" color="danger" radius="sm" isLoading={isSubmitting} isDisabled={!isValid || isSubmitting}>
        Confirm rejection
      </Button>
    </form>
  );
}
