import { createHash } from "node:crypto";
import type { AnalysisResult } from "./types.js";

const MOCK_RESULTS: AnalysisResult[] = [
  {
    name: "Citrus Drink Bottle",
    scientificName: null,
    confidence: 0.82,
    summary:
      "This mock result represents a packaged citrus drink bottle. The real AI vision integration is temporarily disabled.",
    facts: [
      "Plastic drink bottles are commonly made from PET, a lightweight recyclable plastic.",
      "Citrus flavors are often associated with oranges, lemons, grapefruits, or limes.",
      "Bottle caps usually use ridges around the edge to make them easier to grip.",
      "Nutrition labels help compare serving size, sugar, calories, and ingredients."
    ],
    resources: [
      {
        title: "Learn about recycling PET bottles",
        type: "article",
        url: "https://en.wikipedia.org/wiki/Polyethylene_terephthalate"
      }
    ]
  },
  {
    name: "Houseplant",
    scientificName: null,
    confidence: 0.78,
    summary:
      "This mock result represents an indoor plant. The real AI vision integration is temporarily disabled.",
    facts: [
      "Houseplants use photosynthesis to convert light, water, and carbon dioxide into energy.",
      "Leaves can indicate plant health through color, texture, and wilting.",
      "Overwatering is one of the most common causes of indoor plant stress."
    ],
    resources: [
      {
        title: "Introduction to photosynthesis",
        type: "article",
        url: "https://en.wikipedia.org/wiki/Photosynthesis"
      }
    ]
  },
  {
    name: "Monarch Butterfly",
    scientificName: "Danaus plexippus",
    confidence: 0.87,
    summary:
      "This mock result represents a monarch butterfly. The real AI vision integration is temporarily disabled.",
    facts: [
      "Monarch butterflies are known for long-distance migration.",
      "Their caterpillars feed on milkweed plants.",
      "Their orange-and-black coloring can warn predators that they may taste unpleasant."
    ],
    resources: [
      {
        title: "Monarch butterfly overview",
        type: "article",
        url: "https://en.wikipedia.org/wiki/Monarch_butterfly"
      }
    ]
  },
  {
    name: "Notebook",
    scientificName: null,
    confidence: 0.74,
    summary:
      "This mock result represents a notebook or paper object. The real AI vision integration is temporarily disabled.",
    facts: [
      "Paper is usually made from cellulose fibers derived from wood pulp.",
      "Notebooks are useful for sketching, planning, observations, and study notes.",
      "Ruled, grid, and dotted paper each support different types of organization."
    ],
    resources: [
      {
        title: "How paper is made",
        type: "article",
        url: "https://en.wikipedia.org/wiki/Paper"
      }
    ]
  }
];

function getMockIndex(file: Express.Multer.File): number {
  const hash = createHash("sha256")
    .update(file.buffer.subarray(0, Math.min(file.buffer.length, 4096)))
    .update(file.originalname || "")
    .digest();

  return hash[0] % MOCK_RESULTS.length;
}

export async function analyzeImageWithMockModel(
  file: Express.Multer.File
): Promise<AnalysisResult> {
  return MOCK_RESULTS[getMockIndex(file)];
}
