const FONT_HREF: Record<string, string> = {
  Inter: "Inter:wght@400;500;600;700",
  "Plus Jakarta Sans": "Plus+Jakarta+Sans:wght@400;500;600;700",
  "DM Sans": "DM+Sans:wght@400;500;600;700",
  Outfit: "Outfit:wght@400;500;600;700",
  "Space Grotesk": "Space+Grotesk:wght@400;500;600;700",
  "IBM Plex Sans": "IBM+Plex+Sans:wght@400;500;600;700",
  "Playfair Display": "Playfair+Display:wght@500;600;700",
  "Geist Sans": "Geist:wght@400;500;600;700",
};

function pickFont(tokens?: Record<string, unknown>) {
  const typography = (tokens?.typography || {}) as Record<string, unknown>;
  const family =
    (typeof typography.heading === "string" && typography.heading) ||
    (typeof typography.family === "string" && typography.family) ||
    (typeof typography.body === "string" && typography.body) ||
    "Inter";
  return family.replace(/['"]/g, "").split(",")[0].trim();
}

function pickColor(tokens: Record<string, unknown> | undefined, key: string, fallback: string) {
  const colors = (tokens?.colors || {}) as Record<string, unknown>;
  return typeof colors[key] === "string" ? (colors[key] as string) : fallback;
}

export function sandboxExternalResources(tokens?: Record<string, unknown>) {
  const font = pickFont(tokens);
  const href = FONT_HREF[font] || FONT_HREF.Inter;
  return [
    "https://cdn.tailwindcss.com",
    `https://fonts.googleapis.com/css2?family=${href}&display=swap`,
  ];
}

export function sandboxDocument(tokens?: Record<string, unknown>) {
  const font = pickFont(tokens);
  const href = FONT_HREF[font] || FONT_HREF.Inter;
  const bg = pickColor(tokens, "bg", "#ffffff");
  const text = pickColor(tokens, "text", "#111111");
  const theme = String(tokens?.theme || "").toLowerCase();
  const isDark = theme.includes("dark") || bg.toLowerCase() === "#050505";

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://fonts.googleapis.com/css2?family=${href}&display=swap" rel="stylesheet">
    <style>
      html, body, #root { height: 100%; }
      body {
        font-family: '${font}', system-ui, sans-serif;
        background-color: ${bg};
        color: ${text};
        margin: 0;
      }
    </style>
  </head>
  <body class="${isDark ? "dark" : ""}">
    <div id="root"></div>
  </body>
</html>`;
}
