"use client";

import React, { useEffect, useRef, useState } from "react";
import { ReadingStatus } from "@/types/pagepal";

interface ReadingStatusChipProps {
  value: ReadingStatus;
  onChange?: (value: ReadingStatus) => void;
}

const statuses: ReadingStatus[] = ["want_to_read", "reading", "read"];

function label(value: ReadingStatus): string {
  if (value === "want_to_read") return "Want to read";
  if (value === "reading") return "Reading";
  return "Read";
}

export default function ReadingStatusChip({ value, onChange }: ReadingStatusChipProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onDocumentPointerDown = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", onDocumentPointerDown);
    return () => document.removeEventListener("mousedown", onDocumentPointerDown);
  }, [open]);

  const handleSelect = (next: ReadingStatus) => {
    onChange?.(next);
    setOpen(false);
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="reading-status-chip"
        data-status={value}
        aria-label={`Reading status ${label(value)}`}
        aria-expanded={open}
      >
        {label(value)}
      </button>

      {open ? (
        <div className="reading-status-menu">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              className="reading-status-option"
              onClick={() => handleSelect(status)}
            >
              {label(status)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
