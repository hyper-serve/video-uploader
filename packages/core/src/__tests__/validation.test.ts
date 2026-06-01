import { describe, expect, it } from "vitest";
import type { FileRef } from "../types";
import {
	allowedTypes,
	composeValidators,
	maxFileSize,
} from "../validation/index";

function makeFileRef(
	overrides: { size?: number; type?: string; name?: string } = {},
): FileRef {
	return {
		name: "test.mp4",
		platform: "native",
		size: 1024 * 1024,
		type: "video/mp4",
		uri: "blob:test",
		...overrides,
	};
}

describe("maxFileSize", () => {
	it("passes when file is under limit", () => {
		const validator = maxFileSize(10 * 1024 * 1024);
		const result = validator(makeFileRef({ size: 5 * 1024 * 1024 }));
		expect(result).toEqual({ valid: true });
	});

	it("fails when file exceeds limit", () => {
		const validator = maxFileSize(1 * 1024 * 1024);
		const result = validator(makeFileRef({ size: 2 * 1024 * 1024 }));
		expect(result).toEqual({
			reason: "File exceeds maximum size of 1MB",
			valid: false,
		});
	});

	it("passes when file is exactly at limit", () => {
		const validator = maxFileSize(1024);
		const result = validator(makeFileRef({ size: 1024 }));
		expect(result).toEqual({ valid: true });
	});
});

describe("allowedTypes", () => {
	it("passes when type matches exactly", () => {
		const validator = allowedTypes(["video/mp4", "video/quicktime"]);
		const result = validator(makeFileRef({ type: "video/mp4" }));
		expect(result).toEqual({ valid: true });
	});

	it("fails when type does not match", () => {
		const validator = allowedTypes(["video/mp4"]);
		const result = validator(makeFileRef({ type: "image/png" }));
		expect(result).toMatchObject({ valid: false });
	});

	it("supports wildcard patterns", () => {
		const validator = allowedTypes(["video/*"]);
		const result = validator(makeFileRef({ type: "video/webm" }));
		expect(result).toEqual({ valid: true });
	});

	it("rejects non-matching wildcard", () => {
		const validator = allowedTypes(["video/*"]);
		const result = validator(makeFileRef({ type: "image/png" }));
		expect(result).toMatchObject({ valid: false });
	});
});

describe("allowedTypes edge cases", () => {
	it("rejects all files when types array is empty", () => {
		const validator = allowedTypes([]);
		const result = validator(makeFileRef({ type: "video/mp4" }));
		expect(result).toMatchObject({ valid: false });
	});
});

describe("composeValidators", () => {
	it("passes when all validators pass", async () => {
		const validator = composeValidators(
			maxFileSize(10 * 1024 * 1024),
			allowedTypes(["video/mp4"]),
		);
		const result = await validator(makeFileRef());
		expect(result).toEqual({ valid: true });
	});

	it("fails on first failing validator", async () => {
		const validator = composeValidators(
			maxFileSize(100),
			allowedTypes(["video/mp4"]),
		);
		const result = await validator(makeFileRef({ size: 200 }));
		expect(result).toMatchObject({ valid: false });
		expect(result).toHaveProperty("reason");
	});

	it("returns failure from second validator if first passes", async () => {
		const validator = composeValidators(
			maxFileSize(10 * 1024 * 1024),
			allowedTypes(["video/webm"]),
		);
		const result = await validator(makeFileRef({ type: "video/mp4" }));
		expect(result).toMatchObject({ valid: false });
	});

	it("returns valid when composed with zero validators", async () => {
		const validator = composeValidators();
		const result = await validator(makeFileRef());
		expect(result).toEqual({ valid: true });
	});

	it("works with a single validator", async () => {
		const validator = composeValidators(maxFileSize(100));
		const result = await validator(makeFileRef({ size: 200 }));
		expect(result).toMatchObject({ valid: false });
	});

	it("handles async validators correctly", async () => {
		const asyncValidator = async (file: FileRef) => {
			await new Promise((r) => setTimeout(r, 10));
			return file.size > 500
				? { reason: "too big", valid: false as const }
				: { valid: true as const };
		};
		const validator = composeValidators(
			asyncValidator,
			allowedTypes(["video/mp4"]),
		);
		const result = await validator(makeFileRef({ size: 1000 }));
		expect(result).toEqual({ reason: "too big", valid: false });
	});
});
