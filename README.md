# AIExplorer

AIExplorer is a production-oriented MVP for an AI vision education app. The Expo mobile app lets a user choose or capture an image, sends it to a backend API, and displays an educational explanation returned by an OpenAI-compatible vision model.

## Project structure

- `apps/mobile` - Expo React Native app written in TypeScript
- `apps/backend` - Node.js + Express API for Railway deployment

## Run the mobile app locally

```bash
npm install
npm run mobile:start
```

Set the mobile API URL before starting Expo:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001 npm run mobile:start
```

For a physical device, use your computer's LAN IP instead of `localhost`, for example:

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.25:3001 npm run mobile:start
```

## Run the backend locally

```bash
cd apps/backend
cp .env.example .env
npm install
npm run dev
```

Environment variables:

- `VISION_PROVIDER` - defaults to `openai`; set to `mock` only for offline UI development
- `PORT` - server port, defaults to `3001`

Required for real image analysis:

- `OPENAI_API_KEY` - OpenAI project API key. It is used only by the backend and must never be set in Expo variables.

Optional environment variables:
- `OPENAI_MODEL` - defaults to `gpt-4o-mini`
- `OPENAI_BASE_URL` - set this for OpenAI-compatible providers
- `OPENAI_TIMEOUT_MS` - provider request timeout, defaults to `30000`
- `OPENAI_MAX_RETRIES` - OpenAI SDK retries after the first attempt, defaults to `1`
- `CORS_ORIGIN` - comma-separated allowed origins, defaults to `*`
- `MAX_IMAGE_MB` - upload limit in megabytes, defaults to `8`

The default backend path resizes the uploaded image in memory, sends it to OpenAI, validates the model's structured JSON response, and returns only the validated educational result. Images are not written to permanent storage.

## API checks

Health check:

```bash
curl http://localhost:3001/health
```

Image analysis:

```bash
curl -X POST http://localhost:3001/analyze-image \
  -F "image=@/absolute/path/to/photo.jpg"
```

Expected success response:

```json
{
  "name": "Monarch Butterfly",
  "scientificName": "Danaus plexippus",
  "confidence": 0.87,
  "summary": "A large orange-and-black butterfly known for long-distance migration.",
  "facts": [
    "Monarch butterflies migrate thousands of miles.",
    "Their caterpillars feed on milkweed.",
    "Their orange-and-black coloring warns some predators."
  ],
  "resources": [
    {
      "title": "Learn more",
      "type": "article",
      "url": "https://example.com"
    }
  ]
}
```

## Railway deployment

Deploy `apps/backend` as the Railway service root. Set these variables in Railway:

- `VISION_PROVIDER=openai`
- `OPENAI_API_KEY` with a Railway service variable or secret
- `OPENAI_MODEL` if you want a model other than `gpt-4o-mini`
- `OPENAI_TIMEOUT_MS=30000`
- `OPENAI_MAX_RETRIES=1`
- `CORS_ORIGIN` if you want to restrict browser origins
- `MAX_IMAGE_MB` if you need a different upload limit

The backend includes `apps/backend/railway.toml` with a build command, start command, and `/health` health check.

## Before App Store submission

- Add branded icons and splash screens.
- Test camera and gallery permissions on real iOS and Android devices.
- Add privacy policy copy that explains transient image upload for analysis.
- Decide whether recent local scans should be user-clearable from settings.
- Add rate limiting or abuse protection before public launch.
