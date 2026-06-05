import type { FileState } from "@hyperserve/video-uploader";
import { useUpload } from "@hyperserve/video-uploader";
import type React from "react";
import { createContext, useContext } from "react";
import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from "react-native";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { ProgressBar } from "./ProgressBar";
import { Thumbnail } from "./Thumbnail";
import { colors, radius } from "./theme";

export type FileItemStyles = {
	root?: StyleProp<ViewStyle>;
	contentInner?: StyleProp<ViewStyle>;
	fileName?: StyleProp<TextStyle>;
	fileSize?: StyleProp<TextStyle>;
	errorMessage?: StyleProp<TextStyle>;
	removeButton?: StyleProp<ViewStyle>;
	removeButtonText?: StyleProp<TextStyle>;
	retryButton?: StyleProp<ViewStyle>;
	retryButtonText?: StyleProp<TextStyle>;
	statusIcon?: StyleProp<ViewStyle>;
	statusText?: StyleProp<TextStyle>;
	meta?: StyleProp<ViewStyle>;
	actions?: StyleProp<ViewStyle>;
	progressTrack?: StyleProp<ViewStyle>;
	progressFill?: StyleProp<ViewStyle>;
	thumbnail?: StyleProp<ImageStyle>;
};

const EMPTY_STYLES: FileItemStyles = {};

type FileItemContextValue = {
	file: FileState;
	layout: "row" | "column";
	styles: FileItemStyles;
};

const FileItemContext = createContext<FileItemContextValue | null>(null);

function useFileItemContext(): FileItemContextValue {
	const ctx = useContext(FileItemContext);
	if (!ctx) {
		throw new Error(
			"FileItem compound components must be used within <FileItem>",
		);
	}
	return ctx;
}

export type FileItemProps = {
	file: FileState;
	layout?: "row" | "column";
	style?: StyleProp<ViewStyle>;
	styles?: FileItemStyles;
	children?: React.ReactNode | ((file: FileState) => React.ReactNode);
};

export function FileItem({
	file,
	layout = "column",
	style,
	styles: stylesProp,
	children,
}: FileItemProps) {
	const isRow = layout === "row";
	const slots = stylesProp ?? EMPTY_STYLES;
	return (
		<FileItemContext.Provider value={{ file, layout, styles: slots }}>
			<View
				style={[
					styles.container,
					isRow && styles.containerRow,
					slots.root,
					style,
				]}
			>
				{typeof children === "function" ? children(file) : children}
			</View>
		</FileItemContext.Provider>
	);
}

export type FileNameProps = {
	style?: StyleProp<TextStyle>;
	numberOfLines?: number;
};

function FileName({ style, numberOfLines = 1 }: FileNameProps) {
	const { file, styles: slots } = useFileItemContext();
	return (
		<Text
			numberOfLines={numberOfLines}
			style={[styles.fileName, slots.fileName, style]}
		>
			{file.ref.name}
		</Text>
	);
}

export type FileSizeProps = {
	style?: StyleProp<TextStyle>;
};

function FileSize({ style }: FileSizeProps) {
	const { file, styles: slots } = useFileItemContext();
	const mb = file.ref.size / (1024 * 1024);
	return (
		<Text style={[styles.fileSize, slots.fileSize, style]}>
			{mb < 1
				? `${(file.ref.size / 1024).toFixed(0)} KB`
				: `${mb.toFixed(1)} MB`}
		</Text>
	);
}

export type ErrorMessageProps = {
	style?: StyleProp<TextStyle>;
};

function ErrorMessage({ style }: ErrorMessageProps) {
	const { file, styles: slots } = useFileItemContext();
	if (!file.error) return null;
	return (
		<Text style={[styles.error, slots.errorMessage, style]}>{file.error}</Text>
	);
}

export type RemoveButtonProps = {
	style?: StyleProp<ViewStyle>;
	textStyle?: StyleProp<TextStyle>;
	children?: React.ReactNode;
	cancelLabel?: string;
};

function RemoveButton({
	style,
	textStyle,
	children,
	cancelLabel = "Cancel",
}: RemoveButtonProps) {
	const { file, styles: slots } = useFileItemContext();
	const { removeFile } = useUpload();
	if (file.status === "processing" || file.status === "ready") {
		return null;
	}
	const isActive = file.status === "uploading" || file.status === "validating";
	const label = isActive ? cancelLabel : "Remove";
	return (
		<Pressable
			accessibilityLabel={label}
			onPress={() => removeFile(file.id)}
			style={[slots.removeButton, style]}
		>
			{children ?? (
				<Text style={[styles.removeText, slots.removeButtonText, textStyle]}>
					×
				</Text>
			)}
		</Pressable>
	);
}

export type RetryButtonProps = {
	style?: StyleProp<ViewStyle>;
	textStyle?: StyleProp<TextStyle>;
	children?: React.ReactNode;
};

function RetryButton({ style, textStyle, children }: RetryButtonProps) {
	const { file, styles: slots } = useFileItemContext();
	const { retryFile } = useUpload();
	if (file.status !== "failed") return null;
	return (
		<Pressable
			accessibilityLabel="Retry"
			onPress={() => retryFile(file.id)}
			style={[slots.retryButton, style]}
		>
			{children ?? (
				<Text style={[styles.retryText, slots.retryButtonText, textStyle]}>
					Retry
				</Text>
			)}
		</Pressable>
	);
}

export type StatusIconProps = {
	style?: StyleProp<ViewStyle>;
	textStyle?: StyleProp<TextStyle>;
	children?: (info: {
		status: FileState["status"];
		label: string;
	}) => React.ReactNode;
};

const STATUS_ICON_LABELS: Record<FileState["status"], string> = {
	failed: "Failed",
	processing: "Processing",
	ready: "Ready",
	selected: "Selected",
	uploading: "Uploading",
	validating: "Validating",
};

function StatusIcon({ style, textStyle, children }: StatusIconProps) {
	const { file, styles: slots } = useFileItemContext();
	const label = STATUS_ICON_LABELS[file.status];

	if (children) {
		return <>{children({ label, status: file.status })}</>;
	}

	if (file.status === "processing") {
		return (
			<ActivityIndicator
				color={colors.textSecondary}
				size="small"
				style={[slots.statusIcon, style]}
			/>
		);
	}
	if (file.status === "ready") {
		return (
			<View style={[slots.statusIcon, style]}>
				<Text style={[styles.checkText, slots.statusText, textStyle]}>✓</Text>
			</View>
		);
	}
	return null;
}

export type FileItemMetaProps = {
	style?: StyleProp<ViewStyle>;
	children?: React.ReactNode;
};

function Meta({ style, children }: FileItemMetaProps) {
	const { styles: slots } = useFileItemContext();
	return <View style={[styles.meta, slots.meta, style]}>{children}</View>;
}

export type FileItemActionsProps = {
	style?: StyleProp<ViewStyle>;
	children?: React.ReactNode;
};

function Actions({ style, children }: FileItemActionsProps) {
	const { styles: slots } = useFileItemContext();
	return <View style={[styles.actions, slots.actions, style]}>{children}</View>;
}

export type UploadProgressProps = {
	trackStyle?: StyleProp<ViewStyle>;
	fillStyle?: StyleProp<ViewStyle>;
};

function UploadProgress({ trackStyle, fillStyle }: UploadProgressProps) {
	const { file, styles: slots } = useFileItemContext();
	if (file.status !== "uploading") return null;
	return (
		<ProgressBar
			fillStyle={[slots.progressFill, fillStyle]}
			progress={file.progress}
			trackStyle={[slots.progressTrack, trackStyle]}
		/>
	);
}

export type PlaybackPreviewProps = {
	style?: StyleProp<ImageStyle>;
};

function PlaybackPreview({ style }: PlaybackPreviewProps) {
	const { file, styles: slots } = useFileItemContext();
	if (file.status !== "ready" || !file.playbackUrl) return null;
	return <Thumbnail file={file} playback style={[slots.thumbnail, style]} />;
}

export type FileItemContentProps = {
	style?: StyleProp<ViewStyle>;
};

function Content({ style }: FileItemContentProps) {
	const { file, layout, styles: slots } = useFileItemContext();
	const isRow = layout === "row";

	if (isRow) {
		return (
			<>
				<Thumbnail
					file={file}
					playback
					style={[styles.thumbnailRow, slots.thumbnail]}
				/>
				<View style={[styles.middle, slots.contentInner, style]}>
					<FileName style={styles.fileNameFlex} />
					<Meta>
						<FileSize />
						<StatusIcon />
					</Meta>
					<UploadProgress />
					<ErrorMessage />
				</View>
				<Actions>
					<RemoveButton />
					<RetryButton />
				</Actions>
			</>
		);
	}

	return (
		<View style={[slots.contentInner, style]}>
			<Thumbnail file={file} playback style={slots.thumbnail} />
			<View style={styles.nameRow}>
				<FileName style={styles.fileNameFlex} />
				<Actions>
					<RemoveButton />
					<RetryButton />
				</Actions>
			</View>
			<Meta>
				<FileSize />
				<StatusIcon />
			</Meta>
			<UploadProgress />
			<ErrorMessage />
		</View>
	);
}

FileItem.FileName = FileName;
FileItem.FileSize = FileSize;
FileItem.ErrorMessage = ErrorMessage;
FileItem.RemoveButton = RemoveButton;
FileItem.RetryButton = RetryButton;
FileItem.StatusIcon = StatusIcon;
FileItem.Meta = Meta;
FileItem.Actions = Actions;
FileItem.UploadProgress = UploadProgress;
FileItem.PlaybackPreview = PlaybackPreview;
FileItem.Content = Content;

const styles = StyleSheet.create({
	actions: {
		alignItems: "flex-end",
		gap: 4,
	},
	checkText: {
		color: "#059669",
		fontSize: 13,
		fontWeight: "600",
	},
	container: {
		backgroundColor: colors.bgCard,
		borderColor: colors.border,
		borderRadius: radius.lg,
		borderWidth: 1,
		gap: 6,
		padding: 14,
	},
	containerRow: {
		alignItems: "center",
		flexDirection: "row",
		gap: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	error: {
		color: colors.error,
		fontSize: 13,
	},
	fileName: {
		fontSize: 14,
		fontWeight: "600",
	},
	fileNameFlex: {
		flex: 1,
	},
	fileSize: {
		color: colors.textSecondary,
		fontSize: 13,
	},
	meta: {
		alignItems: "center",
		flexDirection: "row",
		gap: 6,
	},
	middle: {
		flex: 1,
		gap: 2,
		minWidth: 0,
	},
	nameRow: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 6,
	},
	removeText: {
		color: colors.textSecondary,
		fontSize: 18,
	},
	retryText: {
		color: colors.accent,
		fontSize: 13,
	},
	thumbnailRow: {
		borderRadius: radius.md,
		flexShrink: 0,
		height: 56,
		width: 80,
	},
});
