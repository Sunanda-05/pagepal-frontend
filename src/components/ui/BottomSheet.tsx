"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  children: React.ReactNode;
}

export default function BottomSheet({
  isOpen,
  onOpenChange,
  title,
  children,
}: BottomSheetProps) {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{ startY: number; startOffset: number } | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");

    const syncMode = (event?: MediaQueryListEvent) => {
      setIsDesktop(event ? event.matches : media.matches);
    };

    syncMode();
    media.addEventListener("change", syncMode);
    return () => media.removeEventListener("change", syncMode);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setIsClosing(false);
      setDragOffset(0);
      return;
    }

    if (!isMounted) return;
    setIsClosing(true);
    const timer = window.setTimeout(() => {
      setIsMounted(false);
      setIsClosing(false);
      setDragOffset(0);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [isMounted, isOpen]);

  useEffect(() => {
    if (!isMounted) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMounted]);

  const closeSheet = () => onOpenChange(false);

  const releaseDrag = (clientY: number) => {
    if (isDesktop) return;

    const dragState = dragStateRef.current;
    const sheetHeight = sheetRef.current?.offsetHeight ?? 1;

    if (!dragState) return;

    const delta = Math.max(0, clientY - dragState.startY + dragState.startOffset);
    setIsDragging(false);

    if (delta > sheetHeight * 0.4) {
      closeSheet();
      return;
    }

    setDragOffset(0);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (isDesktop) return;

    const dragState = dragStateRef.current;
    if (!dragState) return;
    const delta = Math.max(0, event.clientY - dragState.startY + dragState.startOffset);
    setDragOffset(delta);
  };

  const onPointerUp = (event: PointerEvent) => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    releaseDrag(event.clientY);
    dragStateRef.current = null;
  };

  const onDragStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (isDesktop) return;

    setIsDragging(true);
    dragStateRef.current = {
      startY: event.clientY,
      startOffset: dragOffset,
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const sheetTransform = useMemo(() => {
    if (isDesktop) {
      return isClosing ? "translateX(100%)" : "translateX(0)";
    }

    if (isClosing) return "translateY(100%)";
    return `translateY(${dragOffset}px)`;
  }, [dragOffset, isClosing, isDesktop]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-[80] flex ${isDesktop ? "items-stretch justify-end" : "items-end"}`}>
      <button
        type="button"
        className={`bottom-sheet-backdrop absolute inset-0 transition-opacity duration-200 ${isClosing ? "opacity-0" : "opacity-100"}`}
        onClick={closeSheet}
        aria-label="Dismiss"
      />

      <section
        ref={sheetRef}
        className={`relative z-[81] border border-border bg-surface shadow-2xl ${
          isDesktop ? "h-full w-full max-w-[420px] rounded-l-2xl" : "w-full rounded-t-2xl"
        }`}
        style={{
          maxHeight: isDesktop ? "100vh" : "75vh",
          transform: sheetTransform,
          transition: isDragging ? "none" : "transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <header className={`flex px-4 pb-2 pt-3 ${isDesktop ? "items-center justify-between" : "flex-col items-center gap-3"}`}>
          {!isDesktop ? (
            <button type="button" onPointerDown={onDragStart} aria-label="Drag handle">
              <span className="bottom-sheet-handle" />
            </button>
          ) : null}
          <h3 className="serif-display text-lg text-text">{title}</h3>
          {isDesktop ? (
            <button
              type="button"
              className="rounded-full border border-border px-3 py-1 text-xs text-text-muted"
              onClick={closeSheet}
            >
              Close
            </button>
          ) : null}
        </header>

        <div className={`${isDesktop ? "max-h-[calc(100vh-72px)]" : "max-h-[calc(75vh-110px)]"} overflow-y-auto px-4 pb-4`}>{children}</div>
      </section>
    </div>
  );
}
