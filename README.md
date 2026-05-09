# @hyperserve/video-uploader

Headless cross-platform video upload for React and React Native. Manage upload state, progress, validation, and status polling — bring your own UI or use the included composable components.

## Packages

| Package | Description |
|---------|-------------|
| [`@hyperserve/video-uploader`](./packages/core) | Core hooks, state machine, validation |
| [`@hyperserve/video-uploader-react`](./packages/react) | Web UI components (DropZone, FileList, etc.) |
| [`@hyperserve/video-uploader-react-native`](./packages/react-native) | React Native UI components |
| [`@hyperserve/video-uploader-adapter-hyperserve`](./packages/upload-adapter-hyperserve) | Official Hyperserve backend adapter |

## Installation

```bash
# Core + web components + Hyperserve adapter
npm install @hyperserve/video-uploader @hyperserve/video-uploader-react @hyperserve/video-uploader-adapter-hyperserve

# React Native
npm install @hyperserve/video-uploader @hyperserve/video-uploader-react-native @hyperserve/video-uploader-adapter-hyperserve
```

## Quick Start

```tsx
import { createHyperserveConfig } from "@hyperserve/video-uploader-adapter-hyperserve";
import { UploadProvider } from "@hyperserve/video-uploader";
import { DropZone, FileList } from "@hyperserve/video-uploader-react";

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

export function App() {
  return (
    <UploadProvider config={config}>
      <DropZone supportingText="MP4, WebM, MOV — up to 500 MB" />
      <FileList />
    </UploadProvider>
  );
}
```

## Documentation

Full docs at [videouploader.fyi](https://videouploader.fyi) — guides, component API, adapter setup, and custom backend walkthrough.

## License

MIT
