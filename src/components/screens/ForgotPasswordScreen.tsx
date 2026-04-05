"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@heroui/button";

export function ForgotPasswordScreen() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h1 className="serif-display text-2xl text-text">Forgot password</h1>
        <p className="mt-1 text-sm text-text-muted">
          Enter your email and we will send a reset link.
        </p>
        <form className="mt-5 space-y-3">
          <input
            className="w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm outline-none"
            placeholder="Email"
          />
          <Button color="primary" className="w-full">
            Send reset link
          </Button>
        </form>
        <Link href="/login" className="mt-3 block text-sm text-text-muted">
          Back to login
        </Link>
      </section>
    </main>
  );
}
