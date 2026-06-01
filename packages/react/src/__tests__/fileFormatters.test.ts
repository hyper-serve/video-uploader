import type { FileState } from "@hyperserve/video-uploader";
import { describe, expect, it } from "vitest";
import { formatFileSize, getFileDisplayName } from "../fileFormatters";

describe("formatFileSize", () => {
	it("returns KB for files under 1MB", () => {
		expect(formatFileSize(512 * 1024)).toBe("512 KB");
	});

	it("returns MB for files 1MB and above", () => {
		expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
		expect(formatFileSize(2.5 * 1024 * 1024)).toBe("2.5 MB");
	});

	it("handles zero bytes", () => {
		expect(formatFileSize(0)).toBe("0 KB");
	});

	it("rounds KB to whole numbers", () => {
		expect(formatFileSize(1500)).toBe("1 KB");
	});

	it("formats just under 1MB as KB", () => {
		expect(formatFileSize(1024 * 1024 - 1)).toBe("1024 KB");
	});
});

describe("getFileDisplayName", () => {
	it("returns the file name from ref", () => {
		const file = {
			error: null,
			id: "1",
			playbackUrl: null,
			progress: 0,
			ref: { name: "my-video.mp4", size: 1000, type: "video/mp4", uri: "x" },
			status: "selected",
			statusDetail: null,
			thumbnailUri: null,
			videoId: null,
		} as FileState;

		expect(getFileDisplayName(file)).toBe("my-video.mp4");
	});
});
