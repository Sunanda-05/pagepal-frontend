"use client";

import React, { useEffect, useMemo, useState } from "react";
import { IconSearch, IconX } from "@tabler/icons-react";
import UserAvatar from "@/components/ui/UserAvatar";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useSearchUsersQuery } from "@/redux/apis/pagepalEndpoints";
import { PagePalUser } from "@/types/pagepal";

interface UserSearchPickerProps {
  selectedUser: PagePalUser | null;
  onSelectUser: (user: PagePalUser | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  excludedUserIds?: string[];
  limit?: number;
}

function formatUserLabel(user: PagePalUser): string {
  return `${user.displayName} (@${user.username})`;
}

export default function UserSearchPicker({
  selectedUser,
  onSelectUser,
  placeholder = "Search users",
  className,
  disabled = false,
  excludedUserIds = [],
  limit = 10,
}: UserSearchPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const debouncedQuery = useDebouncedValue(query, 300).trim();
  const shouldSearch = open && debouncedQuery.length >= 2;

  const { data, isFetching } = useSearchUsersQuery(
    {
      query: debouncedQuery,
      page: 1,
      limit,
    },
    {
      skip: !shouldSearch,
    }
  );

  const excluded = useMemo(() => new Set(excludedUserIds), [excludedUserIds]);
  const results = useMemo(() => {
    const incoming = data?.data ?? [];
    return incoming.filter((user) => !excluded.has(user.id));
  }, [data, excluded]);

  useEffect(() => {
    if (selectedUser) {
      setQuery(formatUserLabel(selectedUser));
    }
  }, [selectedUser]);

  const handleSelect = (user: PagePalUser) => {
    onSelectUser(user);
    setQuery(formatUserLabel(user));
    setOpen(false);
  };

  const handleClear = () => {
    onSelectUser(null);
    setQuery("");
    setOpen(true);
  };

  return (
    <div className={`relative ${className ?? ""}`}>
      <div className="relative">
        <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={query}
          disabled={disabled}
          autoComplete="off"
          placeholder={placeholder}
          className="w-full rounded-xl border border-border bg-surface px-9 py-2 text-sm text-text outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-70"
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 120);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);

            if (selectedUser) {
              onSelectUser(null);
            }
          }}
        />

        {selectedUser ? (
          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              handleClear();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
            aria-label="Clear selected user"
          >
            <IconX size={16} />
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-lg">
          {debouncedQuery.length < 2 ? (
            <p className="px-2 py-2 text-xs text-text-muted">Type at least 2 characters to search users.</p>
          ) : isFetching ? (
            <p className="px-2 py-2 text-xs text-text-muted">Searching users...</p>
          ) : results.length === 0 ? (
            <p className="px-2 py-2 text-xs text-text-muted">No users found.</p>
          ) : (
            results.map((user) => (
              <button
                key={user.id}
                type="button"
                className="w-full rounded-lg px-2 py-2 text-left hover:bg-surface-secondary"
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(user);
                }}
              >
                <div className="flex items-center gap-2">
                  <UserAvatar name={user.displayName} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-text">{user.displayName}</p>
                    <p className="truncate text-xs text-text-muted">@{user.username}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
