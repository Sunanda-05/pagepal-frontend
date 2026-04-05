"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitSuccessful },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    void values;
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[380px] flex-col justify-center px-4 pt-20 md:pt-28">
      <header className="text-center">
        <p className="wordmark text-[24px]">PagePal</p>
        <p className="mt-1 text-[13px] text-text-muted">Reset your password</p>
        <div className="mx-auto mt-3 h-px w-10 bg-border" />
      </header>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-text">Email</label>
          <Input id="email" type="email" variant="bordered" radius="lg" {...register("email")} />
          {errors.email ? <p className="mt-1 text-xs text-error">{errors.email.message}</p> : null}
        </div>

        <Button type="submit" color="primary" radius="full" className="h-12 w-full" isDisabled={!isValid}>
          Send reset link
        </Button>

        {isSubmitSuccessful ? <p className="text-center text-xs text-text-muted">If this account exists, we sent reset instructions.</p> : null}

        <p className="text-center text-[13px] text-text-muted">
          Back to{" "}
          <Link href="/login" className="text-primary">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
