import { describe, expect, it } from "vitest";
import type { FileRef } from "../types";
import { maxDuration } from "../validation/maxDuration.native";

function makeFileRef(): FileRef {
	return {
		name: "test.mp4",
		platform: "native",
		size: 1024,
		type: "video/mp4",
		uri: "file:///tmp/test.mp4",
	};
}

describe("maxDuration (native)", () => {
	it("returns valid when expo-video-metadata is not installed", async () => {
		const validator = maxDuration(60);
		const result = await validator(makeFileRef());

		expect(result).toEqual({ valid: true });
	});
});
