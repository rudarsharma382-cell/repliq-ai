import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { openRouterConfigured } from "@/lib/ai/openrouter";
import { reconstructInterface } from "@/lib/ai/reconstruct";

export const maxDuration = 120;

type GenerateBody = {
  name?: string;
  repositoryUrl?: string;
  branch?: string;
  presetKey?: string;
  screenshots?: Array<{ name?: string; dimensions?: string; url?: string }>;
};

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (!openRouterConfigured()) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY is missing.", fallback: true },
      { status: 503 }
    );
  }

  const body = (await request.json()) as GenerateBody;

  try {
    const result = await reconstructInterface(body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    console.error("[reconstruct/generate]", message);
    return NextResponse.json({ error: message, fallback: true }, { status: 502 });
  }
}
