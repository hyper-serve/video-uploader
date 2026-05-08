import type React from "react";
import {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from "react";
import { createThumbnail, revokeThumbnail } from "./platform/thumbnail.js";
import type {
	FileRef,
	FileState,
	FileStatus,
	StatusUpdateData,
	UploadConfig,
	UploadContextValue,
} from "./types.js";

function generateId(): string {
	if (typeof crypto !== "undefined" && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

type FileAction =
	| { files: FileState[]; type: "ADD_FILES" }
	| { id: string; type: "REMOVE_FILE" }
	| { id: string; type: "RETRY_FILE" }
	| { id: string; type: "UPDATE_FILE"; updates: Partial<FileState> };

function fileReducer(state: FileState[], action: FileAction): FileState[] {
	switch (action.type) {
		case "ADD_FILES":
			return [...state, ...action.files];
		case "UPDATE_FILE":
			return state.map((f) =>
				f.id === action.id ? { ...f, ...action.updates } : f,
			);
		case "REMOVE_FILE":
			return state.filter((f) => f.id !== action.id);
		case "RETRY_FILE":
			return state.map((f) =>
				f.id === action.id
					? {
							...f,
							error: null,
							progress: 0,
							status: "selected" as const,
							statusDetail: null,
						}
					: f,
			);
		default:
			return state;
	}
}

export const UploadContext = createContext<UploadContextValue | null>(null);

type UploadProviderProps<TOptions> = {
	children: React.ReactNode;
	config: UploadConfig<TOptions>;
};

export function UploadProvider<TOptions>({
	config,
	children,
}: UploadProviderProps<TOptions>) {
	const [files, dispatch] = useReducer(fileReducer, []);

	const configRef = useRef(config);
	configRef.current = config;
	const filesRef = useRef(files);
	filesRef.current = files;
	const filesCountRef = useRef(0);
	filesCountRef.current = files.length;

	const [schedulerTick, setSchedulerTick] = useState(0);
	const bumpScheduler = useCallback(() => setSchedulerTick((t) => t + 1), []);

	const [statusChangeTick, setStatusChangeTick] = useState(0);
	const bumpStatusChange = useCallback(
		() => setStatusChangeTick((t) => t + 1),
		[],
	);

	const abortControllers = useRef(new Map<string, AbortController>());
	const processingIds = useRef(new Set<string>());
	const thumbnailUrisRef = useRef(new Map<string, string>());

	const dispatchWithStatusTracking = useCallback(
		(action: FileAction) => {
			dispatch(action);
			if (
				action.type !== "UPDATE_FILE" ||
				action.updates.status !== undefined
			) {
				bumpStatusChange();
			}
		},
		[bumpStatusChange],
	);

	const processFile = useCallback(
		async (file: FileState) => {
			const ac = new AbortController();
			abortControllers.current.set(file.id, ac);
			const cfg = configRef.current;

			if (cfg.validate) {
				dispatchWithStatusTracking({
					id: file.id,
					type: "UPDATE_FILE",
					updates: { status: "validating" },
				});
				try {
					const result = await cfg.validate(file.ref);
					if (!result.valid) {
						dispatchWithStatusTracking({
							id: file.id,
							type: "UPDATE_FILE",
							updates: { error: result.reason, status: "failed" },
						});
						abortControllers.current.delete(file.id);
						processingIds.current.delete(file.id);
						bumpScheduler();
						return;
					}
				} catch {
					dispatchWithStatusTracking({
						id: file.id,
						type: "UPDATE_FILE",
						updates: {
							error: cfg.errorMessages?.validationError ?? "Validation error",
							status: "failed",
						},
					});
					abortControllers.current.delete(file.id);
					processingIds.current.delete(file.id);
					bumpScheduler();
					return;
				}
			}

			dispatchWithStatusTracking({
				id: file.id,
				type: "UPDATE_FILE",
				updates: { status: "uploading" },
			});

			try {
				const uploadResult = await cfg.adapter.upload(
					file.ref,
					cfg.uploadOptions,
					{
						onProgress: (pct) =>
							dispatch({
								id: file.id,
								type: "UPDATE_FILE",
								updates: { progress: pct },
							}),
					},
					ac.signal,
				);

				if (uploadResult.playbackUrl) {
					const thumbnailUri = thumbnailUrisRef.current.get(file.id);
					if (thumbnailUri) {
						revokeThumbnail(thumbnailUri);
						thumbnailUrisRef.current.delete(file.id);
					}
					dispatchWithStatusTracking({
						id: file.id,
						type: "UPDATE_FILE",
						updates: {
							playbackUrl: uploadResult.playbackUrl,
							progress: 100,
							status: "ready",
							thumbnailUri: null,
							videoId: uploadResult.videoId,
						},
					});
					abortControllers.current.delete(file.id);
					processingIds.current.delete(file.id);
					bumpScheduler();
					return;
				}

				dispatchWithStatusTracking({
					id: file.id,
					type: "UPDATE_FILE",
					updates: {
						progress: 100,
						status: "processing",
						videoId: uploadResult.videoId,
					},
				});

				if (cfg.statusChecker) {
					cfg.statusChecker.checkStatus({
						onStatusChange: (status, data) => {
							if (status === "processing") {
								dispatch({
									id: file.id,
									type: "UPDATE_FILE",
									updates: {
										statusDetail: data?.statusDetail ?? null,
									},
								});
								return;
							}

							dispatchWithStatusTracking({
								id: file.id,
								type: "UPDATE_FILE",
								updates: {
									error:
										status === "failed"
											? (cfg.errorMessages?.processingFailed ??
												"Processing failed")
											: null,
									...(data?.playbackUrl !== undefined && {
										playbackUrl: data.playbackUrl,
									}),
									...(data?.thumbnailUri !== undefined && {
										thumbnailUri: data.thumbnailUri,
									}),
									status: status === "ready" ? "ready" : "failed",
									statusDetail: null,
								},
							});
							abortControllers.current.delete(file.id);
							processingIds.current.delete(file.id);
						},
						signal: ac.signal,
						uploadResult,
					});
				} else {
					abortControllers.current.delete(file.id);
					processingIds.current.delete(file.id);
				}
				// Slot freed: file left validating/uploading (now processing or no statusChecker)
				bumpScheduler();
			} catch (err) {
				if (!ac.signal.aborted) {
					dispatchWithStatusTracking({
						id: file.id,
						type: "UPDATE_FILE",
						updates: {
							error:
								err instanceof Error
									? err.message
									: (cfg.errorMessages?.uploadFailed ?? "Upload failed"),
							status: "failed",
						},
					});
				}
				abortControllers.current.delete(file.id);
				processingIds.current.delete(file.id);
				bumpScheduler();
			}
		},
		[bumpScheduler, dispatchWithStatusTracking],
	);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		const currentFiles = filesRef.current;
		const maxConcurrent = configRef.current.maxConcurrentUploads ?? 3;
		const activeCount = currentFiles.filter(
			(f) => f.status === "validating" || f.status === "uploading",
		).length;
		const slotsAvailable = maxConcurrent - activeCount;

		if (slotsAvailable <= 0) return;

		const pending = currentFiles.filter(
			(f) => f.status === "selected" && !processingIds.current.has(f.id),
		);

		for (let i = 0; i < Math.min(slotsAvailable, pending.length); i++) {
			processingIds.current.add(pending[i].id);
			processFile(pending[i]);
		}
	}, [schedulerTick]);

	useEffect(() => {
		return () => {
			for (const ac of abortControllers.current.values()) {
				ac.abort();
			}
			for (const uri of thumbnailUrisRef.current.values()) {
				revokeThumbnail(uri);
			}
		};
	}, []);

	const addFiles = useCallback(
		(refs: FileRef[]) => {
			const maxFiles = configRef.current.maxFiles;
			const currentCount = filesCountRef.current;
			const allowed =
				maxFiles == null
					? refs
					: refs.slice(0, Math.max(0, maxFiles - currentCount));
			if (allowed.length === 0) return;

			const newFiles: FileState[] = allowed.map((ref) => ({
				error: null,
				id: generateId(),
				playbackUrl: null,
				progress: 0,
				ref,
				status: "selected" as const,
				statusDetail: null,
				thumbnailUri: null,
				videoId: null,
			}));
			dispatchWithStatusTracking({ files: newFiles, type: "ADD_FILES" });
			bumpScheduler();

			for (const file of newFiles) {
				createThumbnail(file.ref)
					.then((uri) => {
						if (uri) {
							thumbnailUrisRef.current.set(file.id, uri);
							dispatch({
								id: file.id,
								type: "UPDATE_FILE",
								updates: { thumbnailUri: uri },
							});
						}
					})
					.catch(() => {});
			}
		},
		[bumpScheduler, dispatchWithStatusTracking],
	);

	const removeFile = useCallback(
		(id: string) => {
			const file = filesRef.current.find((f) => f.id === id);
			if (file?.status === "processing" || file?.status === "ready") {
				return;
			}
			const thumbnailUri = thumbnailUrisRef.current.get(id);
			if (thumbnailUri) {
				revokeThumbnail(thumbnailUri);
				thumbnailUrisRef.current.delete(id);
			}
			const ac = abortControllers.current.get(id);
			if (ac) {
				ac.abort();
				abortControllers.current.delete(id);
			}
			processingIds.current.delete(id);
			dispatchWithStatusTracking({ id, type: "REMOVE_FILE" });
		},
		[dispatchWithStatusTracking],
	);

	const retryFile = useCallback(
		(id: string) => {
			const ac = abortControllers.current.get(id);
			if (ac) {
				ac.abort();
				abortControllers.current.delete(id);
			}
			processingIds.current.delete(id);
			dispatchWithStatusTracking({ id, type: "RETRY_FILE" });
			bumpScheduler();
		},
		[bumpScheduler, dispatchWithStatusTracking],
	);

	const updateFileStatus = useCallback(
		(videoId: string, status: "ready" | "failed", data?: StatusUpdateData) => {
			const file = filesRef.current.find(
				(f) => f.videoId === videoId && f.status === "processing",
			);
			if (!file) return;

			dispatchWithStatusTracking({
				id: file.id,
				type: "UPDATE_FILE",
				updates: {
					error:
						status === "failed"
							? (configRef.current.errorMessages?.processingFailed ??
								"Processing failed")
							: null,
					...(data?.playbackUrl !== undefined && { playbackUrl: data.playbackUrl }),
					...(data?.thumbnailUri !== undefined && { thumbnailUri: data.thumbnailUri }),
					status,
					statusDetail: null,
				},
			});
		},
		[dispatchWithStatusTracking],
	);

	const maxFiles = configRef.current.maxFiles;
	const canAddMore = maxFiles == null || files.length < maxFiles;
	const isUploading = files.some(
		(f) => f.status === "uploading" || f.status === "validating",
	);
	const hasErrors = files.some((f) => f.status === "failed");
	const allReady = files.length > 0 && files.every((f) => f.status === "ready");
	const readyCount = files.filter((f) => f.status === "ready").length;
	const failedCount = files.filter((f) => f.status === "failed").length;
	const allSettled =
		files.length > 0 &&
		files.every((f) => f.status === "ready" || f.status === "failed");

	const value: UploadContextValue = useMemo(
		() => ({
			addFiles,
			allReady,
			allSettled,
			canAddMore,
			failedCount,
			files,
			hasErrors,
			isUploading,
			maxFiles,
			readyCount,
			removeFile,
			retryFile,
			updateFileStatus,
		}),
		[
			files,
			addFiles,
			removeFile,
			retryFile,
			updateFileStatus,
			maxFiles,
			canAddMore,
			isUploading,
			hasErrors,
			allReady,
			allSettled,
			readyCount,
			failedCount,
		],
	);

	const prevStatusById = useRef<Map<string, FileStatus>>(new Map());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		const cfg = configRef.current;
		const onReady = cfg.onFileReady;
		const onFailed = cfg.onUploadFailed;
		if (!onReady && !onFailed) return;
		const currentFiles = filesRef.current;
		const prev = prevStatusById.current;
		for (const file of currentFiles) {
			const p = prev.get(file.id);
			if (file.status === "ready" && p !== undefined && p !== "ready") {
				onReady?.(file);
			} else if (
				file.status === "failed" &&
				p !== undefined &&
				p !== "failed"
			) {
				onFailed?.(file);
			}
			prev.set(file.id, file.status);
		}
		for (const id of prev.keys()) {
			if (!currentFiles.some((f) => f.id === id)) prev.delete(id);
		}
	}, [statusChangeTick]);

	return (
		<UploadContext.Provider value={value}>{children}</UploadContext.Provider>
	);
}
