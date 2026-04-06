"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import TagChip from "@/components/ui/TagChip";
import ToastNotice from "@/components/ui/ToastNotice";
import {
  useGetMeQuery,
} from "@/redux/apis/pagepalEndpoints";
import { applyTheme } from "@/utils/applyTheme";
import { themes } from "@/data/theme";

export function SettingsScreen() {
  const [toastOpen, setToastOpen] = useState(false);
  const [activeThemeId, setActiveThemeId] = useState<string>("warm-light");
  const [washColor, setWashColor] = useState<string | null>(null);
  const { data: me } = useGetMeQuery();

  const themeEntries = useMemo(() => Object.values(themes), []);

  const handleApplyTheme = async (themeId: string) => {
    const theme = themes[themeId];
    if (!theme) return;

    await applyTheme(theme);
    setWashColor(theme.colors["--color-primary"]);
    window.setTimeout(() => setWashColor(null), 300);
    setActiveThemeId(themeId);
    setToastOpen(true);
  };

  return (
    <AppShell zone="D" pageTitle="Settings">
      <section className="space-y-5">
        <section className="space-y-2">
          <h1 className="serif-display text-[22px] text-text">Appearance</h1>
          <p className="text-[13px] text-text-muted">Choose your palette. Applies instantly across the app.</p>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {themeEntries.slice(0, 8).map((theme) => {
              const isActive = theme.id === activeThemeId;
              return (
                <button key={theme.id} type="button" onClick={() => handleApplyTheme(theme.id)} className="space-y-1 text-center">
                  <span
                    className={`relative block h-12 w-full overflow-hidden rounded-[10px] border ${isActive ? "ring-2 ring-primary" : ""}`}
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <span
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors["--color-primary"]} 0 49%, ${theme.colors["--color-bg"]} 51% 100%)`,
                      }}
                    />
                  </span>
                  <span className="block font-mono text-[10px] text-text-muted">{theme.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="h-px w-full bg-divider" />

        <section className="space-y-2">
          <h2 className="serif-display text-base text-text">Account</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-divider py-2 text-sm">
              <span className="text-text-muted">Email address</span>
              <span>{me?.email ? `${me.email}` : "Not available"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-divider py-2 text-sm">
              <span className="text-text-muted">Password</span>
              <button type="button" className="text-primary">Change</button>
            </div>
            <div className="flex items-center justify-between border-b border-divider py-2 text-sm">
              <span className="text-text-muted">Role</span>
              <TagChip label={me?.role ?? "USER"} zoneStyle="catalog" />
            </div>
            {me?.role === "USER" ? (
              <div className="flex items-center justify-between border-b border-divider py-2 text-sm">
                <span className="text-text-muted">Author status</span>
                <Link href="/author/apply" className="text-primary">
                  Apply to become an author
                </Link>
              </div>
            ) : null}
          </div>

          <button type="button" className="pt-2 text-sm text-error">
            Delete account
          </button>
        </section>
      </section>

      {washColor ? (
        <div
          className="pointer-events-none fixed inset-0 z-[90]"
          style={{
            backgroundColor: washColor,
            animation: "toast-enter 300ms ease-out",
            opacity: 0.15,
          }}
        />
      ) : null}

      <ToastNotice open={toastOpen} onClose={() => setToastOpen(false)} message="Palette changed." />
    </AppShell>
  );
}