import { HeroUIProvider } from "@heroui/system";
import ReduxProvider from "@/providers/reduxProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ReduxProvider>{children}</ReduxProvider>
    </HeroUIProvider>
  );
}
