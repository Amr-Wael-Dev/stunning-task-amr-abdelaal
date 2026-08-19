"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * Tracks the user's `prefers-reduced-motion` OS setting so components can
 * skip typing effects, auto-scroll, and other non-essential motion. Mirrors
 * the same posture as the CSS `@media (prefers-reduced-motion: no-preference)`
 * gate already used in globals.css.
 *
 * Uses useSyncExternalStore (rather than state set from an effect) because
 * this reads a browser-only API: the server always renders the "false"
 * snapshot, and React reconciles the real client value right after
 * hydration without a mismatch warning.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
