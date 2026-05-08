import type {
	ProcessingStatus,
	StatusChecker,
	UploadResult,
} from "@hyperserve/video-uploader";
import type { VideoStatusResult } from "../types.js";
import { backoffDelay } from "./backoff.js";

type PollOptions = {
	getVideoStatus: (videoId: string) => Promise<VideoStatusResult>;
	intervalMs: number;
	onStatusChange: (
		status: ProcessingStatus,
		data?: { playbackUrl?: string; thumbnailUri?: string; statusDetail?: string },
	) => void;
	signal: AbortSignal;
	videoId: string;
};

export function pollVideoStatus(options: PollOptions): void {
	const { getVideoStatus, intervalMs, onStatusChange, signal, videoId } =
		options;

	let consecutiveErrors = 0;

	const poll = async () => {
		if (signal.aborted) return;

		try {
			const result = await getVideoStatus(videoId);
			consecutiveErrors = 0;

			if (result.status === "ready") {
				onStatusChange("ready", { playbackUrl: result.playbackUrl });
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
		onStatusChange: (
			status: ProcessingStatus,
			data?: { playbackUrl?: string; thumbnailUri?: string; statusDetail?: string },
		) => void;
		signal: AbortSignal;
	}): void {
		pollVideoStatus({
			getVideoStatus: this.getVideoStatus,
			intervalMs: this.intervalMs,
			onStatusChange: options.onStatusChange,
			signal: options.signal,
			videoId: options.uploadResult.videoId,
		});
	}
}
