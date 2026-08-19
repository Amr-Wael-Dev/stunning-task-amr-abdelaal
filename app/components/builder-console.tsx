"use client";

import { useEffect, useRef, useState } from "react";
import {
  CircleNotch,
  PaperPlaneRight,
  Sparkle,
  WarningCircle,
} from "@phosphor-icons/react";
import { INTEGRATIONS } from "@/lib/integrations";

const MAX_PROMPT_LENGTH = 4000;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const EXAMPLE_PROMPTS = [
  {
    label: "Candle store with checkout",
    prompt:
      "An online store for handmade candles with checkout and order tracking.",
  },
  {
    label: "Waitlist landing page",
    prompt:
      "A waitlist page that collects emails and notifies the team when someone signs up.",
  },
  {
    label: "Internal support dashboard",
    prompt:
      "An internal dashboard support agents use to track and resolve customer tickets.",
  },
];

type Status = "idle" | "loading" | "success" | "error";

export function BuilderConsole() {
  const [prompt, setPrompt] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmedPrompt = prompt.trim();
  const canSubmit = trimmedPrompt.length > 0 && status !== "loading";

  // Auto-resize the textarea to fit its content instead of scrolling inside
  // a fixed-height box, so a longer prompt stays fully visible.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [prompt]);

  function toggleIntegration(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((existing) => existing !== id)
        : [...current, id],
    );
  }

  function fillExample(text: string) {
    setPrompt(text);
    textareaRef.current?.focus();
  }

  async function submit() {
    if (!canSubmit) return;
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          integrationIds: selectedIds,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error ?? "Something went wrong. Try again.");
        setStatus("error");
        return;
      }

      setResult(data.text);
      setStatus("success");
    } catch {
      setErrorMessage(
        "Could not reach the server. Check your connection and try again.",
      );
      setStatus("error");
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void submit();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col">
      <form
        onSubmit={handleSubmit}
        className="border-surface-border bg-surface rounded-2xl border shadow-sm"
      >
        <label htmlFor="prompt" className="sr-only">
          What do you want to build?
        </label>
        <textarea
          ref={textareaRef}
          id="prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="A waitlist page that collects emails and notifies the team when someone signs up..."
          rows={3}
          maxLength={MAX_PROMPT_LENGTH}
          className={`placeholder:text-muted w-full resize-none rounded-t-2xl bg-transparent px-5 pt-5 pb-2 text-base ${FOCUS_RING}`}
        />

        <div className="text-muted flex items-center justify-end px-5 text-xs">
          <span>
            {prompt.length} / {MAX_PROMPT_LENGTH}
          </span>
        </div>

        <div className="border-surface-border flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
          <div
            role="group"
            aria-label="Integrations"
            className="flex flex-wrap gap-2"
          >
            {INTEGRATIONS.map((integration) => {
              const selected = selectedIds.includes(integration.id);
              return (
                <button
                  key={integration.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleIntegration(integration.id)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors active:-translate-y-px ${FOCUS_RING} ${
                    selected
                      ? "border-accent bg-accent/10 text-foreground"
                      : "border-surface-border text-muted hover:border-accent/50 hover:text-foreground"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${integration.slug}.svg`}
                    alt=""
                    width={16}
                    height={16}
                    className="h-4 w-4 dark:invert"
                  />
                  {integration.name}
                </button>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`bg-accent text-accent-foreground inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-2.5 font-medium transition-transform active:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS_RING}`}
          >
            {status === "loading" ? (
              <>
                <CircleNotch className="h-5 w-5 animate-spin" weight="bold" />
                Generating
              </>
            ) : (
              <>
                Generate
                <PaperPlaneRight className="h-5 w-5" weight="bold" />
              </>
            )}
          </button>
        </div>
      </form>

      <p className="text-muted mt-3 px-1 text-xs">
        Selected integrations are added as context for the assistant, they are
        not connected to anything real. Press{" "}
        <kbd className="border-surface-border rounded border px-1 py-0.5 font-sans">
          ⌘
        </kbd>
        <kbd className="border-surface-border rounded border px-1 py-0.5 font-sans">
          Enter
        </kbd>{" "}
        to generate.
      </p>

      <div
        role="group"
        aria-label="Example prompts"
        className="mt-4 flex flex-wrap items-center gap-2"
      >
        <span className="text-muted text-xs" aria-hidden="true">
          Try:
        </span>
        {EXAMPLE_PROMPTS.map((example) => (
          <button
            key={example.label}
            type="button"
            onClick={() => fillExample(example.prompt)}
            className={`border-surface-border text-muted hover:border-accent/50 hover:text-foreground rounded-full border px-3 py-1.5 text-xs transition-colors ${FOCUS_RING}`}
          >
            {example.label}
          </button>
        ))}
      </div>

      <div className="mt-10">
        <ResponsePanel
          status={status}
          result={result}
          errorMessage={errorMessage}
          onRetry={submit}
        />
      </div>
    </div>
  );
}

function ResponsePanel({
  status,
  result,
  errorMessage,
  onRetry,
}: {
  status: Status;
  result: string | null;
  errorMessage: string | null;
  onRetry: () => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="border-surface-border bg-surface flex min-h-[220px] flex-col rounded-2xl border p-6"
    >
      {status === "idle" && (
        <div className="text-muted m-auto flex flex-col items-center gap-3 text-center">
          <Sparkle className="h-6 w-6" />
          <p className="max-w-[28ch] text-sm">
            Your build plan will appear here.
          </p>
        </div>
      )}

      {status === "loading" && (
        <div className="flex flex-col gap-3">
          {["w-2/5", "w-full", "w-full", "w-4/5", "w-full", "w-3/5"].map(
            (width, index) => (
              <div
                key={index}
                className={`h-4 ${width} bg-foreground/10 animate-pulse rounded`}
              />
            ),
          )}
        </div>
      )}

      {status === "error" && (
        <div className="m-auto flex max-w-[36ch] flex-col items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center">
          <WarningCircle className="h-6 w-6 text-red-500" weight="fill" />
          <p className="text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className={`text-accent rounded text-sm font-medium underline underline-offset-2 ${FOCUS_RING}`}
          >
            Try again
          </button>
        </div>
      )}

      {status === "success" && result && (
        <pre className="animate-fade-in-up text-foreground font-sans text-sm leading-relaxed whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  );
}
