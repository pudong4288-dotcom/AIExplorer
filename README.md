# AIExplorer

AIExplorer is a production-oriented MVP for an AI vision education app. The Expo mobile app lets a user choose or capture an image, sends it to a backend API, and displays an educational explanation returned by an OpenAI-compatible vision model.

## Project structure

- `apps/mobile` - Expo React Native app written in TypeScript
- `apps/backend` - Node.js + Express API for Railway deployment

## Run the mobile app locally

```bash
git pull
npm install
npm run mobile:start -- --clear
```

The app uses Expo SDK 58, so it opens in the current Expo Go from the App Store. If Expo Go says the project uses an older SDK (for example SDK 54), the dev server is running an old checkout: pull, run `npm install` again, and restart with `--clear`.

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
- `ANALYZE_RATE_LIMIT_MAX` - max `/analyze-image` requests per IP per window, defaults to `30`
- `ANALYZE_RATE_LIMIT_WINDOW_MS` - rate-limit window in milliseconds, defaults to `3600000` (1 hour)

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
- `ANALYZE_RATE_LIMIT_MAX=30`
- `ANALYZE_RATE_LIMIT_WINDOW_MS=3600000`

The backend includes `apps/backend/railway.toml` with a build command, start command, and `/health` health check.

## App Store (iOS)

The iOS bundle ID is `com.pudong4288.aiexplorer`. Use the Apple Developer team that holds the paid membership.

1. Deploy the backend on Railway and copy the public HTTPS URL.
2. Host `privacy.html` (GitHub Pages from this repo is enough). Use that URL in App Store Connect.
3. Create the App ID and the App Store Connect iOS app with the same bundle ID.
4. From `apps/mobile`:

```bash
npx eas-cli login
npx eas-cli init
npx eas-cli secret:create --name EXPO_PUBLIC_API_BASE_URL --value https://your-backend.up.railway.app --scope project
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --profile production
```

Set `EXPO_PUBLIC_API_BASE_URL` as an EAS environment variable / secret so production builds do not point at localhost.

App Store Connect still needs screenshots, the privacy policy URL, and App Privacy answers: photos are sent to the server for one-time analysis, not stored, and a third-party vision model is used.
