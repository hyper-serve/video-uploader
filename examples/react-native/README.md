# React Native example

Expo app wired to Hyperserve via `@hyperserve/video-uploader-adapter-hyperserve`, paired with a small Bun companion server that proxies to the Hyperserve API.

## How it fits together

- `App.tsx` mounts `UploadProvider` with the config from `shared.tsx`.
- `shared.tsx` builds the config with `createHyperserveConfig`. The three callbacks (`createUpload`, `completeUpload`, `pollVideoStatus`) call the companion server.
- `server.ts` is a Bun HTTP server (port 3001) that calls `HyperserveClient` from `@hyperserve/hyperserve-js`. The Hyperserve API key lives only on the server.

## Setup

1. Copy the env template and fill in your key:
   ```bash
   cp .env.example .env
   ```
   - `HYPERSERVE_API_KEY` is read by the Bun server.
   - `EXPO_PUBLIC_SERVER_URL` is read by the Expo app at build time. Defaults to `http://localhost:3001`. For Android emulators use `http://10.0.2.2:3001`.

2. From the repo root, install:
   ```bash
   bun install
   ```

3. In one terminal, start the companion server:
   ```bash
   bun run --filter '@hyperserve/video-uploader-example-react-native' server
   ```

4. In another terminal, start Expo:
   ```bash
   bun run start:react-native
   ```

## File layout

```
App.tsx           UploadProvider + UI
shared.tsx        Config, file picker, playback helper
server.ts         Bun HTTP server backed by HyperserveClient
```
