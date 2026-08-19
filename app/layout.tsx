import type { Metadata } from "next";
import { Space_Grotesk, Inter, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const displayFont = Space_Grotesk({
  variable: "--font-display-raw",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodyFont = Inter({
  variable: "--font-sans-raw",
  subsets: ["latin"],
});

const monoFont = Geist_Mono({
  variable: "--font-mono-raw",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stunning Task | Amr Abdelaal",
  description:
    "Describe what you want to build and get a build plan back in seconds.",
};

// Applies a stored theme override, if any, before first paint so the page
// never flashes the system theme and then jumps to the user's choice. Reads
// `data-theme` back off `document.documentElement` at click time, so no
// client state (and no hydration mismatch) is needed to know the current
// theme - see app/components/theme-toggle.tsx.
const THEME_INIT_SCRIPT = `
  (function () {
    try {
      var stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") {
        document.documentElement.setAttribute("data-theme", stored);
      }
    } catch (error) {}
  })();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  );
}
