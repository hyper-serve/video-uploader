import type { FileRef, ValidationResult } from "../types";

export function maxDuration(
	seconds: number,
): (file: FileRef) => ValidationResult | Promise<ValidationResult> {
	return (file) => {
		if (file.platform === "native") {
			return { valid: true };
		}

		return new Promise<ValidationResult>((resolve) => {
			const video = document.createElement("video");
			video.preload = "metadata";

			const objectUrl = URL.createObjectURL(file.raw);

			video.onloadedmetadata = () => {
				URL.revokeObjectURL(objectUrl);
				if (video.duration > seconds) {
					resolve({
						reason: `Video exceeds maximum duration of ${seconds}s (got ${Math.round(video.duration)}s)`,
						valid: false,
					});
				} else {
					resolve({ valid: true });
				}
			};

			video.onerror = () => {
				URL.revokeObjectURL(objectUrl);
				resolve({ valid: true });
			};

			video.src = objectUrl;
		});
	};
}
