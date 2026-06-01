import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { revokeFileRef, toFileRef, toFileRefs } from "../platform/fileRef";
import { createThumbnail, revokeThumbnail } from "../platform/thumbnail";
import type { FileRef } from "../types";

describe("thumbnail (web)", () => {
	let listeners: Record<string, (() => void)[]>;
	let mockVideo: {
		muted: boolean;
		preload: string;
		src: string;
		currentTime: number;
		videoWidth: number;
		videoHeight: number;
		addEventListener: (event: string, cb: () => void) => void;
	};
	let mockCanvas: {
		width: number;
		height: number;
		getContext: ReturnType<typeof vi.fn>;
		toBlob: ReturnType<typeof vi.fn>;
	};
	let mockCtx: { drawImage: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		listeners = {};
		mockCtx = { drawImage: vi.fn() };
		mockCanvas = {
			getContext: vi.fn().mockReturnValue(mockCtx),
			height: 0,
			toBlob: vi.fn().mockImplementation((cb: (blob: Blob | null) => void) => {
				cb(new Blob(["img"], { type: "image/jpeg" }));
			}),
			width: 0,
		};
		mockVideo = {
			addEventListener: (event: string, cb: () => void) => {
				// biome-ignore lint/suspicious/noAssignInExpressions: intentional compound assignment
				(listeners[event] ??= []).push(cb);
			},
			currentTime: 0,
			muted: false,
			preload: "",
			src: "",
			videoHeight: 240,
			videoWidth: 320,
		};

		vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
			if (tag === "video") return mockVideo as unknown as HTMLElement;
			if (tag === "canvas") return mockCanvas as unknown as HTMLElement;
			return document.createElement(tag);
		});
		vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-thumb");
		vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("extracts a frame and returns an image blob URL", async () => {
		const blob = new Blob(["x"], { type: "video/mp4" });
		const ref: FileRef = {
			name: "test.mp4",
			platform: "web",
			raw: new File([blob], "test.mp4", { type: "video/mp4" }),
			size: 1,
			type: "video/mp4",
			uri: "blob:test",
		};

		const promise = createThumbnail(ref);

		for (const cb of listeners.loadeddata ?? []) cb();
		expect(mockVideo.currentTime).toBe(1);

		for (const cb of listeners.seeked ?? []) cb();

		const result = await promise;

		expect(result).toBe("blob:mock-thumb");
		expect(mockCtx.drawImage).toHaveBeenCalled();
		expect(URL.revokeObjectURL).toHaveBeenCalled();
	});

	it("returns null for native file ref", async () => {
		const ref: FileRef = {
			name: "test.mp4",
			platform: "native",
			size: 1024,
			type: "video/mp4",
			uri: "file:///tmp/test.mp4",
		};

		const result = await createThumbnail(ref);

		expect(result).toBeNull();
		expect(URL.createObjectURL).not.toHaveBeenCalled();
	});

	it("returns null on video error", async () => {
		const blob = new Blob(["x"], { type: "video/mp4" });
		const ref: FileRef = {
			name: "bad.mp4",
			platform: "web",
			raw: new File([blob], "bad.mp4", { type: "video/mp4" }),
			size: 1,
			type: "video/mp4",
			uri: "blob:test",
		};

		const promise = createThumbnail(ref);
		for (const cb of listeners.error ?? []) cb();
		const result = await promise;

		expect(result).toBeNull();
		expect(URL.revokeObjectURL).toHaveBeenCalled();
	});

	it("revokeThumbnail calls URL.revokeObjectURL", () => {
		revokeThumbnail("blob:thumb-123");

		expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:thumb-123");
	});
});

describe("fileRef (web)", () => {
	beforeEach(() => {
		vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-uri");
		vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("toFileRef converts File to FileRef", () => {
		const blob = new Blob(["content"], { type: "video/mp4" });
		const file = new File([blob], "video.mp4", { type: "video/mp4" });

		const ref = toFileRef(file);

		expect(ref).toEqual({
			name: "video.mp4",
			platform: "web",
			raw: file,
			size: file.size,
			type: "video/mp4",
			uri: "blob:mock-uri",
		});
		expect(URL.createObjectURL).toHaveBeenCalledWith(file);
	});

	it("toFileRefs converts File array to FileRef array", () => {
		const files = [
			new File([new Blob(["a"], { type: "video/mp4" })], "a.mp4", {
				type: "video/mp4",
			}),
			new File([new Blob(["b"], { type: "video/mp4" })], "b.mp4", {
				type: "video/mp4",
			}),
		];

		const refs = toFileRefs(files);

		expect(refs).toHaveLength(2);
		expect(refs[0].name).toBe("a.mp4");
		expect(refs[1].name).toBe("b.mp4");
	});

	it("revokeFileRef calls URL.revokeObjectURL with ref.uri", () => {
		const ref: FileRef = {
			name: "test.mp4",
			platform: "native",
			size: 1024,
			type: "video/mp4",
			uri: "blob:abc-123",
		};

		revokeFileRef(ref);

		expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:abc-123");
	});
});
