# @hyperserve/video-uploader

Headless video upload state machine for React and React Native. Manages file queue, concurrency, validation, progress, and status polling. Bring your own UI or use `@hyperserve/video-uploader-react` / `@hyperserve/video-uploader-react-native`.

## Install

```bash
npm install @hyperserve/video-uploader
```

## Usage

```tsx
import { UploadProvider, useUpload } from "@hyperserve/video-uploader";

<UploadProvider config={config}>
  <YourUI />
</UploadProvider>

function YourUI() {
  const { files, addFiles } = useUpload();
  // ...
}
```

See the [full documentation](https://videouploader.fyi) for adapters, validators, and the headless guide.
