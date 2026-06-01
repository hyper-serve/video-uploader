import { describe, expect, it } from "vitest";
import { filterFilesByAccept } from "../acceptFilter";

function makeFile(name: string, type: string): File {
	return new File([], name, { type });
}

describe("filterFilesByAccept", () => {
	it("returns all files when accept is empty or whitespace", () => {
		const files = [
			makeFile("a.mp4", "video/mp4"),
			makeFile("b.txt", "text/plain"),
		];
		expect(filterFilesByAccept(files, "")).toEqual(files);
		expect(filterFilesByAccept(files, "   ")).toEqual(files);
	});

	it("filters by MIME type video/*", () => {
		const files = [
			makeFile("a.mp4", "video/mp4"),
			makeFile("b.webm", "video/webm"),
			makeFile("c.txt", "text/plain"),
			makeFile("d.png", "image/png"),
		];
		const out = filterFilesByAccept(files, "video/*");
		expect(out).toHaveLength(2);
		expect(out.map((f) => f.name)).toEqual(["a.mp4", "b.webm"]);
	});

	it("filters by specific MIME type", () => {
		const files = [
			makeFile("a.mp4", "video/mp4"),
			makeFile("b.mov", "video/quicktime"),
		];
		expect(filterFilesByAccept(files, "video/mp4")).toHaveLength(1);
		expect(filterFilesByAccept(files, "video/mp4")[0].name).toBe("a.mp4");
		expect(filterFilesByAccept(files, "video/quicktime")).toHaveLength(1);
		expect(filterFilesByAccept(files, "video/quicktime")[0].name).toBe("b.mov");
	});

	it("filters by file extension", () => {
		const files = [
			makeFile("a.mp4", "video/mp4"),
			makeFile("b.MP4", "video/mp4"),
			makeFile("c.mov", "video/quicktime"),
			makeFile("d.avi", "video/x-msvideo"),
		];
		const out = filterFilesByAccept(files, ".mp4,.mov");
		expect(out).toHaveLength(3);
		expect(out.map((f) => f.name).sort()).toEqual(["a.mp4", "b.MP4", "c.mov"]);
	});

	it("accepts comma-separated tokens with spaces", () => {
		const files = [
			makeFile("a.mp4", "video/mp4"),
			makeFile("b.webm", "video/webm"),
		];
		const out = filterFilesByAccept(files, " video/* , .webm ");
		expect(out).toHaveLength(2);
	});

	it("returns empty array when nothing matches", () => {
		const files = [
			makeFile("a.txt", "text/plain"),
			makeFile("b.png", "image/png"),
		];
		expect(filterFilesByAccept(files, "video/*")).toEqual([]);
		expect(filterFilesByAccept(files, ".mp4")).toEqual([]);
	});

	it("matches empty type when extension matches", () => {
		const file = makeFile("video.mp4", "");
		expect(filterFilesByAccept([file], ".mp4")).toHaveLength(1);
		expect(filterFilesByAccept([file], "video/*")).toHaveLength(0);
	});
});
