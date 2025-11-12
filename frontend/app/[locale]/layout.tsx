import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Header } from "@/components/shared/Header";
import "../globals.css";
import { LocaleLayoutProps } from "@/types/shared";
import { ModalProvider } from "@/components/providers/modal-provider";
import { Footer } from "@/components/shared/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NXInventra",
  description:
    "An open-source dynamic inventory management system designed for small to medium-sized businesses.",
  icons: {
    icon: "/logos/nocillax-logo-light.png",
  },
};

const inter = Inter({ subsets: ["latin"] });

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <ModalProvider />
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
