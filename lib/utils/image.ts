/**
 * Client-side image compression.
 * Max dimension 1024 px, JPEG quality 0.82. Strips EXIF by virtue of canvas
 * re-encode. Returns a Blob and a data URL for preview.
 */
export async function compressImage(
  file: File,
  { maxDim = 1024, quality = 0.82 } = {}
): Promise<{ blob: Blob; previewUrl: string }> {
  const img = await loadImage(file);
  const { width, height } = fit(img.width, img.height, maxDim);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d context unavailable");
  ctx.drawImage(img, 0, 0, width, height);

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob returned null"))),
      "image/jpeg",
      quality
    )
  );
  const previewUrl = URL.createObjectURL(blob);
  return { blob, previewUrl };
}

function fit(w: number, h: number, max: number) {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w > h ? max / w : max / h;
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}
