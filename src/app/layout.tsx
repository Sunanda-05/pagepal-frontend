import type { Metadata } from "next";
import { Poppins, EB_Garamond } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { cookies } from "next/headers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const eb_garamond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-eb-garamond",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PagePal",
  description: "Rate, review Books and discover each other's interests.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const mode = cookieStore.get("mode")?.value || "light";
  console.log(mode);
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${eb_garamond.variable} ${mode} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
