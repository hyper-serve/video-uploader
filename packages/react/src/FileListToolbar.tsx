import { useUpload } from "@hyperserve/video-uploader";
import type React from "react";
import { createContext, useContext } from "react";
import { GridIcon, ListIcon } from "./icons";
import { colors, radius } from "./theme";
import { useViewMode, type ViewMode } from "./ViewModeContext";

export type FileListToolbarStyles = {
	root?: React.CSSProperties;
	fileCount?: React.CSSProperties;
	viewToggle?: React.CSSProperties;
	viewToggleButton?: React.CSSProperties;
	viewToggleButtonActive?: React.CSSProperties;
};

export type FileListToolbarProps = {
	left?: React.ReactNode | null;
	right?: React.ReactNode | null;
	showFileCount?: boolean;
	showViewToggle?: boolean;
	style?: React.CSSProperties;
	className?: string;
	styles?: FileListToolbarStyles;
};

export type FileCountProps = {
	label?: (count: number) => React.ReactNode;
	style?: React.CSSProperties;
	className?: string;
};

export type ViewToggleProps = {
	style?: React.CSSProperties;
	className?: string;
	children?: (state: {
		viewMode: ViewMode;
		setViewMode: (mode: ViewMode) => void;
	}) => React.ReactNode;
};

type ToolbarContextValue = { styles: FileListToolbarStyles };
const ToolbarContext = createContext<ToolbarContextValue>({ styles: {} });

function useToolbarContext(): ToolbarContextValue {
	return useContext(ToolbarContext);
}

function FileCount({ label, style, className }: FileCountProps) {
	const { files } = useUpload();
	const { styles: slots } = useToolbarContext();
	const count = files.length;
	const content =
		label != null
			? label(count)
			: `${count} file${count !== 1 ? "s" : ""} added`;
	return (
		<span
			className={className}
			style={{
				color: colors.textPrimary,
				fontSize: "0.875rem",
				...slots.fileCount,
				...style,
			}}
		>
			{content}
		</span>
	);
}

function ViewToggle({ style, className, children }: ViewToggleProps) {
	const { viewMode, setViewMode } = useViewMode();
	const { styles: slots } = useToolbarContext();
	if (children) {
		return <>{children({ setViewMode, viewMode })}</>;
	}
	return (
		<div
			className={className}
			style={{
				border: `1px solid ${colors.border}`,
				borderRadius: radius.md,
				display: "flex",
				overflow: "hidden",
				...slots.viewToggle,
				...style,
			}}
		>
			<button
				aria-label="List view"
				onClick={() => setViewMode("list")}
				style={{
					alignItems: "center",
					background: viewMode === "list" ? colors.bgSubtle : colors.white,
					border: "none",
					color: viewMode === "list" ? colors.textPrimary : colors.textMuted,
					cursor: "pointer",
					display: "flex",
					justifyContent: "center",
					lineHeight: 0,
					padding: "0.375rem 0.5rem",
					...slots.viewToggleButton,
					...(viewMode === "list" ? slots.viewToggleButtonActive : {}),
				}}
				type="button"
			>
				<ListIcon />
			</button>
			<button
				aria-label="Grid view"
				onClick={() => setViewMode("grid")}
				style={{
					alignItems: "center",
					background: viewMode === "grid" ? colors.bgSubtle : colors.white,
					border: "none",
					color: viewMode === "grid" ? colors.textPrimary : colors.textMuted,
					cursor: "pointer",
					display: "flex",
					justifyContent: "center",
					lineHeight: 0,
					padding: "0.375rem 0.5rem",
					...slots.viewToggleButton,
					...(viewMode === "grid" ? slots.viewToggleButtonActive : {}),
				}}
				type="button"
			>
				<GridIcon />
			</button>
		</div>
	);
}

export function FileListToolbar({
	left,
	right,
	showFileCount = true,
	showViewToggle = true,
	style,
	className,
	styles: stylesProp,
}: FileListToolbarProps) {
	const slots = stylesProp ?? EMPTY_TOOLBAR_STYLES;
	const leftContent =
		left !== undefined ? left : showFileCount ? <FileCount /> : null;
	const rightContent =
		right !== undefined ? right : showViewToggle ? <ViewToggle /> : null;

	return (
		<ToolbarContext.Provider value={{ styles: slots }}>
			<div
				className={className}
				style={{
					alignItems: "center",
					display: "flex",
					justifyContent: "space-between",
					width: "100%",
					...slots.root,
					...style,
				}}
			>
				{leftContent}
				{rightContent}
			</div>
		</ToolbarContext.Provider>
	);
}

const EMPTY_TOOLBAR_STYLES: FileListToolbarStyles = {};

FileListToolbar.FileCount = FileCount;
FileListToolbar.ViewToggle = ViewToggle;
