import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useUpload } from "../hooks/useUpload";

vi.mock("../platform/thumbnail", () => ({
	createThumbnail: vi.fn().mockResolvedValue(null),
	revokeThumbnail: vi.fn(),
}));

describe("useUpload", () => {
	it("throws when used outside UploadProvider", () => {
		expect(() => {
			renderHook(() => useUpload());
		}).toThrow("useUpload must be used within an UploadProvider");
	});
});
