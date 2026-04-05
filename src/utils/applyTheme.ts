import { Theme } from "@/types/theme";

export async function applyTheme(theme: Theme) {
  const modeClass = `theme-${theme.id}`;
  const body = document.body;

  for (const className of Array.from(body.classList)) {
    if (className.startsWith("theme-")) {
      body.classList.remove(className);
    }
  }

  body.classList.add(modeClass);

  for (const [token, value] of Object.entries(theme.colors)) {
    document.documentElement.style.setProperty(token, value);
  }

  await fetch("/api/theme", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: modeClass }),
  }).catch(() => undefined);
}
