# @hyperserve/video-uploader-adapter-hyperserve

Official Hyperserve adapter for `@hyperserve/video-uploader`. Handles file upload to Hyperserve-managed storage via signed URLs and polls for processing status.

## Install

```bash
npm install @hyperserve/video-uploader @hyperserve/video-uploader-adapter-hyperserve
```

## Usage

```tsx
import { createHyperserveConfig } from "@hyperserve/video-uploader-adapter-hyperserve";

const config = createHyperserveConfig({
  createUpload: async (file, options) => {
    const raw = (file as import("@hyperserve/video-uploader").WebFileRef).raw;
    return fetch("/api/create-upload", {
      method: "POST",
      body: JSON.stringify({ name: raw.name, size: raw.size, ...options }),
    }).then((r) => r.json());
  },
  completeUpload: async (videoId) => {
    await fetch(`/api/complete-upload/${videoId}`, { method: "POST" });
  },
  // optional: omit if you drive status updates via webhook or SSE instead of polling
  pollVideoStatus: async (videoId) =>
    fetch(`/api/video-status/${videoId}`).then((r) => r.json()),
  uploadOptions: { isPublic: true, resolutions: ["480p", "1080p"] },
});
```

The callbacks call your backend, which proxies to Hyperserve with your API key. See the [full documentation](https://videouploader.fyi).
