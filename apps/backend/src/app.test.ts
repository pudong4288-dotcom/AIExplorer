import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import httpMocks from "node-mocks-http";
import { createApp, isAllowedImageMimeType } from "./app.js";

test("GET /health returns ok", async () => {
  const response = await callApp("GET", "/health");

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { status: "ok" });
});

test("POST /analyze-image rejects missing image", async () => {
  const response = await callApp("POST", "/analyze-image");

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, "NO_IMAGE");
});

test("image MIME allowlist rejects unsupported file types", () => {
  assert.equal(isAllowedImageMimeType("image/jpeg"), true);
  assert.equal(isAllowedImageMimeType("image/png"), true);
  assert.equal(isAllowedImageMimeType("text/plain"), false);
});

async function callApp(method: string, url: string) {
  const app = createApp();
  const request = httpMocks.createRequest({ method, url });
  const response = httpMocks.createResponse({
    eventEmitter: EventEmitter
  });

  await new Promise<void>((resolve, reject) => {
    response.on("end", resolve);
    response.on("error", reject);
    app.handle(request, response, reject);
  });

  return {
    statusCode: response.statusCode,
    body: JSON.parse(response._getData() || "{}")
  };
}
