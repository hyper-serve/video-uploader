# Web example

Next.js 16 App Router example wired to Hyperserve via `@hyperserve/video-uploader-adapter-hyperserve`.

## How it fits together

- `app/page.tsx` builds an `UploadProvider` config with `createHyperserveConfig`. The three callbacks (`createUpload`, `completeUpload`, `pollVideoStatus`) call this app's own API routes.
- `app/api/*` routes call `HyperserveClient` from `@hyperserve/hyperserve-js`. The Hyperserve API key lives only on the server.

## Setup

1. Copy the env template and fill in your key:
   ```bash
   cp .env.local.example .env.local
   ```
   Set `HYPERSERVE_API_KEY`. Optionally override `HYPERSERVE_BASE_URL`.

2. From the repo root, install and start:
   ```bash
   bun install
   bun run start:web
   ```

3. Open http://localhost:3000.

## File layout

```
app/
  page.tsx                      Client UI, UploadProvider config
  layout.tsx
  api/
    create-upload/route.ts      POST: signed upload URL
    complete-upload/[id]/route.ts  POST: mark upload complete
    video-status/[id]/route.ts  GET: poll processing status
lib/
  hyperserve.ts                 Server-side HyperserveClient
```
