import type { Metadata } from "next";
import { BuilderConsole } from "./components/builder-console";
import { ThemeToggle } from "./components/theme-toggle";

export const metadata: Metadata = {
  title: "Stunning Task | Amr Abdelaal",
  description:
    "Describe what you want to build and get a build plan back in seconds.",
};

export default function Home() {
  return (
    <div className="bg-background flex min-h-[100dvh] flex-col">
      <a
        href="#prompt"
        className="focus:bg-accent focus:text-accent-foreground sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none"
      >
        Skip to build console
      </a>

      <header className="border-surface-border border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-10">
          <span className="font-display text-lg font-semibold tracking-tight">
            Stunning Task | Amr Abdelaal
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative flex-1">
        <div
          aria-hidden="true"
          className="hero-glow pointer-events-none absolute inset-0 -z-10"
        />

        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pt-20 pb-24 md:px-10">
          <div className="mb-10 flex max-w-xl flex-col items-center gap-3 text-center">
            <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
              What would you like to build?
            </h1>
            <p className="text-muted max-w-[42ch] text-base md:text-lg">
              Add the integrations it needs, and get a build plan back in
              seconds.
            </p>
          </div>

          <BuilderConsole />
        </div>
      </main>
    </div>
  );
}
