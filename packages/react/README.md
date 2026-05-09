# @hyperserve/video-uploader-react

Composable React UI components for `@hyperserve/video-uploader`. Includes DropZone, FileList, FileItem, ProgressBar, StatusBadge, Thumbnail, and FileListToolbar.

## Install

```bash
npm install @hyperserve/video-uploader @hyperserve/video-uploader-react
```

## Usage

```tsx
import { DropZone, FileList, FileListToolbar, ViewModeProvider } from "@hyperserve/video-uploader-react";
import { UploadProvider } from "@hyperserve/video-uploader";

<UploadProvider config={config}>
  <ViewModeProvider>
    <DropZone supportingText="MP4, WebM — up to 500 MB" />
    <FileListToolbar right={<FileListToolbar.ViewToggle />} />
    <FileList />
  </ViewModeProvider>
</UploadProvider>
```

See the [full documentation](https://videouploader.fyi) for component API and theming.
