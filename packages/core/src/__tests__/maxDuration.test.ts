import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FileRef } from "../types";
import { maxDuration } from "../validation/maxDuration";

function makeFileRef(): FileRef {
	const blob = new Blob(["x"], { type: "video/mp4" });
	return {
		name: "test.mp4",
		platform: "web",
		raw: new File([blob], "test.mp4", { type: "video/mp4" }),
		size: 1024,
		type: "video/mp4",
		uri: "blob:test",
	};
}

function createMockVideo(duration: number, shouldError = false) {
	const video = {
		_src: "",
		duration: 0,
		onerror: null as (() => void) | null,
		onloadedmetadata: null as (() => void) | null,
		preload: "",
		set src(val: string) {
			this._src = val;
			queueMicrotask(() => {
				if (shouldError) {
					this.onerror?.();
				} else {
					(this as { duration: number }).duration = duration;
					this.onloadedmetadata?.();
				}
			});
		},
		get src() {
			return this._src;
		},
	};
	return video;
}

describe("maxDuration (web)", () => {
	beforeEach(() => {
		vi.spyOn(document, "createElement").mockImplementation(
			(tagName: string) => {
				if (tagName === "video") {
					return createMockVideo(30) as unknown as HTMLVideoElement;
				}
				return document.createElement(tagName);
			},
		);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns valid for native file ref", () => {
		const validator = maxDuration(60);
		const ref: FileRef = {
			name: "test.mp4",
			platform: "native",
			size: 1024,
			type: "video/mp4",
			uri: "file:///tmp/test.mp4",
		};

		const result = validator(ref);

		expect(result).toEqual({ valid: true });
		expect(document.createElement).not.toHaveBeenCalled();
	});

	it("returns valid when duration is under limit", async () => {
		vi.mocked(document.createElement).mockImplementation((tagName: string) => {
			if (tagName === "video") {
				return createMockVideo(30) as unknown as HTMLVideoElement;
			}
			return document.createElement(tagName);
		});

		const validator = maxDuration(60);
		const result = await validator(makeFileRef());

		expect(result).toEqual({ valid: true });
	});

	it("returns valid when duration equals limit", async () => {
		vi.mocked(document.createElement).mockImplementation((tagName: string) => {
			if (tagName === "video") {
				return createMockVideo(60) as unknown as HTMLVideoElement;
			}
			return document.createElement(tagName);
		});

		const validator = maxDuration(60);
		const result = await validator(makeFileRef());

		expect(result).toEqual({ valid: true });
	});

	it("returns invalid when duration exceeds limit", async () => {
		vi.mocked(document.createElement).mockImplementation((tagName: string) => {
			if (tagName === "video") {
				return createMockVideo(120) as unknown as HTMLVideoElement;
			}
			return document.createElement(tagName);
		});

		const validator = maxDuration(60);
		const result = await validator(makeFileRef());

		expect(result).toMatchObject({ valid: false });
		expect((result as { reason: string }).reason).toContain(
			"exceeds maximum duration",
		);
		expect((result as { reason: string }).reason).toContain("60s");
		expect((result as { reason: string }).reason).toContain("120");
	});

	it("returns valid on video load error", async () => {
		vi.mocked(document.createElement).mockImplementation((tagName: string) => {
			if (tagName === "video") {
				return createMockVideo(0, true) as unknown as HTMLVideoElement;
			}
			return document.createElement(tagName);
		});

		const validator = maxDuration(60);
		const result = await validator(makeFileRef());

		expect(result).toEqual({ valid: true });
	});

	it("revokes object URL after metadata load", async () => {
		const revokeSpy = vi
			.spyOn(URL, "revokeObjectURL")
			.mockImplementation(() => {});
		vi.mocked(document.createElement).mockImplementation((tagName: string) => {
			if (tagName === "video") {
				return createMockVideo(30) as unknown as HTMLVideoElement;
			}
			return document.createElement(tagName);
		});

		const validator = maxDuration(60);
		await validator(makeFileRef());

		expect(revokeSpy).toHaveBeenCalled();
	});
});
