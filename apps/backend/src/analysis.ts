import { config } from "./config.js";
import { analyzeImageWithMockModel } from "./mockVision.js";
import type { AnalysisResult } from "./types.js";
import { analyzeImageWithVisionModel } from "./vision.js";

export async function analyzeImage(file: Express.Multer.File): Promise<AnalysisResult> {
  if (config.visionProvider === "openai") {
    return analyzeImageWithVisionModel(file);
  }

  return analyzeImageWithMockModel(file);
}
