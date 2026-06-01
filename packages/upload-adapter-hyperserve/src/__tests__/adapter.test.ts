import type { FileRef } from "@hyperserve/video-uploader";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HyperserveAdapter } from "../adapter/hyperserve";
import type { HyperserveUploadOptions } from "../types";

vi.mock("@hyperserve/hyperserve-js/browser", () => ({
	putVideoToStorage: vi.fn(),
}));

import { putVideoToStorage } from "@hyperserve/hyperserve-js/browser";

function makeFileRef(): FileRef {
	const blob = new Blob(["fake video content"], { type: "video/mp4" });
	const file = new File([blob], "test.mp4", { type: "video/mp4" });
	return {
		name: "test.mp4",
		platform: "web",
		raw: file,
		size: file.size,
		type: "video/mp4",
		uri: "blob:test",
	};
}

const defaultOptions: HyperserveUploadOptions = {
	isPublic: true,
	resolutions: ["240p", "480p"],
};

function makeConfig(overrides?: {
	createUpload?: () => Promise<{
		videoId: string;
		uploadUrl: string;
		contentType: string;
	}>;
	completeUpload?: (videoId: string) => Promise<void>;
}) {
	return {
		completeUpload: vi.fn().mockResolvedValue(undefined),
		createUpload: vi.fn().mockResolvedValue({
			contentType: "video/mp4",
			uploadUrl: "https://storage.example.com/presigned",
			videoId: "video-123",
		}),
		...overrides,
	};
}

describe("HyperserveAdapter (web)", () => {
	beforeEach(() => {
		vi.mocked(putVideoToStorage).mockReset();
		vi.mocked(putVideoToStorage).mockResolvedValue(undefined);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("calls createUpload, putVideoToStorage, then completeUpload in order", async () => {
		const config = makeConfig();
		const adapter = new HyperserveAdapter(config);
		const ac = new AbortController();
		const onProgress = vi.fn();

		const result = await adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress },
			ac.signal,
		);

		expect(config.createUpload).toHaveBeenCalledWith(
			expect.objectContaining({ platform: "web" }),
			defaultOptions,
		);
		expect(putVideoToStorage).toHaveBeenCalledWith(
			expect.objectContaining({
				contentType: "video/mp4",
				uploadUrl: "https://storage.example.com/presigned",
			}),
		);
		expect(config.completeUpload).toHaveBeenCalledWith("video-123");
		expect(result).toEqual({
			metadata: { isPublic: true },
			videoId: "video-123",
		});
	});

	it("passes onProgress to putVideoToStorage", async () => {
		const config = makeConfig();
		const adapter = new HyperserveAdapter(config);
		const ac = new AbortController();
		const onProgress = vi.fn();

		await adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress },
			ac.signal,
		);

		expect(putVideoToStorage).toHaveBeenCalledWith(
			expect.objectContaining({
				onProgress,
			}),
		);
	});

	it("rejects for native file ref", async () => {
		const adapter = new HyperserveAdapter(makeConfig());
		const ac = new AbortController();
		const ref: FileRef = {
			name: "test.mp4",
			platform: "native",
			size: 1024,
			type: "video/mp4",
			uri: "file:///tmp/test.mp4",
		};

		await expect(
			adapter.upload(ref, defaultOptions, { onProgress: vi.fn() }, ac.signal),
		).rejects.toThrow("File.raw is required");
	});

	it("rejects when createUpload throws", async () => {
		const config = makeConfig({
			createUpload: vi.fn().mockRejectedValue(new Error("Server error")),
		});
		const adapter = new HyperserveAdapter(config);
		const ac = new AbortController();

		await expect(
			adapter.upload(
				makeFileRef(),
				defaultOptions,
				{ onProgress: vi.fn() },
				ac.signal,
			),
		).rejects.toThrow("Server error");

		expect(putVideoToStorage).not.toHaveBeenCalled();
	});

	it("rejects when putVideoToStorage throws", async () => {
		vi.mocked(putVideoToStorage).mockRejectedValue(
			new Error("Upload failed with status 403"),
		);
		const config = makeConfig();
		const adapter = new HyperserveAdapter(config);
		const ac = new AbortController();

		await expect(
			adapter.upload(
				makeFileRef(),
				defaultOptions,
				{ onProgress: vi.fn() },
				ac.signal,
			),
		).rejects.toThrow("Upload failed with status 403");

		expect(config.completeUpload).not.toHaveBeenCalled();
	});

	it("rejects when completeUpload throws", async () => {
		const config = makeConfig({
			completeUpload: vi.fn().mockRejectedValue(new Error("Complete failed")),
		});
		const adapter = new HyperserveAdapter(config);
		const ac = new AbortController();

		await expect(
			adapter.upload(
				makeFileRef(),
				defaultOptions,
				{ onProgress: vi.fn() },
				ac.signal,
			),
		).rejects.toThrow("Complete failed");
	});

	it("passes file.raw to putVideoToStorage", async () => {
		const config = makeConfig();
		const adapter = new HyperserveAdapter(config);
		const ac = new AbortController();
		const fileRef = makeFileRef();

		await adapter.upload(
			fileRef,
			defaultOptions,
			{ onProgress: vi.fn() },
			ac.signal,
		);

		expect(putVideoToStorage).toHaveBeenCalledWith(
			expect.objectContaining({ file: (fileRef as { raw: File }).raw }),
		);
	});

	it("passes thumbnail_timestamps_seconds and custom_user_metadata through to createUpload", async () => {
		const config = makeConfig();
		const adapter = new HyperserveAdapter(config);
		const ac = new AbortController();

		const optionsWithExtras: HyperserveUploadOptions = {
			custom_user_metadata: { postId: "p_123", tag: "promo" },
			isPublic: true,
			resolutions: ["240p", "480p"],
			thumbnail_timestamps_seconds: [0, 5.5, 10],
		};

		await adapter.upload(
			makeFileRef(),
			optionsWithExtras,
			{ onProgress: vi.fn() },
			ac.signal,
		);

		expect(config.createUpload).toHaveBeenCalledWith(
			expect.objectContaining({ platform: "web" }),
			expect.objectContaining({
				custom_user_metadata: { postId: "p_123", tag: "promo" },
				thumbnail_timestamps_seconds: [0, 5.5, 10],
			}),
		);
	});
});
