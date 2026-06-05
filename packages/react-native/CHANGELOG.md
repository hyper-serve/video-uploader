# Changelog

All notable changes to `@hyperserve/video-uploader-react-native` are documented
in this file. This project adheres to [Semantic Versioning](https://semver.org).

## [0.1.2] - 2026-06-04

### Added

- In-app video playback. `Thumbnail` gains `playback` and `controls` props and
  renders a ready video with [`expo-video`](https://docs.expo.dev/versions/latest/sdk/video/)
  instead of the thumbnail image. `FileItem.Content` enables playback by
  default, and `FileItem.PlaybackPreview` now renders the player for ready
  files. `expo-video` is an optional peer dependency: when it is not installed,
  components fall back to the thumbnail image (parity with the React package).

### Fixed

- Grid view now caps each cell to one column's width, so a lone item in the
  final row (or a single item) no longer stretches to the full row width.

## [0.1.1] - earlier

- Initial published releases.
