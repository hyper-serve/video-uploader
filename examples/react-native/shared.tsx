import {
	allowedTypes,
	composeValidators,
	type FileRef,
	maxDuration,
	maxFileSize,
} from "@hyperserve/video-uploader";
import { createHyperserveConfig } from "@hyperserve/video-uploader-adapter-hyperserve";
import * as DocumentPicker from "expo-document-picker";

const SERVER_URL =
	process.env.EXPO_PUBLIC_SERVER_URL ?? "http://localhost:3001";

const validate = composeValidators(
	maxFileSize(500 * 1024 * 1024),
	allowedTypes(["video/*"]),
	maxDuration(120),
);

export const demoConfig = createHyperserveConfig({
	completeUpload: async (videoId) => {
		const r = await fetch(`${SERVER_URL}/complete-upload/${videoId}`, {
			method: "POST",
		});
		if (!r.ok) throw new Error(`Complete upload failed: ${r.status}`);
	},
	createUpload: async (file, options) => {
		const r = await fetch(`${SERVER_URL}/create-upload`, {
			body: JSON.stringify({
				filename: file.name,
				fileSizeBytes: file.size,
				...options,
			}),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});
		if (!r.ok) throw new Error(`Upload init failed: ${r.status}`);
		return r.json();
	},
	pollVideoStatus: async (videoId) => {
		const r = await fetch(`${SERVER_URL}/video-status/${videoId}`);
		if (!r.ok) throw new Error(`Status check failed: ${r.status}`);
		return r.json();
	},
	uploadOptions: {
		isPublic: true,
		resolutions: ["480p", "720p"],
	},
	validate,
});

export async function pickVideos(): Promise<FileRef[]> {
	const result = await DocumentPicker.getDocumentAsync({
		multiple: true,
		type: "video/*",
	});
	if (result.canceled) return [];
	return result.assets
		.filter((a) => a.mimeType?.startsWith("video/") && a.size && a.size > 0)
		.map((asset) => ({
			name: asset.name,
			platform: "native" as const,
			size: asset.size as number,
			type: asset.mimeType ?? "video/mp4",
			uri: asset.uri,
		}));
}
