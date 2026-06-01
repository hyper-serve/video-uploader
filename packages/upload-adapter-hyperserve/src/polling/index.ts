import type {
	ProcessingStatus,
	StatusChecker,
	StatusUpdateData,
	UploadResult,
} from "@hyperserve/video-uploader";
import type { VideoStatusResult } from "../types";
import { backoffDelay } from "./backoff";

export class HyperserveStatusChecker implements StatusChecker {
	private getVideoStatus: (videoId: string) => Promise<VideoStatusResult>;
	private intervalMs: number;

	constructor(config: {
		getVideoStatus: (videoId: string) => Promise<VideoStatusResult>;
		intervalMs?: number;
	}) {
		this.getVideoStatus = config.getVideoStatus;
		this.intervalMs = config.intervalMs ?? 3000;
	}

	checkStatus(options: {
		uploadResult: UploadResult;
		onStatusChange: (status: ProcessingStatus, data?: StatusUpdateData) => void;
		signal: AbortSignal;
	}): void {
		const { uploadResult, onStatusChange, signal } = options;
		const { videoId } = uploadResult;
		const { getVideoStatus, intervalMs } = this;
		let consecutiveErrors = 0;

		const poll = async () => {
			if (signal.aborted) return;
			try {
				const result = await getVideoStatus(videoId);
				consecutiveErrors = 0;

				if (result.status === "ready") {
					onStatusChange("ready", {
						playbackUrl: result.playbackUrl,
						thumbnailUri: result.thumbnailUri,
					});
					return;
				}
				if (result.status === "failed") {
					onStatusChange("failed");
					return;
				}
				onStatusChange("processing", { statusDetail: result.statusDetail });
				setTimeout(poll, intervalMs);
			} catch (_error) {
				if (signal.aborted) return;
				consecutiveErrors += 1;
				setTimeout(poll, backoffDelay(intervalMs, consecutiveErrors));
			}
		};

		poll();
	}
}
