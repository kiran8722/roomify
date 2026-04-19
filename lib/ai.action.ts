import puter from "@heyputer/puter.js";
import {ROOMIFY_RENDER_PROMPT} from "./constants";

export const fetchAsDataUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const getImageSource = (value: unknown): string | null => {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && "src" in value) {
    const src = value.src;
    return typeof src === "string" ? src : null;
  }

  return null;
};

const isInsufficientFundsError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const nestedError = "error" in error && error.error && typeof error.error === "object"
    ? error.error as { code?: unknown }
    : null;
  const directError = error as { code?: unknown };
  const code = nestedError?.code ?? directError.code;

  return code === "insufficient_funds";
};

export const generate3DView = async ({ sourceImage }: Generate3DViewParams) => {
  const dataUrl = sourceImage.startsWith('data:')
      ? sourceImage
      : await fetchAsDataUrl(sourceImage);

  const base64Data = dataUrl.split(',')[1];
  const mimeType = dataUrl.split(';')[0].split(':')[1];

  if(!mimeType || !base64Data) throw new Error('Invalid source image payload');

  let response: HTMLImageElement;

  try {
    response = await puter.ai.txt2img(ROOMIFY_RENDER_PROMPT, {
      provider: "gemini",
      model: "gemini-2.5-flash-image-preview",
      input_image: base64Data,
      input_image_mime_type: mimeType,
      ratio: { w: 1024, h: 1024 },
    });
  } catch (error) {
    if (!isInsufficientFundsError(error)) {
      throw error;
    }

    response = await puter.ai.txt2img(ROOMIFY_RENDER_PROMPT, {
      input_image: base64Data,
      input_image_mime_type: mimeType,
      ratio: { w: 768, h: 768 },
    });
  }

  const rawImageUrl = getImageSource(response);

  if (!rawImageUrl) return { renderedImage: null, renderedPath: undefined };

  const renderedImage = rawImageUrl.startsWith('data:') || rawImageUrl.startsWith("blob:")
      ? rawImageUrl : await fetchAsDataUrl(rawImageUrl);

  return { renderedImage, renderedPath: undefined };
}
