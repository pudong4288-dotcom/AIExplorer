import dotenv from "dotenv";

dotenv.config();

const DEFAULT_PORT = 3001;
const DEFAULT_MAX_IMAGE_MB = 8;
const DEFAULT_VISION_PROVIDER = "mock";

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseCorsOrigins(value: string | undefined): string[] | true {
  if (!value || value.trim() === "*") {
    return true;
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function parseVisionProvider(value: string | undefined): "mock" | "openai" {
  if (value === "openai") {
    return "openai";
  }

  return DEFAULT_VISION_PROVIDER;
}

export const config = {
  port: parseNumber(process.env.PORT, DEFAULT_PORT),
  visionProvider: parseVisionProvider(process.env.VISION_PROVIDER),
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  openAiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  openAiBaseUrl: process.env.OPENAI_BASE_URL || undefined,
  corsOrigin: parseCorsOrigins(process.env.CORS_ORIGIN),
  maxImageMb: parseNumber(process.env.MAX_IMAGE_MB, DEFAULT_MAX_IMAGE_MB)
};

export const maxImageBytes = config.maxImageMb * 1024 * 1024;
