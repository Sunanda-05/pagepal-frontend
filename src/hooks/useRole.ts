"use client";

import { useAppSelector } from "@/redux/hooks";
import { UserRole } from "@/types/pagepal";

export function useRole(): UserRole {
  const role = useAppSelector((state) => state.user.user?.role ?? "GUEST");

  if (role === "USER" || role === "AUTHOR" || role === "ADMIN") {
    return role;
  }

  return "GUEST";
}
