"use client";

import { Moon, Sun } from "@phosphor-icons/react";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function getEffectiveTheme(): "light" | "dark" {
  const explicit = document.documentElement.getAttribute("data-theme");
  if (explicit === "light" || explicit === "dark") return explicit;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  function handleClick() {
    const next = getEffectiveTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem("theme", next);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Toggle color theme"
      className={`border-surface-border text-muted hover:border-accent/50 hover:text-foreground inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${FOCUS_RING}`}
    >
      <Sun className="theme-icon-sun h-4.5 w-4.5" weight="bold" />
      <Moon className="theme-icon-moon h-4.5 w-4.5" weight="bold" />
    </button>
  );
}
