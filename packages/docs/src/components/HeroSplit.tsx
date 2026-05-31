import { UploadProvider } from "@hyperserve/video-uploader";
import {
	DropZone,
	FileList,
	FileListToolbar,
	ViewModeProvider,
} from "@hyperserve/video-uploader-react";
import type React from "react";
import { useMemo } from "react";
import { createMockConfig } from "./demos/MockAdapter";

export default function HeroSplit() {
	const config = useMemo(() => createMockConfig(), []);
	return (
		<div className="not-content" style={wrapper}>
			<div className="hero-split" style={split}>
				<div className="hero-split-code" style={codePane}>
					<p style={codePaneLabel}>5 lines to get started</p>
					<pre style={pre}>
						<code>
							<span style={kw}>import</span> <span style={punct}>{"{ "}</span>
							<span style={comp}>UploadProvider</span>
							<span style={punct}>{" }"}</span> <span style={kw}>from</span>{" "}
							<span style={str}>{"'@hyperserve/video-uploader'"}</span>
							{"\n"}
							<span style={kw}>import</span> <span style={punct}>{"{ "}</span>
							<span style={comp}>DropZone</span>
							<span style={punct}>{", "}</span>
							<span style={comp}>FileList</span>
							<span style={punct}>{" }"}</span> <span style={kw}>from</span>{" "}
							<span style={str}>{"'@hyperserve/video-uploader-react'"}</span>
							{"\n\n"}
							<span style={kw}>function</span> <span style={fn}>App</span>
							<span style={punct}>{"() {"}</span>
							{"\n  "}
							<span style={kw}>return</span> <span style={punct}>{"("}</span>
							{"\n    "}
							<span style={tag}>{"<"}</span>
							<span style={comp}>UploadProvider</span>{" "}
							<span style={attr}>config</span>
							<span style={punct}>{"={"}</span>
							<span style={id}>config</span>
							<span style={punct}>{"}"}</span>
							<span style={tag}>{">"}</span>
							{"\n      "}
							<span style={tag}>{"<"}</span>
							<span style={comp}>DropZone</span> <span style={tag}>{"/>"}</span>
							{"\n      "}
							<span style={tag}>{"<"}</span>
							<span style={comp}>FileList</span> <span style={tag}>{"/>"}</span>
							{"\n    "}
							<span style={tag}>{"</"}</span>
							<span style={comp}>UploadProvider</span>
							<span style={tag}>{">"}</span>
							{"\n  "}
							<span style={punct}>{")"}</span>
							{"\n"}
							<span style={punct}>{"}"}</span>
						</code>
					</pre>
				</div>
				<div className="hero-split-preview" style={previewPane}>
					<p style={previewPaneLabel}>Try it live</p>
					<UploadProvider config={config}>
						<ViewModeProvider>
							<div style={previewStack}>
								<DropZone supportingText="Fully simulated, nothing leaves your browser." />
								<FileListToolbar right={<FileListToolbar.ViewToggle />} />
								<FileList emptyMessage="Drop or browse files to see it in action." />
							</div>
						</ViewModeProvider>
					</UploadProvider>
				</div>
			</div>
		</div>
	);
}

const wrapper: React.CSSProperties = {
	border: "1px solid #1e293b",
	borderRadius: 8,
	margin: "1.5rem 0 2rem",
	overflow: "auto",
};

const _strip: React.CSSProperties = {
	background: "#0f172a",
	borderBottom: "1px solid #1e293b",
	color: "#64748b",
	fontSize: "0.8rem",
	padding: "0.625rem 1.25rem",
	textAlign: "center",
};

const _stripLink: React.CSSProperties = {
	color: "#818cf8",
	textDecoration: "underline",
};

const split: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "1fr 1fr",
	minWidth: 520,
};

const codePane: React.CSSProperties = {
	background: "#0f172a",
	borderRight: "1px solid #1e293b",
	overflow: "auto",
	padding: "1.25rem 1.5rem",
};

const codePaneLabel: React.CSSProperties = {
	color: "#475569",
	fontSize: "0.65rem",
	fontWeight: 600,
	letterSpacing: "0.08em",
	margin: "0 0 0.75rem",
	textTransform: "uppercase",
};

const pre: React.CSSProperties = {
	background: "transparent",
	border: "none",
	color: "#94a3b8",
	fontFamily: "monospace",
	fontSize: "0.75rem",
	lineHeight: 1.7,
	margin: 0,
	overflow: "visible",
	padding: 0,
};

const kw: React.CSSProperties = { color: "#818cf8" };
const comp: React.CSSProperties = { color: "#67e8f9" };
const str: React.CSSProperties = { color: "#86efac" };
const fn: React.CSSProperties = { color: "#fde68a" };
const attr: React.CSSProperties = { color: "#fbbf24" };
const id: React.CSSProperties = { color: "#e2e8f0" };
const tag: React.CSSProperties = { color: "#f472b6" };
const punct: React.CSSProperties = { color: "#94a3b8" };

const previewPane: React.CSSProperties = {
	background: "#f8fafc",
	padding: "1.25rem 1.5rem",
};

const previewStack: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "0.75rem",
};

const previewPaneLabel: React.CSSProperties = {
	color: "#94a3b8",
	fontSize: "0.65rem",
	fontWeight: 600,
	letterSpacing: "0.08em",
	margin: "0 0 0.75rem",
	textTransform: "uppercase",
};
