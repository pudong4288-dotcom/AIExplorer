import test from "node:test";
import assert from "node:assert/strict";
import { config } from "./config.js";
import { analyzeImageWithMockModel } from "./mockVision.js";

const imageFile = {
  buffer: Buffer.from("fake image bytes"),
  originalname: "sample.jpg",
  mimetype: "image/jpeg",
  fieldname: "image",
  encoding: "7bit",
  size: 16,
  stream: null as never,
  destination: "",
  filename: "",
  path: ""
};

test("OpenAI is the default analysis provider", () => {
  assert.equal(config.visionProvider, "openai");
});

test("mock analysis remains available when explicitly selected for local development", async () => {
  const result = await analyzeImageWithMockModel(imageFile);

  assert.equal(typeof result.name, "string");
  assert.ok(result.name.length > 0);
  assert.match(result.summary, /mock result|real AI vision integration is temporarily disabled/i);
  assert.equal(result.confidence >= 0 && result.confidence <= 1, true);
  assert.ok(result.facts.length >= 3);
});
