"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  findGenreValueByLabel,
  GENRE_OPTIONS,
  isValidGenreValue,
  toGenreLabel,
} from "@/data/genres";

interface GenreSearchSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function GenreSearchSelect({
  id,
  value,
  onChange,
  placeholder = "Search genre",
  disabled = false,
  className,
}: GenreSearchSelectProps) {
  const [query, setQuery] = useState(value ? toGenreLabel(value) : "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(value ? toGenreLabel(value) : "");
  }, [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GENRE_OPTIONS;
    return GENRE_OPTIONS.filter((item) => item.label.toLowerCase().includes(q));
  }, [query]);

  const selectGenre = (nextValue: string) => {
    onChange(nextValue);
    setQuery(toGenreLabel(nextValue));
    setOpen(false);
  };

  const handleBlur = () => {
    window.setTimeout(() => {
      setOpen(false);

      const exact = findGenreValueByLabel(query);
      if (exact) {
        onChange(exact);
        setQuery(toGenreLabel(exact));
        return;
      }

      if (query.trim() === "") {
        onChange("");
        setQuery("");
        return;
      }

      if (isValidGenreValue(value)) {
        setQuery(toGenreLabel(value));
      } else {
        onChange("");
        setQuery("");
      }
    }, 120);
  };

  return (
    <div className={`relative ${className ?? ""}`}>
      <input
        id={id}
        type="text"
        value={query}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        onChange={(event) => {
          const nextQuery = event.target.value;
          setQuery(nextQuery);
          setOpen(true);

          if (nextQuery.trim() === "") {
            onChange("");
          }
        }}
        className="w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm text-text outline-none focus:border-primary"
      />

      {open ? (
        <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-lg">
          {filtered.length === 0 ? (
            <p className="px-2 py-2 text-xs text-text-muted">No matching genre found.</p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.value}
                type="button"
                className="w-full rounded-lg px-2 py-1.5 text-left text-sm text-text hover:bg-surface-secondary"
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectGenre(item.value);
                }}
              >
                {item.label}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
