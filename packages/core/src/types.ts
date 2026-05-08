export type NativeFileRef = {
	platform: "native";
	uri: string;
	name: string;
	size: number;
	type: string;
};

export type WebFileRef = {
	platform: "web";
	uri: string;
	name: string;
	size: number;
	type: string;
	raw: File;
};

export type FileRef = NativeFileRef | WebFileRef;

export type FileStatus =
	| "selected"
	| "validating"
	| "uploading"
	| "processing"
	| "ready"
	| "failed";

export type FileState = {
	id: string;
	ref: FileRef;
	status: FileStatus;
	progress: number;
	thumbnailUri: string | null;
	playbackUrl: string | null;
	videoId: string | null;
	error: string | null;
	statusDetail: string | null;
};

export type ValidationResult =
	| { valid: true }
	| { valid: false; reason: string };

export type UploadResult = {
	videoId: string;
	playbackUrl?: string;
	metadata?: Record<string, unknown>;
};

export type StatusUpdateData = {
	playbackUrl?: string;
	thumbnailUri?: string;
	statusDetail?: string;
};

export type ErrorMessages = {
	validationError?: string;
	uploadFailed?: string;
	processingFailed?: string;
};

export type UploadConfig<TOptions = Record<string, unknown>> = {
	adapter: UploadAdapter<TOptions>;
	statusChecker?: StatusChecker;
	validate?: (file: FileRef) => ValidationResult | Promise<ValidationResult>;
	uploadOptions: TOptions;
	maxConcurrentUploads?: number;
	maxFiles?: number;
	errorMessages?: ErrorMessages;
	onFileReady?: (file: FileState) => void;
	onUploadFailed?: (file: FileState) => void;
};

export type UploadContextValue = {
	files: FileState[];
	addFiles: (files: FileRef[]) => void;
	removeFile: (id: string) => void;
	retryFile: (id: string) => void;
	updateFileStatus: (
		videoId: string,
		status: "ready" | "failed",
		data?: StatusUpdateData,
	) => void;
	maxFiles?: number;
	canAddMore: boolean;
	isUploading: boolean;
	hasErrors: boolean;
	allReady: boolean;
	allSettled: boolean;
	readyCount: number;
	failedCount: number;
};

export interface UploadAdapter<TOptions = Record<string, unknown>> {
	upload(
		file: FileRef,
		options: TOptions,
		callbacks: { onProgress: (pct: number) => void },
		signal: AbortSignal,
	): Promise<UploadResult>;
}

export type ProcessingStatus = "processing" | "ready" | "failed";

export interface StatusChecker {
	checkStatus(options: {
		uploadResult: UploadResult;
		onStatusChange: (
			status: ProcessingStatus,
			data?: StatusUpdateData,
		) => void;
		signal: AbortSignal;
	}): void;
}
