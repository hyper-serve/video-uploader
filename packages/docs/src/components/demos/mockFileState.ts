import type { FileState } from "@hyperserve/video-uploader";
import sampleThumbnail from "../../assets/sample-thumbnail.jpg";

export const THUMB_URL: string = sampleThumbnail.src;

export const VIDEO_URL =
	"https://cdn.hyperserve.io/74a26f64-f628-4409-90d3-10d77fc6c32a/02b894b7-40e5-428d-9a8d-14a723bf25ba/480p.mp4";

const mockRef = {
	name: "sample-video.mp4",
	platform: "web" as const,
	raw: null as unknown as File,
	size: 52428800,
	type: "video/mp4",
	uri: "",
};

const base: FileState = {
	error: null,
	id: "mock",
	playbackUrl: null,
	progress: 0,
	ref: mockRef,
	status: "selected",
	statusDetail: null,
	thumbnailUri: null,
	videoId: null,
};

export function mockFile(overrides: Partial<FileState> = {}): FileState {
	return { ...base, ...overrides };
}

export const selectedFile: FileState = {
	...base,
	id: "mock-selected",
	status: "selected",
	thumbnailUri: THUMB_URL,
};

export const preparingFile: FileState = {
	...base,
	id: "mock-preparing",
	status: "preparing",
	thumbnailUri: THUMB_URL,
};

export const uploadingFile: FileState = {
	...base,
	id: "mock-uploading",
	progress: 55,
	status: "uploading",
	thumbnailUri: THUMB_URL,
};

export const processingFile: FileState = {
	...base,
	id: "mock-processing",
	status: "processing",
	statusDetail: "Transcoding 60%",
	thumbnailUri: THUMB_URL,
};

export const readyFile: FileState = {
	...base,
	id: "mock-ready",
	playbackUrl: VIDEO_URL,
	status: "ready",
	thumbnailUri: THUMB_URL,
};

export const failedFile: FileState = {
	...base,
	error: "Upload failed. Check your connection.",
	id: "mock-failed",
	status: "failed",
	thumbnailUri: THUMB_URL,
};

export const mockFileList: FileState[] = [
	uploadingFile,
	processingFile,
	readyFile,
	failedFile,
];
