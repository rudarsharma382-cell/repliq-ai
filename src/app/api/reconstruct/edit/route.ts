import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import {
  chatCompletion,
  creditsFromTokens,
  extractCode,
  openRouterConfigured,
  openRouterModel,
  tokenBudget,
} from "@/lib/ai/openrouter";
import { sanitizeGeneratedTsx } from "@/lib/ai/sanitize-tsx";

export const maxDuration = 60;

type EditBody = {
  prompt?: string;
  files?: Record<string, string>;
  activeFile?: string;
};

function clipSource(source: string, maxChars = 14000) {
  if (source.length <= maxChars) return source;
  return `${source.slice(0, maxChars)}\n/* …truncated for token budget */`;
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (!openRouterConfigured()) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY is missing." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as EditBody;
  const prompt = body.prompt?.trim();
  const files = body.files || {};
  const activeFile = body.activeFile && files[body.activeFile] ? body.activeFile : "/App.tsx";
  const source = files[activeFile];

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }
  if (!source) {
    return NextResponse.json({ error: "No source file to edit." }, { status: 400 });
  }

  try {
    const result = await chatCompletion(
      [
        {
          role: "system",
          content:
            "You are Repliq's reconstruction editor. Apply the instruction precisely. Keep layout and brand unless asked to change them. Output only updated TSX in a tsx fence. react + lucide-react + Tailwind only.",
        },
        {
          role: "user",
          content: `Instruction:\n${prompt}\n\nCurrent ${activeFile}:\n\`\`\`tsx\n${clipSource(source)}\n\`\`\``,
        },
      ],
      tokenBudget("edit"),
      openRouterModel()
    );

    const nextFiles = {
      ...files,
      [activeFile]: sanitizeGeneratedTsx(extractCode(result.content)),
    };

    if (!nextFiles[activeFile]) {
      return NextResponse.json({ error: "Model did not return updated source." }, { status: 502 });
    }

    return NextResponse.json({
      files: nextFiles,
      model: result.model,
      usage: result.usage,
      credits: creditsFromTokens(result.usage.total_tokens, "edit"),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Edit failed";
    console.error("[reconstruct/edit]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
