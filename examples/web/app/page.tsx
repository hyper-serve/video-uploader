"use client";

import {
	allowedTypes,
	composeValidators,
	maxFileSize,
	UploadProvider,
} from "@hyperserve/video-uploader";
import { createHyperserveConfig } from "@hyperserve/video-uploader-adapter-hyperserve";
import {
	DropZone,
	FileList,
	FileListToolbar,
	ViewModeProvider,
} from "@hyperserve/video-uploader-react";
import { useMemo } from "react";

function makeConfig() {
	return createHyperserveConfig({
		completeUpload: async (videoId) => {
			const r = await fetch(`/api/complete-upload/${videoId}`, {
				method: "POST",
			});
			if (!r.ok) throw new Error(`Complete upload failed: ${r.status}`);
		},
		createUpload: async (file, options) => {
			const r = await fetch("/api/create-upload", {
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
			const r = await fetch(`/api/video-status/${videoId}`);
			if (!r.ok) throw new Error(`Status check failed: ${r.status}`);
			return r.json();
		},
		uploadOptions: { isPublic: true, resolutions: ["480p", "720p"] },
		validate: composeValidators(
			maxFileSize(500 * 1024 * 1024),
			allowedTypes(["video/*"]),
		),
	});
}

export default function Page() {
	const config = useMemo(() => makeConfig(), []);

	return (
		<main style={styles.main}>
			<div style={styles.container}>
				<h1 style={styles.title}>Video Upload</h1>
				<p style={styles.subtitle}>
					Upload videos to Hyperserve for transcoding and streaming.
				</p>
				<UploadProvider config={config}>
					<ViewModeProvider>
						<DropZone supportingText="MP4, WebM, MOV — up to 500 MB" />
						<FileListToolbar right={<FileListToolbar.ViewToggle />} />
						<FileList emptyMessage="Drop or browse files to begin." />
					</ViewModeProvider>
				</UploadProvider>
			</div>
		</main>
	);
}

const styles = {
	container: { margin: "0 auto", maxWidth: 720 },
	main: { minHeight: "100vh", padding: "2rem 1rem" },
	subtitle: { color: "#64748b", margin: "0 0 2rem" },
	title: { fontSize: "1.75rem", fontWeight: 700, margin: "0 0 0.5rem" },
} satisfies Record<string, React.CSSProperties>;
