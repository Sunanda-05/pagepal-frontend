import { cookies } from "next/headers";
import ThemePicker from "@/components/shared/theme/ThemePicker";

export default async function ThemePickerPage() {
  const cookieStore = await cookies();
  const theme = cookieStore.get("mode")?.value || "light";

  const themeId = theme.split("theme-")[1] || "light";

  return <ThemePicker initialTheme={themeId} />;
}
