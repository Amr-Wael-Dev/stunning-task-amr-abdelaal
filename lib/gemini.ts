import { GoogleGenAI } from "@google/genai";
import { resolveIntegrations } from "./integrations";

const MODEL = "gemini-3.5-flash";

const BASE_SYSTEM_PROMPT = `You are Stunning's build assistant. A user describes a product they want to build, and you respond with a concrete build plan: what to build, the core screens or endpoints, and the first steps to ship it.

Respond in well-structured Markdown: use headings to separate sections, bullet or numbered lists for screens, endpoints, and steps, and \`code\` spans or fenced code blocks wherever a snippet, command, or schema helps. The response is rendered as Markdown, so use rich formatting freely.`;

export class GeminiConfigError extends Error {}
export class GeminiUpstreamError extends Error {}

type GenerateArgs = {
  prompt: string;
  integrationIds: string[];
};

let client: GoogleGenAI | undefined;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiConfigError(
      "GEMINI_API_KEY is not set. Add it to .env.local.",
    );
  }
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

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
  const ai = getClient();
  const integrations = resolveIntegrations(integrationIds);

  const systemInstruction =
    integrations.length === 0
      ? BASE_SYSTEM_PROMPT
      : `${BASE_SYSTEM_PROMPT}

The user has selected these integrations for this build. Weave each one into the plan naturally, describing how it would realistically be used:
${integrations.map((i) => `- ${i.blurb}`).join("\n")}`;

  let text: string | undefined;
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { systemInstruction },
    });
    text = response.text;
  } catch (cause) {
    throw new GeminiUpstreamError("Could not reach the Gemini API.", {
      cause,
    });
  }

  if (!text) {
    throw new GeminiUpstreamError(
      "Gemini API returned no usable text (the response may have been blocked).",
    );
  }

  return text.trim();
}
