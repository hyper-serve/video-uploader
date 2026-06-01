import { describe, expect, it, vi } from "vitest";
import { HyperserveAdapter } from "../adapter/hyperserve";
import { createHyperserveConfig } from "../createHyperserveConfig";
import { HyperserveStatusChecker } from "../polling/index";

vi.mock("@hyperserve/hyperserve-js/browser", () => ({
	putVideoToStorage: vi.fn(),
}));

function makeCallbacks() {
	return {
		completeUpload: vi.fn().mockResolvedValue(undefined),
		createUpload: vi.fn().mockResolvedValue({
			contentType: "video/mp4",
			uploadUrl: "https://s3.example.com/presigned",
			videoId: "v1",
		}),
		pollVideoStatus: vi.fn().mockResolvedValue({ status: "failed" }),
	};
}

describe("createHyperserveConfig", () => {
	it("returns config with HyperserveAdapter and HyperserveStatusChecker", () => {
		const { createUpload, completeUpload, pollVideoStatus } = makeCallbacks();
		const config = createHyperserveConfig({
			completeUpload,
			createUpload,
			pollVideoStatus,
			uploadOptions: { isPublic: true, resolutions: ["480p"] },
		});

		expect(config.adapter).toBeInstanceOf(HyperserveAdapter);
		expect(config.statusChecker).toBeInstanceOf(HyperserveStatusChecker);
		expect(config.uploadOptions).toEqual({
			isPublic: true,
			resolutions: ["480p"],
		});
	});

	it("omits statusChecker when pollVideoStatus is not provided", () => {
		const { createUpload, completeUpload } = makeCallbacks();
		const config = createHyperserveConfig({
			completeUpload,
			createUpload,
			uploadOptions: { isPublic: true, resolutions: ["480p"] },
		});

		expect(config.statusChecker).toBeUndefined();
	});

	it("passes through maxConcurrentUploads, pollingIntervalMs, validate", () => {
		const { createUpload, completeUpload, pollVideoStatus } = makeCallbacks();
		const validate = vi.fn().mockResolvedValue({ valid: true });
		const config = createHyperserveConfig({
			completeUpload,
			createUpload,
			maxConcurrentUploads: 5,
			pollingIntervalMs: 5000,
			pollVideoStatus,
			uploadOptions: { isPublic: false, resolutions: ["1080p"] },
			validate,
		});

		expect(config.maxConcurrentUploads).toBe(5);
		expect(config.validate).toBe(validate);
		expect(config.uploadOptions).toEqual({
			isPublic: false,
			resolutions: ["1080p"],
		});
	});

	it("passes through maxFiles, onFileReady, onUploadFailed", () => {
		const { createUpload, completeUpload } = makeCallbacks();
		const onFileReady = vi.fn();
		const onUploadFailed = vi.fn();
		const config = createHyperserveConfig({
			completeUpload,
			createUpload,
			maxFiles: 5,
			onFileReady,
			onUploadFailed,
			uploadOptions: { isPublic: true, resolutions: ["480p"] },
		});

		expect(config.maxFiles).toBe(5);
		expect(config.onFileReady).toBe(onFileReady);
		expect(config.onUploadFailed).toBe(onUploadFailed);
	});

	it("passes through errorMessages", () => {
		const { createUpload, completeUpload } = makeCallbacks();
		const errorMessages = {
			processingFailed: "Processing error",
			validationError: "Validation error",
		};
		const config = createHyperserveConfig({
			completeUpload,
			createUpload,
			errorMessages,
			uploadOptions: { isPublic: true, resolutions: ["480p"] },
		});

		expect(config.errorMessages).toBe(errorMessages);
	});
});
