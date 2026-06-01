import type { FileRef } from "../types";

export async function createThumbnail(file: FileRef): Promise<string | null> {
	if (file.platform === "native") return null;

	const videoUrl = URL.createObjectURL(file.raw);

	return new Promise<string | null>((resolve) => {
		const video = document.createElement("video");
		video.muted = true;
		video.preload = "metadata";
		video.src = videoUrl;

		const cleanup = () => URL.revokeObjectURL(videoUrl);

		video.addEventListener("loadeddata", () => {
			video.currentTime = 1;
		});

		video.addEventListener("seeked", () => {
			try {
				const canvas = document.createElement("canvas");
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				const ctx = canvas.getContext("2d");
				if (!ctx) {
					cleanup();
					resolve(null);
					return;
				}
				ctx.drawImage(video, 0, 0);
				canvas.toBlob(
					(blob) => {
						cleanup();
						resolve(blob ? URL.createObjectURL(blob) : null);
					},
					"image/jpeg",
					0.7,
				);
			} catch {
				cleanup();
				resolve(null);
			}
		});

		video.addEventListener("error", () => {
			cleanup();
			resolve(null);
		});
	});
}

export function revokeThumbnail(uri: string): void {
	URL.revokeObjectURL(uri);
}
