# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Breaking changes

- `HyperserveConfig.getVideoStatus` renamed to `pollVideoStatus`. Mechanical rename.
- `updateFileStatus(id, status, playbackUrl?)` is now `updateFileStatus(id, status, data?)` where `data` is `StatusUpdateData = { playbackUrl?, thumbnailUri?, statusDetail? }`. For `updateFileStatus`, only `playbackUrl` and `thumbnailUri` are meaningful. Migration: wrap the URL in an object.
- `StatusChecker.onStatusChange` callback signature changed from `(status, playbackUrl?, statusDetail?)` to `(status, data?: StatusUpdateData)`. Only relevant if you implement a custom `StatusChecker`. `statusDetail` is now passed via `data.statusDetail` during processing.
- `pollVideoStatus` is no longer exported from `@hyperserve/video-uploader-adapter-hyperserve`. Use `HyperserveStatusChecker` directly.

### Behavior changes

- Files at `ready` retain their local thumbnail when no `playbackUrl` is provided. Previously the lib force-cleared `thumbnailUri` on every ready transition, which produced a placeholder fallthrough in `Thumbnail`.
- `updateFileStatus` may be called repeatedly on an already-ready file to patch `playbackUrl` or `thumbnailUri` after the initial flip.
- Local thumbnail blob URLs are revoked on `removeFile` and provider unmount only (not on the ready transition).

## [0.1.0] — 2026-04-22

### Added

- `@hyperserve/video-uploader` — headless upload state machine, validation, platform utilities
- `@hyperserve/video-uploader-react` — web UI components: DropZone, FileList, FileItem, ProgressBar, StatusBadge, Thumbnail, FileListToolbar
- `@hyperserve/video-uploader-react-native` — React Native UI components with the same compound component API
- `@hyperserve/video-uploader-adapter-hyperserve` — official Hyperserve adapter with signed URL upload and polling status checker
- `updateFileStatus` API on `useUpload()` for webhook/SSE-driven status transitions
- `DropZoneRenderProps` exported type for typed render function children
