import type React from "react";

export type ExpoVideoModule = {
	useVideoPlayer: (
		source: string | null,
		setup?: (player: unknown) => void,
	) => unknown;
	VideoView: React.ComponentType<Record<string, unknown>>;
};

let resolvedModule: ExpoVideoModule | null = null;
let resolved = false;
let warnedMissingModule = false;

/**
 * Lazily resolves the optional `expo-video` dependency. Returns null (and warns
 * once) when it is not installed, so playback degrades to the thumbnail image.
 */
export function getExpoVideo(): ExpoVideoModule | null {
	if (resolved) return resolvedModule;
	resolved = true;
	try {
		resolvedModule = require("expo-video");
	} catch {
		if (!warnedMissingModule) {
			warnedMissingModule = true;
			console.warn(
				"Thumbnail: install expo-video to play ready videos in-app. Falling back to the thumbnail image.",
			);
		}
	}
	return resolvedModule;
}
