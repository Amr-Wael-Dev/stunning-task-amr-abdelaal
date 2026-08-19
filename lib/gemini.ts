import { resolveIntegrations } from "./integrations";

const MODEL = "gemini-3.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const BASE_SYSTEM_PROMPT = `You are Stunning's build assistant. A user describes a product they want to build, and you respond with a short, concrete build plan: what to build, the core screens or endpoints, and the first steps to ship it.

Formatting rules (strict):
- Plain text only, no markdown syntax (no #, *, **, backticks).
- Section headers in ALL CAPS on their own line.
- Bullet points start with "- ".
- Keep it under 250 words.`;

export class GeminiConfigError extends Error {}
export class GeminiUpstreamError extends Error {}

type GenerateArgs = {
  prompt: string;
  integrationIds: string[];
};

/**
 * Builds a system prompt that incorporates the user's selected dummy
 * integrations, then asks Gemini 3.5 Flash for a build plan. The
 * integrations never connect to anything real - they're only used as
 * context for the model.
 */
export async function generateBuildPlan({
  prompt,
  integrationIds,
}: GenerateArgs): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiConfigError(
      "GEMINI_API_KEY is not set. Add it to .env.local.",
    );
  }

  const integrations = resolveIntegrations(integrationIds);

  const systemPrompt =
    integrations.length === 0
      ? BASE_SYSTEM_PROMPT
      : `${BASE_SYSTEM_PROMPT}

The user has selected these integrations for this build. Weave each one into the plan naturally, describing how it would realistically be used. These are dummy selections for context only - do not claim to have actually connected to any of them:
${integrations.map((i) => `- ${i.blurb}`).join("\n")}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    });
  } catch (cause) {
    throw new GeminiUpstreamError("Could not reach the Gemini API.", {
      cause,
    });
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new GeminiUpstreamError(
      `Gemini API responded with ${response.status}: ${body.slice(0, 500)}`,
    );
  }

  const data = await response.json();
  const text: string | undefined =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new GeminiUpstreamError(
      "Gemini API returned no usable text (the response may have been blocked).",
    );
  }

  return text.trim();
}
