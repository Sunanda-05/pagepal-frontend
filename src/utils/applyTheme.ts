import { useEffect } from "react";
import { Theme } from "@/types/theme";

export async function applyTheme(theme: Theme) {
  await fetch("/api/theme", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: `theme-${theme.id}` }),
  });

  // Optional: reload the page to apply server-side theme immediately
  window.location.reload();
}
