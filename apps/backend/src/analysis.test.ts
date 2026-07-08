import test from "node:test";
import assert from "node:assert/strict";
import { config } from "./config.js";
import { analyzeImage } from "./analysis.js";

test("mock provider is the default analysis provider", () => {
  assert.equal(config.visionProvider, "mock");
});

test("default analysis returns a mock result without OpenAI configuration", async () => {
  const result = await analyzeImage({
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
  });

  assert.equal(typeof result.name, "string");
  assert.ok(result.name.length > 0);
  assert.match(result.summary, /mock result|real AI vision integration is temporarily disabled/i);
  assert.equal(result.confidence >= 0 && result.confidence <= 1, true);
  assert.ok(result.facts.length >= 3);
});
