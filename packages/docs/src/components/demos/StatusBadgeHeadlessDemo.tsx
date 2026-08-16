import type { FileStatus } from "@hyperserve/video-uploader";
import { StatusBadge } from "@hyperserve/video-uploader-react";

const statuses: FileStatus[] = [
	"selected",
	"preparing",
	"uploading",
	"processing",
	"ready",
	"failed",
];

export default function StatusBadgeHeadlessDemo() {
	return (
		<div
			className="not-content"
			style={{
				alignItems: "center",
				background: "#fff",
				border: "1px solid #e2e8f0",
				borderRadius: 8,
				display: "flex",
				flexWrap: "wrap",
				gap: "0.75rem",
				padding: "1.5rem",
			}}
		>
			{statuses.map((status) => (
				<StatusBadge key={status} status={status}>
					{({ label, color }) => (
						<span style={{ color, fontWeight: 600 }}>{label}</span>
					)}
				</StatusBadge>
			))}
		</div>
	);
}
