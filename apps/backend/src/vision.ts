import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat/completions";
import sharp from "sharp";
import { z } from "zod";
import { config } from "./config.js";
import {
  InvalidModelResponseError,
  ProviderConfigError,
  UnclearImageError
} from "./errors.js";
import type { AnalysisResult } from "./types.js";

const MAX_DIMENSION = 1568;
const MAX_COMPLETION_TOKENS = 900;

const resourceSchema = z.object({
  title: z.string().min(1),
  type: z.string().min(1),
  // OpenAI Structured Outputs does not accept JSON Schema's `uri` format.
  // Validate URLs after generation in normalizeAnalysisResult instead.
  url: z.string().min(1)
});

const analysisSchema = z.object({
  name: z.string().min(1),
  scientificName: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  summary: z.string().min(1),
  facts: z.array(z.string().min(1)).max(5),
  resources: z.array(resourceSchema).max(3)
});

const systemPrompt = [
  "You are AIExplorer, an educational vision assistant for a mobile app.",
  "Identify the main visible object, organism, place, or item in the image.",
  "Do not overclaim certainty. If the image is unclear, say that clearly.",
  "Return only data that conforms to the response schema. Do not include markdown, prose, or code fences.",
  "Confidence must be a number from 0 to 1.",
  "For unclear images, set name to \"Unclear image\", scientificName to null, confidence to 0, summary to a short explanation, facts to [], and resources to [].",
  "Prefer reputable educational resources. Use 1 to 3 resources when the object is identifiable."
].join(" ");

const userPrompt = [
  "Analyze this image for an educational app.",
  "Return common name, scientific name if relevant, confidence, a short summary, 3 to 5 fun or educational facts, and 1 to 3 learning resources.",
  "If the object cannot be identified clearly, return the unclear-image JSON described in the system message."
].join(" ");

function getOpenAIClient(): OpenAI {
  if (!config.openAiApiKey) {
    throw new ProviderConfigError("OPENAI_API_KEY is not configured.");
  }

  return new OpenAI({
    apiKey: config.openAiApiKey,
    baseURL: config.openAiBaseUrl,
    timeout: config.openAiTimeoutMs,
    maxRetries: config.openAiMaxRetries
  });
}

async function imageToDataUrl(file: Express.Multer.File): Promise<string> {
  const jpegBuffer = await sharp(file.buffer, { failOn: "none" })
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true
    })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();

  return `data:image/jpeg;base64,${jpegBuffer.toString("base64")}`;
}

function stripJsonFences(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function wikipediaSearchResource(name: string) {
  return {
    title: `Search Wikipedia for ${name}`,
    type: "article",
    url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(name)}`
  };
}

function normalizeAnalysisResult(parsed: unknown): AnalysisResult {
  const result = analysisSchema.parse(parsed);
  const name = result.name.trim();
  const summary = result.summary.trim();
  const scientificName = result.scientificName?.trim() || null;
  const confidence = Math.max(0, Math.min(1, result.confidence));
  const facts = result.facts
    .map((fact) => fact.trim())
    .filter(Boolean)
    .slice(0, 5);
  const resources = result.resources
    .map((resource) => ({
      title: resource.title.trim(),
      type: resource.type.trim().toLowerCase(),
      url: resource.url.trim()
    }))
    .filter((resource) => resource.title && isValidUrl(resource.url))
    .slice(0, 3);

  const unclearName = ["unclear image", "unknown", "unidentified object"].includes(
    name.toLowerCase()
  );

  if (unclearName || confidence <= 0.05) {
    throw new UnclearImageError("The model could not identify the image clearly.");
  }

  if (facts.length < 3) {
    throw new InvalidModelResponseError("The model returned too few educational facts.");
  }

  return {
    name,
    scientificName,
    confidence,
    summary,
    facts,
    resources: resources.length > 0 ? resources : [wikipediaSearchResource(name)]
  };
}

function parseAnalysisJson(content: string | null | undefined): AnalysisResult {
  if (!content) {
    throw new InvalidModelResponseError("The model returned an empty response.");
  }

  try {
    return normalizeAnalysisResult(JSON.parse(stripJsonFences(content)));
  } catch (error) {
    if (error instanceof UnclearImageError) {
      throw error;
    }

    throw new InvalidModelResponseError("The model returned invalid analysis JSON.");
  }
}

function isUnsupportedParameterError(error: unknown, parameter: string): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as { code?: string; param?: string };
  return maybeError.code === "unsupported_parameter" && maybeError.param === parameter;
}

async function createVisionCompletion(
  client: OpenAI,
  params: Omit<
    ChatCompletionCreateParamsNonStreaming,
    "max_completion_tokens" | "max_tokens"
  >
) {
  try {
    return await client.chat.completions.create({
      ...params,
      max_completion_tokens: MAX_COMPLETION_TOKENS
    });
  } catch (error) {
    if (!isUnsupportedParameterError(error, "max_completion_tokens")) {
      throw error;
    }

    return client.chat.completions.create({
      ...params,
      max_tokens: MAX_COMPLETION_TOKENS
    });
  }
}

export async function analyzeImageWithVisionModel(
  file: Express.Multer.File
): Promise<AnalysisResult> {
  const client = getOpenAIClient();
  const dataUrl = await imageToDataUrl(file);

  const completion = await createVisionCompletion(client, {
    model: config.openAiModel,
    response_format: zodResponseFormat(analysisSchema, "aiexplorer_analysis"),
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: userPrompt
          },
          {
            type: "image_url",
            image_url: {
              url: dataUrl,
              detail: "low"
            }
          }
        ]
      }
    ]
  });

  return parseAnalysisJson(completion.choices[0]?.message?.content);
}
