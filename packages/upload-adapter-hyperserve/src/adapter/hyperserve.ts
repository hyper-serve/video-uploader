import { putVideoToStorage } from "@hyperserve/hyperserve-js/browser";
import type {
	FileRef,
	UploadAdapter,
	UploadResult,
} from "@hyperserve/video-uploader";
import type {
	HyperserveAdapterConfig,
	HyperserveUploadOptions,
} from "../types";

export class HyperserveAdapter
	implements UploadAdapter<HyperserveUploadOptions>
{
	constructor(private config: HyperserveAdapterConfig) {}

	async upload(
		file: FileRef,
		options: HyperserveUploadOptions,
		callbacks: { onProgress: (pct: number) => void },
		_signal: AbortSignal,
	): Promise<UploadResult> {
		if (file.platform === "native") {
			throw new Error("File.raw is required for web uploads");
		}

		const { videoId, uploadUrl, contentType } = await this.config.createUpload(
			file,
			options,
		);

		await putVideoToStorage({
			contentType,
			file: file.raw,
			onProgress: callbacks.onProgress,
			uploadUrl,
		});

		await this.config.completeUpload(videoId);

		return { metadata: { isPublic: options.isPublic }, videoId };
	}
}
