"use client";

import React from "react";
import { UserRole } from "@/types/pagepal";
import { useRole } from "@/hooks/useRole";
import { Button } from "@heroui/button";
import Link from "next/link";

interface RoleGateProps {
  allow: UserRole[];
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export default function RoleGate({
  allow,
  children,
  fallbackTitle = "This page is not available for your role.",
  fallbackDescription = "If you think this is a mistake, sign in with an account that has permission.",
}: RoleGateProps) {
  const role = useRole();

  if (allow.includes(role)) {
    return <>{children}</>;
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 text-center">
      <h2 className="serif-display text-xl text-text">{fallbackTitle}</h2>
      <p className="mt-2 text-sm text-text-muted">{fallbackDescription}</p>
      <div className="mt-4">
        <Button as={Link} href="/login" color="primary" radius="sm">
          Sign in
        </Button>
      </div>
    </section>
  );
}
