import type { FileRef } from "../types";

type ThumbnailResult = { uri: string };
type VideoThumbnailsModule = {
	getThumbnailAsync: (
		uri: string,
		options?: { time?: number },
	) => Promise<ThumbnailResult>;
};

let thumbnailModule: VideoThumbnailsModule | null = null;
let resolvedModule = false;
let warnedMissingModule = false;

function getVideoThumbnails(): VideoThumbnailsModule | null {
	if (resolvedModule) return thumbnailModule;
	resolvedModule = true;
	try {
		thumbnailModule = require("expo-video-thumbnails");
	} catch {
		if (!warnedMissingModule) {
			warnedMissingModule = true;
			console.warn(
				"createThumbnail: install expo-video-thumbnails for native thumbnails. Falling back to null.",
			);
		}
	}
	return thumbnailModule;
}

export async function createThumbnail(file: FileRef): Promise<string | null> {
	const mod = getVideoThumbnails();
	if (!mod) return null;

	try {
		const result = await mod.getThumbnailAsync(file.uri, { time: 1000 });
		return result.uri;
	} catch {
		return null;
	}
}

export function revokeThumbnail(_uri: string): void {}
