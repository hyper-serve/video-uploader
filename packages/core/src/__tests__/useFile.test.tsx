import { act, renderHook } from "@testing-library/react";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UploadProvider } from "../context";
import { useFile } from "../hooks/useFile";
import { useUpload } from "../hooks/useUpload";
import type { FileRef, UploadConfig, UploadResult } from "../types";

vi.mock("../platform/thumbnail", () => ({
	createThumbnail: vi.fn().mockResolvedValue(null),
	revokeThumbnail: vi.fn(),
}));

function makeConfig(): UploadConfig {
	return {
		adapter: {
			upload: vi.fn(() => new Promise<UploadResult>(() => {})),
		},
		uploadOptions: { isPublic: true, resolutions: "480p" },
	};
}

describe("useFile", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("throws when used outside UploadProvider", () => {
		expect(() => {
			renderHook(() => useFile("some-id"));
		}).toThrow("useFile must be used within an UploadProvider");
	});

	it("returns undefined for a non-existent fileId", () => {
		const config = makeConfig();
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<UploadProvider config={config}>{children}</UploadProvider>
		);
		const { result } = renderHook(() => useFile("non-existent"), { wrapper });
		expect(result.current).toBeUndefined();
	});

	it("returns the matching FileState by id", async () => {
		const config = makeConfig();
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<UploadProvider config={config}>{children}</UploadProvider>
		);

		const { result, rerender } = renderHook(
			({ fileId }: { fileId: string }) => ({
				file: useFile(fileId),
				upload: useUpload(),
			}),
			{ initialProps: { fileId: "" }, wrapper },
		);

		const ref: FileRef = {
			name: "test.mp4",
			platform: "native",
			size: 1024,
			type: "video/mp4",
			uri: "blob:test",
		};

		act(() => {
			result.current.upload.addFiles([ref]);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});

		expect(result.current.upload.files).toHaveLength(1);
		const addedId = result.current.upload.files[0].id;

		rerender({ fileId: addedId });

		expect(result.current.file).toBeDefined();
		expect(result.current.file?.ref.name).toBe("test.mp4");
		expect(result.current.file?.id).toBe(addedId);
	});
});
