import type { Metadata } from "next";
import { BuilderConsole } from "./components/builder-console";

export const metadata: Metadata = {
  title: "Stunning - Build Console",
  description: "Describe what you want to build and get a build plan back in seconds.",
};

export default function Home() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="border-b border-surface-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6 md:px-10">
          <span className="text-lg font-semibold tracking-tight">Stunning</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-24 pt-16 md:px-10">
        <div className="mb-10 flex max-w-2xl flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Describe what you want built.
          </h1>
          <p className="max-w-[46ch] text-base text-muted">
            Add the integrations it needs, and get a build plan back in seconds.
          </p>
        </div>

        <BuilderConsole />
      </main>
    </div>
  );
}
