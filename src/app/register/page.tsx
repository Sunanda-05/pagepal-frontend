"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { useLoginMutation, useLogoutMutation, useRegisterMutation } from "@/redux/apis/authApi";
import { useCreateCollectionMutation } from "@/redux/apis/pagepalEndpoints";

const registerSchema = z
  .object({
    displayName: z.string().min(2, "Display name is required").max(60),
    email: z.email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Use uppercase, lowercase, and one number"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

function toUsername(displayName: string): string {
  const normalized = displayName.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_");
  return normalized.slice(0, 20) || "reader";
}

export default function RegisterPage() {
  const router = useRouter();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [logout, { isLoading: logoutLoading }] = useLogoutMutation();
  const [createCollection, { isLoading: shelfLoading }] = useCreateCollectionMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const onSubmit = async (values: RegisterValues) => {
    await registerUser({
      email: values.email,
      password: values.password,
      username: toUsername(values.displayName),
      name: values.displayName,
    }).unwrap();

    await login({ email: values.email, password: values.password }).unwrap();

    await createCollection({
      name: "Shelf",
      description: "Your default reading shelf.",
      isPublic: false,
    })
      .unwrap()
      .catch(() => undefined);

    await logout().unwrap().catch(() => undefined);

    router.push("/login");
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[380px] flex-col justify-center px-4 pt-20 md:pt-28">
      <header className="text-center">
        <p className="wordmark text-[24px]">PagePal</p>
        <p className="mt-1 text-[13px] text-text-muted">Create your account</p>
        <div className="mx-auto mt-3 h-px w-10 bg-border" />
      </header>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="displayName" className="mb-1 block text-sm text-text">Display name</label>
          <Input id="displayName" variant="bordered" radius="lg" {...register("displayName")} />
          {errors.displayName ? <p className="mt-1 text-xs text-error">{errors.displayName.message}</p> : null}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-text">Email</label>
          <Input id="email" type="email" variant="bordered" radius="lg" {...register("email")} />
          {errors.email ? <p className="mt-1 text-xs text-error">{errors.email.message}</p> : null}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-text">Password</label>
          <Input id="password" type="password" variant="bordered" radius="lg" {...register("password")} />
          {errors.password ? <p className="mt-1 text-xs text-error">{errors.password.message}</p> : null}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm text-text">Confirm password</label>
          <Input id="confirmPassword" type="password" variant="bordered" radius="lg" {...register("confirmPassword")} />
          {errors.confirmPassword ? <p className="mt-1 text-xs text-error">{errors.confirmPassword.message}</p> : null}
        </div>

        <Button
          type="submit"
          color="primary"
          radius="full"
          className="h-12 w-full"
          isLoading={isLoading || loginLoading || shelfLoading || logoutLoading}
          isDisabled={!isValid || isLoading || loginLoading || shelfLoading || logoutLoading}
        >
          Create account
        </Button>

        <p className="text-center text-[13px] text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-primary">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}