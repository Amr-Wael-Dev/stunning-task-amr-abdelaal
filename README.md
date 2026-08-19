# Stunning — AI Build Console

A landing page where you describe what you want to build, optionally pick a few dummy integrations (Stripe, Shopify, Gmail, Slack, Google Sheets), and get a build plan back from Gemini. The selected integrations are injected into the AI's system prompt as context only — nothing actually connects to them.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey), then create `.env.local` in the project root:

   ```bash
   cp .env.example .env.local
   # then edit .env.local and paste your key in
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Other scripts

```bash
npm run lint          # ESLint
npm run build         # production build
npm run format        # format with Prettier
npm run format:check  # check formatting without writing
```

## Project layout

- `app/page.tsx` / `app/components/builder-console.tsx` — the landing page and its interactive prompt console.
- `app/api/generate/route.ts` — validates the request and calls the AI helper.
- `lib/gemini.ts` — builds the system prompt (with the selected integrations injected) and calls Gemini.
- `lib/integrations.ts` — the list of dummy integrations shown in the UI.

See `DECISIONS.md` and `TECH.md` for the write-ups on production trade-offs and the model choice.
