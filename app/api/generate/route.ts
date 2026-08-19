import {
  GeminiConfigError,
  GeminiUpstreamError,
  generateBuildPlan,
} from "@/lib/gemini";

const MAX_PROMPT_LENGTH = 4000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { prompt, integrationIds } = (body ?? {}) as {
    prompt?: unknown;
    integrationIds?: unknown;
  };

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return Response.json(
      { error: "Please describe what you want to build." },
      { status: 400 }
    );
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return Response.json(
      { error: `Prompt is too long (max ${MAX_PROMPT_LENGTH} characters).` },
      { status: 400 }
    );
  }

  const ids = Array.isArray(integrationIds)
    ? integrationIds.filter((id): id is string => typeof id === "string")
    : [];

  try {
    const text = await generateBuildPlan({
      prompt: prompt.trim(),
      integrationIds: ids,
    });
    return Response.json({ text });
  } catch (error) {
    if (error instanceof GeminiConfigError) {
      console.error("[api/generate] config error:", error.message);
      return Response.json(
        { error: "The build assistant is not configured yet." },
        { status: 500 }
      );
    }
    if (error instanceof GeminiUpstreamError) {
      console.error("[api/generate] upstream error:", error.message);
      return Response.json(
        { error: "The build assistant is unavailable right now. Try again in a moment." },
        { status: 502 }
      );
    }
    console.error("[api/generate] unexpected error:", error);
    return Response.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}
