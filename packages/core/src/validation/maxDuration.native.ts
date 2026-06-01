import type { FileRef, ValidationResult } from "../types";

type VideoInfo = { duration?: number };
type VideoMetadataModule = {
	getVideoInfoAsync: (uri: string) => Promise<VideoInfo>;
};

let videoMetadata: VideoMetadataModule | null = null;
let resolvedModule = false;

function getVideoMetadata(): VideoMetadataModule | null {
	if (resolvedModule) return videoMetadata;
	resolvedModule = true;
	try {
		videoMetadata = require("expo-video-metadata");
	} catch {
		console.warn(
			"maxDuration: install expo-video-metadata for native duration validation. " +
				"Falling back to skip.",
		);
	}
	return videoMetadata;
}

export function maxDuration(
	seconds: number,
): (file: FileRef) => ValidationResult | Promise<ValidationResult> {
	return async (file) => {
		const mod = getVideoMetadata();
		if (!mod) return { valid: true };

		try {
			const info = await mod.getVideoInfoAsync(file.uri);
			if (info.duration != null && info.duration > seconds) {
				return {
					reason: `Video exceeds maximum duration of ${seconds}s (got ${Math.round(info.duration)}s)`,
					valid: false,
				};
			}
		} catch {}
		return { valid: true };
	};
}
