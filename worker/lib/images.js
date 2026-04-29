import { HttpError } from "./errors.js";

const IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";
const MAX_DAILY_IMAGE_ATTEMPTS = 3;

export function getImageAttemptLimit() {
  return MAX_DAILY_IMAGE_ATTEMPTS;
}

export async function generateRecipeImage(env, prompt) {
  if (!env.AI) {
    throw new HttpError(503, "ai_not_configured", "AI image generation is not configured.");
  }

  const result = await env.AI.run(IMAGE_MODEL, {
    prompt,
  });

  const bytes = coerceImageBytes(result);
  if (!bytes) {
    throw new HttpError(502, "ai_generation_invalid", "AI image generation returned an unsupported payload.");
  }

  return bytes;
}

function coerceImageBytes(result) {
  if (result instanceof Uint8Array) {
    return result;
  }

  if (result instanceof ArrayBuffer) {
    return new Uint8Array(result);
  }

  if (result && result.image instanceof Uint8Array) {
    return result.image;
  }

  if (result?.image && typeof result.image === "string") {
    return Uint8Array.from(atob(result.image), (char) => char.charCodeAt(0));
  }

  return null;
}

export async function storeDinnerImage(env, familyId, date, bytes, timestamp) {
  if (!env.DINNER_IMAGES) {
    throw new HttpError(503, "image_store_not_configured", "DINNER_IMAGES bucket is not configured.");
  }

  const objectKey = `dinner-images/${familyId}/${date}/${timestamp}.png`;
  await env.DINNER_IMAGES.put(objectKey, bytes, {
    httpMetadata: {
      contentType: "image/png",
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  return {
    objectKey,
    imageUrl: buildImageUrl(env, objectKey),
  };
}

function buildImageUrl(env, objectKey) {
  const baseUrl = env.APP_BASE_URL;
  if (!baseUrl) {
    throw new HttpError(503, "app_base_url_missing", "APP_BASE_URL is required to build image URLs.");
  }
  return `${baseUrl.replace(/\/$/, "")}/${objectKey}`;
}
