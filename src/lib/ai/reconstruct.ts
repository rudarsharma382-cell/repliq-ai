import {
  chatCompletion,
  creditsFromTokens,
  extractCode,
  extractJsonObject,
  mergeUsage,
  openRouterModel,
  openRouterVisionModel,
  tokenBudget,
  visionCompletion,
  type ContentPart,
  type ModelUsage,
} from "./openrouter";
import { sanitizeGeneratedTsx } from "./sanitize-tsx";

export type ReconstructShot = {
  name?: string;
  dimensions?: string;
  url?: string;
};

export type ReconstructInput = {
  name?: string;
  repositoryUrl?: string;
  branch?: string;
  presetKey?: string;
  screenshots?: ReconstructShot[];
};

export type DesignSpec = {
  pageType: string;
  theme: string;
  colors: Record<string, string>;
  typography: Record<string, string>;
  layout: string;
  sections: string[];
  components: string[];
  copy: Record<string, unknown>;
  notes: string;
};

const DATA_URL_LIMIT = 900_000;

function usableShots(shots: ReconstructShot[]) {
  return shots
    .filter((shot) => Boolean(shot.url))
    .filter((shot) => !shot.url!.startsWith("data:") || shot.url!.length < DATA_URL_LIMIT)
    .slice(0, 2);
}

function asSpec(raw: Record<string, unknown>): DesignSpec {
  const colors = (raw.colors || {}) as Record<string, string>;
  const typography = (raw.typography || {}) as Record<string, string>;
  const copy = (raw.copy || {}) as Record<string, unknown>;
  const sections = Array.isArray(raw.sections) ? raw.sections.map(String) : [];
  const components = Array.isArray(raw.components)
    ? raw.components.map(String)
    : Array.isArray(raw.components_detected)
      ? (raw.components_detected as unknown[]).map(String)
      : [];

  return {
    pageType: String(raw.pageType || raw.layout || "web-page"),
    theme: String(raw.theme || "unknown"),
    colors: {
      bg: colors.bg || colors.background || "#ffffff",
      surface: colors.surface || colors.panel || "#f8f8f8",
      text: colors.text || "#111111",
      muted: colors.muted || "#6b7280",
      accent: colors.accent || "#2563eb",
      border: colors.border || "#e5e7eb",
    },
    typography: {
      heading: typography.heading || typography.family || "Inter",
      body: typography.body || typography.family || "Inter",
    },
    layout: String(raw.layout || ""),
    sections,
    components,
    copy,
    notes: String(raw.notes || ""),
  };
}

async function analyzeScreenshots(
  input: ReconstructInput,
  shots: ReconstructShot[]
): Promise<{ spec: DesignSpec; usage: ModelUsage; model?: string; skipped?: string }> {
  const visionParts: ContentPart[] = shots
    .filter((shot) => shot.url)
    .map((shot) => ({
      type: "image_url" as const,
      image_url: { url: shot.url! },
    }));

  if (!visionParts.length) {
    return {
      spec: asSpec({
        pageType: input.presetKey === "portfolio" ? "portfolio" : input.presetKey === "saas" ? "dashboard" : "web-page",
        theme: "match-source",
        layout: "Infer layout from the repository name and screenshot labels only.",
        notes: "No screenshot pixels were provided. Reconstruct a faithful UI from the project name, repo, and labels.",
        copy: { headline: input.name || "Reconstructed interface" },
      }),
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      skipped: "No images attached",
    };
  }

  try {
    const result = await visionCompletion(
      [
        {
          role: "system",
          content:
            "You are a visual QA engineer. Extract a compact JSON design spec from screenshots. No markdown. Keys: pageType, theme, colors{bg,surface,text,muted,accent,border}, typography{heading,body}, layout, sections[], components[], copy{headline,subhead,nav[],cta,other}, notes. Capture exact visible text, colors as hex, spacing feel, and structure. Do not invent a different brand.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Project: ${input.name || "Untitled"}
Repo: ${input.repositoryUrl || "n/a"} @ ${input.branch || "main"}
Screenshot labels: ${shots.map((s) => `${s.name || "shot"} ${s.dimensions || ""}`).join("; ")}
Return JSON only.`,
            },
            ...visionParts,
          ],
        },
      ],
      tokenBudget("analyze")
    );

    let spec: DesignSpec;
    try {
      spec = asSpec(extractJsonObject(result.content));
    } catch {
      spec = asSpec({
        notes: result.content.slice(0, 4000),
        copy: { headline: input.name || "Reconstructed interface" },
      });
    }
    return { spec, usage: result.usage, model: result.model };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Vision analysis failed";
    console.warn("[reconstruct] vision skipped:", message);
    return {
      spec: asSpec({
        notes: `Vision analysis unavailable (${message}). Reconstruct from labels and repo context, matching the user's screenshots as closely as possible.`,
        copy: { headline: input.name || "Reconstructed interface" },
      }),
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      skipped: message,
    };
  }
}

function buildAppTsxPrompt(input: ReconstructInput, spec: DesignSpec) {
  return `Rebuild this UI as a single React file that matches the design spec PIXEL-CLOSELY.

Project: ${input.name || "Untitled"}
Repository: ${input.repositoryUrl || "n/a"} @ ${input.branch || "main"}

DESIGN SPEC:
${JSON.stringify(spec)}

Hard rules:
- export default function App()
- Always use className, never class
- react + lucide-react + Tailwind only
- Match theme, colors, type, layout, and visible copy from the spec
- Do NOT apply a generic dark "Repliq" look unless the spec theme is dark
- Header must be a real navbar: flex items-center justify-between gap-6 with space-x/gap on links
- Nav items MUST be <button type="button"> driven by useState. Clicking a tab MUST swap the main view (Dashboard, Reports, etc.)
- Do NOT use <a href="/path"> — those routes 404 in this sandbox and look like raw blue links
- CTA buttons: rounded-lg px-4 py-2 font-medium, never unstyled native buttons
- Metric cards in a responsive grid (grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4)
- Charts can be CSS/SVG placeholders that fill the card, not empty gray boxes
- Use spec hex colors via Tailwind arbitrary values
- Output ONLY the TSX in a \`\`\`tsx fence`;
}

export async function reconstructInterface(input: ReconstructInput) {
  const shots = usableShots(input.screenshots || []);
  const analysis = await analyzeScreenshots(input, shots);

  const generated = await chatCompletion(
    [
      {
        role: "system",
        content:
          "You are a senior product engineer cloning interfaces. Output only valid TSX. Faithful visual clone, not a reinterpretation.",
      },
      { role: "user", content: buildAppTsxPrompt(input, analysis.spec) },
    ],
    tokenBudget("generate"),
    openRouterModel()
  );

  const code = sanitizeGeneratedTsx(extractCode(generated.content));
  if (!code.includes("export default")) {
    throw new Error("Coder did not return a React component");
  }

  const usage = mergeUsage(analysis.usage, generated.usage);
  const tokens = {
    ...analysis.spec,
    colors: analysis.spec.colors,
    typography: analysis.spec.typography,
    theme: analysis.spec.theme,
    layout: analysis.spec.layout,
    components_detected: analysis.spec.components,
  };

  return {
    files: { "/App.tsx": code },
    detectedTokens: tokens,
    usage,
    credits: creditsFromTokens(usage.total_tokens, "generate"),
    model: generated.model,
    visionModel: analysis.model || openRouterVisionModel(),
    analysisSkipped: analysis.skipped,
  };
}
