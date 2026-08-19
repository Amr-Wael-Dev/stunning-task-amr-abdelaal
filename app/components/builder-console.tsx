"use client";

import { useState } from "react";
import {
  CircleNotch,
  PaperPlaneRight,
  Sparkle,
  WarningCircle,
} from "@phosphor-icons/react";
import { INTEGRATIONS } from "@/lib/integrations";

const MAX_PROMPT_LENGTH = 4000;

type Status = "idle" | "loading" | "success" | "error";

export function BuilderConsole() {
  const [prompt, setPrompt] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trimmedPrompt = prompt.trim();
  const canSubmit = trimmedPrompt.length > 0 && status !== "loading";

  function toggleIntegration(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((existing) => existing !== id)
        : [...current, id]
    );
  }

  async function submit() {
    if (!canSubmit) return;
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmedPrompt, integrationIds: selectedIds }),
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
      setErrorMessage("Could not reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void submit();
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:items-start">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="prompt" className="text-sm font-medium">
            What do you want to build?
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="A waitlist page that collects emails and notifies the team when someone signs up..."
            rows={6}
            maxLength={MAX_PROMPT_LENGTH}
            className="w-full resize-none rounded-xl border border-surface-border bg-surface px-4 py-3 text-base text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted">
              Selected integrations are added as context for the assistant, they are not connected to anything real.
            </p>
            <span className="shrink-0 pl-3 text-xs text-muted">
              {prompt.length} / {MAX_PROMPT_LENGTH}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Integrations (optional)</span>
          <div className="flex flex-wrap gap-2">
            {INTEGRATIONS.map((integration) => {
              const selected = selectedIds.includes(integration.id);
              return (
                <button
                  key={integration.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleIntegration(integration.id)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors active:-translate-y-px ${
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
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-accent-foreground transition-transform active:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit"
        >
          {status === "loading" ? (
            <>
              <CircleNotch className="h-5 w-5 animate-spin" weight="bold" />
              Generating...
            </>
          ) : (
            <>
              Generate plan
              <PaperPlaneRight className="h-5 w-5" weight="bold" />
            </>
          )}
        </button>
      </form>

      <ResponsePanel status={status} result={result} errorMessage={errorMessage} onRetry={submit} />
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
    <div className="flex min-h-[320px] flex-col rounded-2xl border border-surface-border bg-surface p-6 lg:min-h-[420px]">
      {status === "idle" && (
        <div className="m-auto flex flex-col items-center gap-3 text-center text-muted">
          <Sparkle className="h-6 w-6" />
          <p className="max-w-[28ch] text-sm">
            Your build plan will appear here.
          </p>
        </div>
      )}

      {status === "loading" && (
        <div className="flex flex-col gap-3">
          {["w-2/5", "w-full", "w-full", "w-4/5", "w-full", "w-3/5"].map((width, index) => (
            <div
              key={index}
              className={`h-4 ${width} animate-pulse rounded bg-foreground/10`}
            />
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="m-auto flex max-w-[36ch] flex-col items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center">
          <WarningCircle className="h-6 w-6 text-red-500" weight="fill" />
          <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
          <button
            type="button"
            onClick={onRetry}
            className="text-sm font-medium text-accent underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}

      {status === "success" && result && (
        <pre className="animate-fade-in-up whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
          {result}
        </pre>
      )}
    </div>
  );
}
