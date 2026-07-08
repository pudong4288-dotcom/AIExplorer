import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";
import morgan from "morgan";
import multer from "multer";
import { config, maxImageBytes } from "./config.js";
import {
  HttpError,
  InvalidModelResponseError,
  ProviderConfigError,
  UnclearImageError
} from "./errors.js";
import { analyzeImage } from "./analysis.js";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif"
]);

export function isAllowedImageMimeType(mimetype: string): boolean {
  return allowedMimeTypes.has(mimetype);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxImageBytes,
    files: 1
  },
  fileFilter: (_req, file, callback) => {
    if (!isAllowedImageMimeType(file.mimetype)) {
      callback(
        new HttpError(
          415,
          "UNSUPPORTED_FILE_TYPE",
          "Something went wrong. Please try another image."
        )
      );
      return;
    }

    callback(null, true);
  }
});

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigin
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("combined"));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/analyze-image", upload.single("image"), async (req, res, next) => {
    try {
      if (!req.file) {
        throw new HttpError(400, "NO_IMAGE", "Something went wrong. Please try another image.");
      }

      const result = await analyzeImage(req.file);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.use((_req, _res, next) => {
    next(new HttpError(404, "NOT_FOUND", "Not found."));
  });

  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        error: {
          code: "IMAGE_TOO_LARGE",
          message: "This image is too large. Please choose a smaller image."
        }
      });
      return;
    }

    if (error instanceof HttpError) {
      res.status(error.statusCode).json({
        error: {
          code: error.code,
          message: error.userMessage
        }
      });
      return;
    }

    if (error instanceof ProviderConfigError) {
      console.error("AI provider configuration error:", error.message);
      res.status(500).json({
        error: {
          code: "AI_PROVIDER_NOT_CONFIGURED",
          message: "Something went wrong. Please try another image."
        }
      });
      return;
    }

    if (error instanceof UnclearImageError) {
      res.status(422).json({
        error: {
          code: "UNCLEAR_IMAGE",
          message: "We couldn't identify this clearly. Try a closer photo."
        }
      });
      return;
    }

    if (error instanceof InvalidModelResponseError) {
      console.error("Invalid model response:", error.message);
      res.status(502).json({
        error: {
          code: "INVALID_AI_RESPONSE",
          message: "Something went wrong. Please try another image."
        }
      });
      return;
    }

    console.error("Unhandled API error:", error);
    res.status(502).json({
      error: {
        code: "AI_API_FAILED",
        message: "Something went wrong. Please try another image."
      }
    });
  };

  app.use(errorHandler);

  return app;
}
