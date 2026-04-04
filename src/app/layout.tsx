import type { Metadata } from "next";
import { Geist } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import ThemeProvider from "@/components/ThemeProvider";
import BackToTop from "@/components/BackToTop";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Montréal Uncovered",
    template: "%s | Montréal Uncovered",
  },
  description:
    "Le média digital montréalais — culture, société, actualités locales et bien plus.",
  keywords: ["Montréal", "Québec", "actualités", "culture", "événements"],
  openGraph: {
    title: "Montréal Uncovered",
    description: "Le média digital montréalais",
    url: "https://montrealuncovered.com",
    siteName: "Montréal Uncovered",
    locale: "fr_CA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <SessionProvider>
          <ThemeProvider>
            {children}
            <BackToTop />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
