import type { Metadata } from "next";
import { Geist, Merriweather } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import ThemeProvider from "@/components/ThemeProvider";
import BackToTop from "@/components/BackToTop";
import AdSenseScript from "@/components/AdSense";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

// URL absolue des images de partage (og:image). Sur Vercel, suit le domaine de production.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    <html
      lang="fr"
      className={`${geistSans.variable} ${merriweather.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Applique le thème avant le premier paint : évite le flash de clair
            au chargement et garantit que les utilitaires dark: sont corrects
            dès le rendu initial. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("mtl-theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <SessionProvider>
          <ThemeProvider>
            {children}
            <BackToTop />
          </ThemeProvider>
        </SessionProvider>
        <AdSenseScript />
      </body>
    </html>
  );
}
