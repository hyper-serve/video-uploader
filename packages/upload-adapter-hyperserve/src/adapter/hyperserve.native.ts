import { putVideoToStorage } from "@hyperserve/hyperserve-js/react-native";
import type {
	FileRef,
	UploadAdapter,
	UploadResult,
} from "@hyperserve/video-uploader";
import type { BackgroundUploadModule } from "../platform/backgroundUpload.native";
import { getBackgroundUpload } from "../platform/backgroundUpload.native";
import type {
	HyperserveAdapterConfig,
	HyperserveUploadOptions,
} from "../types";

export type { BackgroundUploadModule };

export class HyperserveAdapter
	implements UploadAdapter<HyperserveUploadOptions>
{
	private bgUpload: BackgroundUploadModule | null;

	constructor(
		private config: HyperserveAdapterConfig,
		bgUpload?: BackgroundUploadModule | null,
	) {
		this.bgUpload = bgUpload ?? getBackgroundUpload();
	}

	async upload(
		file: FileRef,
		options: HyperserveUploadOptions,
		callbacks: { onProgress: (pct: number) => void },
		signal: AbortSignal,
	): Promise<UploadResult> {
		if (this.bgUpload) {
			return this.backgroundUpload(
				this.bgUpload,
				file,
				options,
				callbacks,
				signal,
			);
		}

		return this.sdkUpload(file, options, callbacks, signal);
	}

	private backgroundUpload(
		Upload: BackgroundUploadModule,
		file: FileRef,
		options: HyperserveUploadOptions,
		callbacks: { onProgress: (pct: number) => void },
		signal: AbortSignal,
	): Promise<UploadResult> {
		return new Promise((resolve, reject) => {
			this.config
				.createUpload(file, options)
				.then(({ videoId, uploadUrl, contentType }) => {
					Upload.startUpload({
						headers: { "Content-Type": contentType },
						method: "PUT",
						notification: { enabled: false },
						path: file.uri,
						type: "raw",
						url: uploadUrl,
					})
						.then((uploadId: string) => {
							const listeners: Array<{ remove: () => void }> = [];

							const cleanup = () => {
								for (const l of listeners) l.remove();
							};

							listeners.push(
								Upload.addListener("progress", uploadId, (data) => {
									callbacks.onProgress(Number(data.progress));
								}),
							);

							listeners.push(
								Upload.addListener("error", uploadId, (data) => {
									cleanup();
									reject(new Error(String(data.error)));
								}),
							);

							listeners.push(
								Upload.addListener("completed", uploadId, (data) => {
									cleanup();
									const code = Number(data.responseCode);
									if (code < 200 || code >= 300) {
										reject(
											new Error(
												`Upload failed with status ${data.responseCode}`,
											),
										);
										return;
									}
									this.config
										.completeUpload(videoId)
										.then(() => {
											resolve({
												metadata: { isPublic: options.isPublic },
												videoId,
											});
										})
										.catch(reject);
								}),
							);

							signal.addEventListener("abort", () => {
								cleanup();
								Upload.cancelUpload(uploadId);
								reject(new Error("Upload aborted"));
							});
						})
						.catch(reject);
				})
				.catch(reject);
		});
	}

	private async sdkUpload(
		file: FileRef,
		options: HyperserveUploadOptions,
		callbacks: { onProgress: (pct: number) => void },
		_signal: AbortSignal,
	): Promise<UploadResult> {
		const { videoId, uploadUrl, contentType } = await this.config.createUpload(
			file,
			options,
		);

		await putVideoToStorage({
			contentType,
			onProgress: callbacks.onProgress,
			uploadUrl,
			uri: file.uri,
		});

		await this.config.completeUpload(videoId);

		return { metadata: { isPublic: options.isPublic }, videoId };
	}
}
