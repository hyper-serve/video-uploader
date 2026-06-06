import { describe, expect, it } from "vitest";
import {
	revokeFileRef,
	toFileRef,
	toFileRefs,
} from "../platform/fileRef.native";
import { createThumbnail, revokeThumbnail } from "../platform/thumbnail.native";
import type { FileRef } from "../types";

describe("thumbnail.native", () => {
	it("createThumbnail returns null without expo-video-thumbnails", async () => {
		const ref: FileRef = {
			name: "test.mp4",
			platform: "native",
			size: 1024,
			type: "video/mp4",
			uri: "file:///tmp/test.mp4",
		};
		expect(await createThumbnail(ref)).toBeNull();
	});

	it("revokeThumbnail is a safe no-op", () => {
		expect(() => revokeThumbnail("anything")).not.toThrow();
	});
});

describe("fileRef.native", () => {
	it("toFileRef converts a DocumentPickerResult to FileRef", () => {
		const result = {
			name: "video.mp4",
			size: 5000,
			type: "video/mp4",
			uri: "content://com.android.providers/video.mp4",
		};

		const ref = toFileRef(result);

		expect(ref).toEqual({
			name: "video.mp4",
			platform: "native",
			size: 5000,
			type: "video/mp4",
			uri: "content://com.android.providers/video.mp4",
		});
	});

	it("toFileRefs converts multiple results", () => {
		const results = [
			{ name: "a.mp4", size: 100, type: "video/mp4", uri: "file:///a.mp4" },
			{
				name: "b.mov",
				size: 200,
				type: "video/quicktime",
				uri: "file:///b.mov",
			},
		];

		const refs = toFileRefs(results);
		expect(refs).toHaveLength(2);
		expect(refs[0].name).toBe("a.mp4");
		expect(refs[1].name).toBe("b.mov");
	});

	it("toFileRef preserves all fields", () => {
		const result = {
			name: "clip.webm",
			size: 999999,
			type: "video/webm",
			uri: "file:///storage/emulated/0/clip.webm",
		};

		const ref = toFileRef(result);
		expect(ref.name).toBe("clip.webm");
		expect(ref.size).toBe(999999);
		expect(ref.type).toBe("video/webm");
		expect(ref.uri).toBe("file:///storage/emulated/0/clip.webm");
		expect(ref).not.toHaveProperty("raw");
	});

	it("revokeFileRef is a safe no-op", () => {
		const ref: FileRef = {
			name: "test.mp4",
			platform: "native",
			size: 1024,
			type: "video/mp4",
			uri: "file:///tmp/test.mp4",
		};
		expect(() => revokeFileRef(ref)).not.toThrow();
	});
});
