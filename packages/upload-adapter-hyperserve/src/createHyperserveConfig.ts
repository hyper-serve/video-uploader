import type {
	ErrorMessages,
	FileRef,
	FileState,
	UploadConfig,
	ValidationResult,
} from "@hyperserve/video-uploader";
import { HyperserveAdapter } from "./adapter/hyperserve";
import { HyperserveStatusChecker } from "./polling/index";
import type {
	HyperserveAdapterConfig,
	HyperserveUploadOptions,
	VideoStatusResult,
} from "./types";

export type HyperserveConfig = HyperserveAdapterConfig & {
	/**
	 * Polling fetch for video status. Provide this if your backend has no
	 * push channel. For push delivery (webhook, SSE, Realtime broadcast),
	 * skip this and call `updateFileStatus` from `useUpload()` instead.
	 */
	pollVideoStatus?: (videoId: string) => Promise<VideoStatusResult>;
	maxConcurrentUploads?: number;
	maxFiles?: number;
	pollingIntervalMs?: number;
	uploadOptions: HyperserveUploadOptions;
	errorMessages?: ErrorMessages;
	validate?: (file: FileRef) => ValidationResult | Promise<ValidationResult>;
	onFileReady?: (file: FileState) => void;
	onUploadFailed?: (file: FileState) => void;
};

export function createHyperserveConfig(
	options: HyperserveConfig,
): UploadConfig<HyperserveUploadOptions> {
	return {
		adapter: new HyperserveAdapter({
			completeUpload: options.completeUpload,
			createUpload: options.createUpload,
		}),
		errorMessages: options.errorMessages,
		maxConcurrentUploads: options.maxConcurrentUploads,
		maxFiles: options.maxFiles,
		onFileReady: options.onFileReady,
		onUploadFailed: options.onUploadFailed,
		statusChecker: options.pollVideoStatus
			? new HyperserveStatusChecker({
					getVideoStatus: options.pollVideoStatus,
					intervalMs: options.pollingIntervalMs,
				})
			: undefined,
		uploadOptions: options.uploadOptions,
		validate: options.validate,
	};
}
