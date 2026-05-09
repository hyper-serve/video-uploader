import type {
	FileRef,
	StatusChecker,
	StatusUpdateData,
	UploadAdapter,
	UploadConfig,
	UploadResult,
} from "@hyperserve/video-uploader";
import {
	allowedTypes,
	composeValidators,
	maxFileSize,
} from "@hyperserve/video-uploader";

type MockOptions = Record<string, never>;

const UPLOAD_DURATION_MS = 3000;
const PROCESSING_DURATION_MS = 2000;
const PROGRESS_INTERVAL_MS = 80;

class MockUploadAdapter implements UploadAdapter<MockOptions> {
	private failNext = false;

	setFailNext(fail: boolean) {
		this.failNext = fail;
	}

	async upload(
		_file: FileRef,
		_options: MockOptions,
		callbacks: { onProgress: (pct: number) => void },
		signal: AbortSignal,
	): Promise<UploadResult> {
		const steps = Math.floor(UPLOAD_DURATION_MS / PROGRESS_INTERVAL_MS);

		for (let i = 1; i <= steps; i++) {
			if (signal.aborted) throw new DOMException("Aborted", "AbortError");
			await sleep(PROGRESS_INTERVAL_MS);
			callbacks.onProgress(Math.min((i / steps) * 100, 100));
		}

		if (this.failNext) {
			this.failNext = false;
			throw new Error("Simulated upload failure");
		}

		const videoId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
		return { videoId };
	}
}

class MockStatusChecker implements StatusChecker {
	checkStatus(options: {
		uploadResult: UploadResult;
		onStatusChange: (
			status: "processing" | "ready" | "failed",
			data?: StatusUpdateData,
		) => void;
		signal: AbortSignal;
	}): void {
		const { onStatusChange, signal } = options;

		let elapsed = 0;
		const interval = setInterval(() => {
			if (signal.aborted) {
				clearInterval(interval);
				return;
			}
			elapsed += 500;
			if (elapsed < PROCESSING_DURATION_MS) {
				const pct = Math.round((elapsed / PROCESSING_DURATION_MS) * 100);
				onStatusChange("processing", { statusDetail: `Transcoding ${pct}%` });
			} else {
				clearInterval(interval);
				onStatusChange("ready");
			}
		}, 500);
	}
}

function sleep(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}

const mockAdapter = new MockUploadAdapter();

export function createMockConfig(): UploadConfig<MockOptions> {
	return {
		adapter: mockAdapter,
		maxConcurrentUploads: 3,
		statusChecker: new MockStatusChecker(),
		uploadOptions: {} as MockOptions,
		validate: composeValidators(
			maxFileSize(500 * 1024 * 1024),
			allowedTypes(["video/*"]),
		),
	};
}
