export async function compressImageDataUrl(
  source: string,
  maxEdge = 1024,
  quality = 0.72
): Promise<{ url: string; width: number; height: number }> {
  if (!source.startsWith("data:image") || typeof window === "undefined") {
    return { url: source, width: 0, height: 0 };
  }

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Could not read screenshot"));
    el.src = source;
  });

  const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { url: source, width: image.width, height: image.height };
  ctx.drawImage(image, 0, 0, width, height);

  return {
    url: canvas.toDataURL("image/jpeg", quality),
    width,
    height,
  };
}
