import type { FileRef, ProcessingStatus } from "@hyperserve/video-uploader";

export type HyperserveUploadOptions = {
	resolutions: string[];
	isPublic: boolean;
	thumbnail_timestamps_seconds?: number[];
	custom_user_metadata?: Record<string, unknown>;
};

export type HyperserveAdapterConfig = {
	createUpload: (
		file: FileRef,
		options: HyperserveUploadOptions,
	) => Promise<{ videoId: string; uploadUrl: string; contentType: string }>;
	completeUpload: (videoId: string) => Promise<void>;
};

export type VideoStatusResult = {
	status: ProcessingStatus;
	playbackUrl?: string;
	thumbnailUri?: string;
	statusDetail?: string;
};
