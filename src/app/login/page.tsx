"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { loginSchema, LoginFormData } from "@/schemas/validation";
import { useLoginMutation } from "@/redux/apis/authApi";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const handleFormSubmit = async (values: LoginFormData) => {
    setServerError(null);
    try {
      await login(values).unwrap();
      router.push("/");
    } catch {
      setServerError("Unable to sign in with those credentials.");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[380px] flex-col justify-center px-4 pt-20 md:pt-28">
      <header className="text-center">
        <p className="wordmark text-[24px]">PagePal</p>
        <p className="mt-1 text-[13px] text-text-muted">Sign in to continue</p>
        <div className="mx-auto mt-3 h-px w-10 bg-border" />
      </header>

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="mt-6 space-y-4"
      >
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-text">Email</label>
          <Input id="email" type="email" variant="bordered" radius="lg" className="w-full" {...register("email")} />
          {errors.email ? <p className="mt-1 text-xs text-error">{errors.email.message}</p> : null}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-text">Password</label>
          <Input id="password" type={showPassword ? "text" : "password"} variant="bordered" radius="lg" className="w-full" {...register("password")} />
          {errors.password ? <p className="mt-1 text-xs text-error">{errors.password.message}</p> : null}
          <button type="button" className="mt-1 text-xs text-text-muted" onClick={() => setShowPassword((prev) => !prev)}>
            {showPassword ? "Hide password" : "Show password"}
          </button>
        </div>

        <div className="text-right">
          <Link href="/forgot-password" className="text-xs text-text-muted">
            Forgot password?
          </Link>
        </div>

        {serverError ? <p className="text-xs text-error">{serverError}</p> : null}

        <Button
          color="primary"
          size="lg"
          radius="full"
          type="submit"
          className="h-12 w-full"
          isLoading={isLoading}
          isDisabled={!isValid || isLoading}
        >
          Sign in
        </Button>

        <p className="text-center text-[13px] text-text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}