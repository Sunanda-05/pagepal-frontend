"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconCompass, IconFriends, IconHome, IconUserCircle } from "@tabler/icons-react";
import { useRole } from "@/hooks/useRole";
import { UserRole } from "@/types/pagepal";
import { themes } from "@/data/theme";

interface AppShellProps {
  zone: "A" | "B" | "C" | "D" | "E";
  pageTitle: string;
  actionSlot?: React.ReactNode;
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  roles?: UserRole[];
}

const navGroups: Array<{ title?: string; items: NavItem[] }> = [
  {
    items: [
      { href: "/", label: "Home" },
      { href: "/discover", label: "Discover" },
      { href: "/discover/recommendations", label: "Recommendations" },
    ],
  },
  {
    title: "Social",
    items: [
      { href: "/friends", label: "Friends" },
      { href: "/collections/me", label: "Collections" },
      { href: "/collections/public", label: "Public Collections" },
    ],
  },
  {
    title: "My Space",
    items: [
      { href: "/profile/me", label: "My Profile" },
      { href: "/collections/me", label: "My Collections" },
      { href: "/collections/shared", label: "Shared with Me" },
    ],
  },
  {
    items: [{ href: "/author/manage", label: "My Books", roles: ["AUTHOR", "ADMIN"] }],
  },
  {
    items: [{ href: "/admin", label: "The Desk", roles: ["ADMIN"] }],
  },
  {
    items: [{ href: "/settings", label: "Settings" }],
  },
];

function zoneClass(zone: AppShellProps["zone"]): string {
  return `zone-${zone.toLowerCase()}`;
}

function isVisible(item: NavItem, role: UserRole): boolean {
  if (!item.roles) return true;
  return item.roles.includes(role);
}

export default function AppShell({
  zone,
  pageTitle,
  actionSlot,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const role = useRole();
  const [scrolled, setScrolled] = useState(false);
  const themeSwatches = Object.values(themes).slice(0, 8);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const mobileTabs = [
    { href: "/", label: "Shelf", icon: IconHome },
    { href: "/discover", label: "Discover", icon: IconCompass },
    { href: "/friends", label: "Friends", icon: IconFriends },
    { href: "/profile/me", label: "Profile", icon: IconUserCircle },
  ];

  return (
    <div className={`${zoneClass(zone)} min-h-screen pb-20 lg:pb-8`}>
      <div className="app-page-shell lg:flex lg:gap-8">
        <aside className="hidden w-[12.5rem] shrink-0 py-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="wordmark">PagePal</p>
            <nav className="mt-8 space-y-5">
              {navGroups.map((group, index) => (
                <section key={`group-${index}`} className="space-y-2">
                  {group.title ? <p className="text-xs uppercase tracking-[0.12em] text-text-muted">{group.title}</p> : null}
                  <div className="flex flex-col">
                    {group.items
                      .filter((item) => isVisible(item, role))
                      .map((item) => {
                        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="desktop-sidebar-link text-sm"
                            data-active={active}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                  </div>
                </section>
              ))}
            </nav>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.12em] text-text-muted">Palette</p>
            <div className="grid grid-cols-4 gap-1">
              {themeSwatches.map((theme) => (
                <span
                  key={theme.id}
                  className="h-4 w-5 rounded-sm border border-border"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors["--color-primary"]} 0 49%, ${theme.colors["--color-bg"]} 51% 100%)`,
                  }}
                />
              ))}
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className={`top-bar ${scrolled ? "scrolled" : ""} lg:hidden`}>
            <h1 className="serif-display text-[20px] text-text">{pageTitle}</h1>
            <div>{actionSlot}</div>
          </header>

          <div className="content-column py-4 lg:py-8">{children}</div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-surface/95 px-3 py-2 backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {mobileTabs.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            const Icon = tab.icon;
            return (
              <Link key={tab.href} href={tab.href} className="mobile-bottom-tab" data-active={active}>
                <Icon size={18} />
                <span>{tab.label}</span>
                <span className="mobile-bottom-tab-dot" />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
