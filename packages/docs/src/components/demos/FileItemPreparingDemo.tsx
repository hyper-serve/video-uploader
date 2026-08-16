import { FileItem } from "@hyperserve/video-uploader-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { preparingFile } from "./mockFileState";

export default function FileItemPreparingDemo() {
	return (
		<MockFilesProvider files={[preparingFile]}>
			<div
				className="not-content"
				style={{
					background: "#fff",
					border: "1px solid #e2e8f0",
					borderRadius: 8,
					padding: "1.5rem",
				}}
			>
				<FileItem file={preparingFile} layout="row">
					<FileItem.Content />
				</FileItem>
			</div>
		</MockFilesProvider>
	);
}
