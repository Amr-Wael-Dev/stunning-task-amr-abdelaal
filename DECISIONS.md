# DECISIONS.md

Assuming this ships to production tomorrow, here's what I'd do with a 60 minute pass, what I'd deliberately skip, and the biggest risk I'd flag.

## What did you improve?

With the 60 minutes, I prioritized the things that turn "works on my laptop" into "won't fall over or get abused on day one":

- **Rate limiting on `/api/generate`.** Right now any client can hammer the endpoint and burn through the Gemini quota with no pushback. I'd add a simple IP-based token bucket (in-memory is fine for a single instance, or use Redis if we're working with multiple regions/instances), something like 10 requests/minute per IP, with a 429 status code.
- **Basic structured logging/metrics on failures.** The route already distinguishes config errors from upstream errors (`GeminiConfigError` / `GeminiUpstreamError` in `lib/gemini.ts`) and logs them, I'd wire those `console.error` calls into whatever the team already uses (Sentry/Datadog/Vercel logs) so a spike in 502s pages someone instead of sitting in a log nobody reads.

## What did you intentionally leave out?

- **Persistence of prompts/results.** Nothing is saved server-side. That's intentional, it avoids a database and a data-retention policy.
- **Streaming the AI response token-by-token.** `generateContent` is used instead of the streaming variant. Streaming would improve perceived latency but adds real complexity (partial-Markdown rendering, cancel-on-unmount handling) that isn't worth it for a build-plan response that typically returns in a few seconds.
- **Multi-model fallback / provider abstraction.** The app is hard-wired to Gemini (`lib/gemini.ts`). Abstracting over multiple providers is not needed at this stage.

## What is the biggest production risk?

**A single shared `GEMINI_API_KEY` with no rate limiting or spend controls.**
The app currently has one server-side API key and no throttling in front of it (`getClient()` in `lib/gemini.ts`, called directly from `app/api/generate/route.ts`). Because the endpoint is public and stateless, anyone who finds the URL can script requests against it, cheaply turning it into a free, unmetered Gemini proxy at the project's expense, or exhausting, the API quota and taking the feature down for real users. Rate limiting (above) is the direct fix, a hard daily spend cap / alert on the Gemini project would be the belt-and-suspenders backstop.
