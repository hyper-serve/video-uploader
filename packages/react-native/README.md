# @hyperserve/video-uploader-react-native

Composable React Native UI components for `@hyperserve/video-uploader`. Includes FilePicker, FileList, FileItem, ProgressBar, StatusBadge, Thumbnail, and FileListToolbar.

## Install

```bash
npm install @hyperserve/video-uploader @hyperserve/video-uploader-react-native
```

## Usage

```tsx
import { FilePicker, FileList } from "@hyperserve/video-uploader-react-native";
import { UploadProvider } from "@hyperserve/video-uploader";
import * as DocumentPicker from "expo-document-picker";
import { toFileRefs } from "@hyperserve/video-uploader";

<UploadProvider config={config}>
  <FilePicker
    pickFiles={async () => {
      const result = await DocumentPicker.getDocumentAsync({ type: "video/*", multiple: true });
      return result.canceled ? [] : toFileRefs(result.assets);
    }}
  />
  <FileList />
</UploadProvider>
```

See the [full documentation](https://videouploader.fyi).
