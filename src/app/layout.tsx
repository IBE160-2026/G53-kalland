import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import "@digdir/designsystemet-css";
import "@/styles/theme/graphite.css";
import "./globals.css";

// Self-hosted by next/font at build time: no font request leaves the app at runtime. Variable weight covers 400–700.
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app");
  return { title: t("name"), description: t("description") };
}

// Light only (DESIGN.md): the theme's dark scheme is never selected.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-color-scheme="light" className={instrumentSans.variable}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
