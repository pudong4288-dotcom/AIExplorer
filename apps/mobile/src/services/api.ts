import { ANALYSIS_TIMEOUT_MS, API_BASE_URL } from "../config/api";
import type { AnalysisResult } from "../types/analysis";

const NETWORK_MESSAGE = "Network error. Check your connection and try again.";
const GENERIC_MESSAGE = "Something went wrong. Please try another image.";
const TOO_LARGE_MESSAGE = "This image is too large. Please choose a smaller image.";
const UNCLEAR_MESSAGE = "We couldn't identify this clearly. Try a closer photo.";

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class ImageAnalysisError extends Error {
  code: string;
  userMessage: string;
  status?: number;

  constructor(code: string, userMessage: string, status?: number) {
    super(userMessage);
    this.code = code;
    this.userMessage = userMessage;
    this.status = status;
  }
}

function getFileName(imageUri: string): string {
  const fromUri = imageUri.split("/").pop()?.split("?")[0];
  return fromUri && fromUri.includes(".") ? fromUri : `aiexplorer-${Date.now()}.jpg`;
}

function getMimeType(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    case "heif":
      return "image/heif";
    case "jpg":
    case "jpeg":
    default:
      return "image/jpeg";
  }
}

function validateAnalysisResult(value: unknown): AnalysisResult {
  if (!value || typeof value !== "object") {
    throw new ImageAnalysisError("INVALID_RESPONSE", GENERIC_MESSAGE);
  }

  const result = value as Partial<AnalysisResult>;
  const facts = Array.isArray(result.facts) ? result.facts : [];
  const resources = Array.isArray(result.resources) ? result.resources : [];

  if (
    typeof result.name !== "string" ||
    typeof result.summary !== "string" ||
    typeof result.confidence !== "number"
  ) {
    throw new ImageAnalysisError("INVALID_RESPONSE", GENERIC_MESSAGE);
  }

  return {
    name: result.name,
    scientificName: result.scientificName,
    confidence: result.confidence,
    summary: result.summary,
    facts,
    resources
  };
}

function mapApiError(status: number, body: ApiErrorBody | null): ImageAnalysisError {
  const code = body?.error?.code ?? `HTTP_${status}`;

  if (status === 413 || code === "IMAGE_TOO_LARGE") {
    return new ImageAnalysisError(code, TOO_LARGE_MESSAGE, status);
  }

  if (status === 422 || code === "UNCLEAR_IMAGE") {
    return new ImageAnalysisError(code, UNCLEAR_MESSAGE, status);
  }

  if (status === 0 || status >= 500) {
    return new ImageAnalysisError(code, GENERIC_MESSAGE, status);
  }

  return new ImageAnalysisError(code, body?.error?.message || GENERIC_MESSAGE, status);
}

async function parseJsonSafely(response: Response): Promise<unknown | null> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function analyzeImage(imageUri: string): Promise<AnalysisResult> {
  if (!imageUri) {
    throw new ImageAnalysisError("NO_IMAGE", "Please choose an image first.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT_MS);
  const fileName = getFileName(imageUri);
  const mimeType = getMimeType(fileName);
  const formData = new FormData();

  formData.append("image", {
    uri: imageUri,
    name: fileName,
    type: mimeType
  } as unknown as Blob);

  try {
    const response = await fetch(`${API_BASE_URL}/analyze-image`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      },
      signal: controller.signal
    });

    const json = await parseJsonSafely(response);

    if (!response.ok) {
      throw mapApiError(response.status, json as ApiErrorBody | null);
    }

    return validateAnalysisResult(json);
  } catch (error) {
    if (error instanceof ImageAnalysisError) {
      throw error;
    }

    throw new ImageAnalysisError("NETWORK_ERROR", NETWORK_MESSAGE);
  } finally {
    clearTimeout(timeout);
  }
}
