"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IconX } from "@tabler/icons-react";

interface ToastNoticeProps {
  message: string;
  open: boolean;
  onClose: () => void;
}

export default function ToastNotice({ message, open, onClose }: ToastNoticeProps) {
  const [queue, setQueue] = useState<string[]>([]);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!open || !message.trim()) return;

    setQueue((prev) => {
      if (prev[prev.length - 1] === message) return prev;
      return [...prev, message];
    });
  }, [message, open]);

  const activeMessage = queue[0] ?? null;

  const closeCurrent = useCallback(() => {
    if (!activeMessage) return;
    setIsExiting(true);
    window.setTimeout(() => {
      setQueue((prev) => prev.slice(1));
      setIsExiting(false);
      onClose();
    }, 160);
  }, [activeMessage, onClose]);

  useEffect(() => {
    if (!activeMessage || isExiting) return;

    const timer = window.setTimeout(() => {
      closeCurrent();
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [activeMessage, closeCurrent, isExiting]);

  const frameClass = useMemo(() => {
    if (!activeMessage) return "";
    return isExiting ? "toast-exit" : "toast-enter";
  }, [activeMessage, isExiting]);

  if (!activeMessage) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4">
      <div className={`toast-frame ${frameClass} pointer-events-auto flex items-center justify-between gap-3`}>
        <p>{activeMessage}</p>
        <button type="button" onClick={closeCurrent} aria-label="Close toast">
          <IconX size={16} />
        </button>
        <span className="toast-timer" />
      </div>
    </div>
  );
}
