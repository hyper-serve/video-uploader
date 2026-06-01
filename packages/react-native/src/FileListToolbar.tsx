import { useUpload } from "@hyperserve/video-uploader";
import type React from "react";
import { createContext, useContext } from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "./theme";
import { useViewMode, type ViewMode } from "./ViewModeContext";

export type FileListToolbarStyles = {
	root?: StyleProp<ViewStyle>;
	fileCount?: StyleProp<TextStyle>;
	viewToggle?: StyleProp<ViewStyle>;
	viewToggleButton?: StyleProp<ViewStyle>;
	viewToggleButtonActive?: StyleProp<ViewStyle>;
	viewToggleText?: StyleProp<TextStyle>;
	viewToggleTextActive?: StyleProp<TextStyle>;
};

export type FileListToolbarProps = {
	left?: React.ReactNode | null;
	right?: React.ReactNode | null;
	showFileCount?: boolean;
	showViewToggle?: boolean;
	style?: StyleProp<ViewStyle>;
	styles?: FileListToolbarStyles;
};

export type FileCountProps = {
	label?: (count: number) => React.ReactNode;
	style?: StyleProp<TextStyle>;
};

export type ViewToggleProps = {
	style?: StyleProp<ViewStyle>;
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

function FileCount({ label, style }: FileCountProps) {
	const { files } = useUpload();
	const { styles: slots } = useToolbarContext();
	const count = files.length;
	const content =
		label != null
			? label(count)
			: `${count} file${count !== 1 ? "s" : ""} added`;
	return (
		<Text style={[styles.fileCount, slots.fileCount, style]}>{content}</Text>
	);
}

function ViewToggle({ style, children }: ViewToggleProps) {
	const { viewMode, setViewMode } = useViewMode();
	const { styles: slots } = useToolbarContext();
	if (children) {
		return <>{children({ setViewMode, viewMode })}</>;
	}
	return (
		<View style={[styles.toggleGroup, slots.viewToggle, style]}>
			<Pressable
				onPress={() => setViewMode("list")}
				style={[
					styles.toggleButton,
					slots.viewToggleButton,
					viewMode === "list" && styles.toggleActive,
					viewMode === "list" && slots.viewToggleButtonActive,
				]}
			>
				<Text
					style={[
						styles.toggleText,
						slots.viewToggleText,
						viewMode === "list" && styles.toggleTextActive,
						viewMode === "list" && slots.viewToggleTextActive,
					]}
				>
					List
				</Text>
			</Pressable>
			<Pressable
				onPress={() => setViewMode("grid")}
				style={[
					styles.toggleButton,
					slots.viewToggleButton,
					viewMode === "grid" && styles.toggleActive,
					viewMode === "grid" && slots.viewToggleButtonActive,
				]}
			>
				<Text
					style={[
						styles.toggleText,
						slots.viewToggleText,
						viewMode === "grid" && styles.toggleTextActive,
						viewMode === "grid" && slots.viewToggleTextActive,
					]}
				>
					Grid
				</Text>
			</Pressable>
		</View>
	);
}

export function FileListToolbar({
	left,
	right,
	showFileCount = true,
	showViewToggle = true,
	style,
	styles: stylesProp,
}: FileListToolbarProps) {
	const slots = stylesProp ?? EMPTY_TOOLBAR_STYLES;
	const leftContent =
		left !== undefined ? left : showFileCount ? <FileCount /> : null;
	const rightContent =
		right !== undefined ? right : showViewToggle ? <ViewToggle /> : null;

	return (
		<ToolbarContext.Provider value={{ styles: slots }}>
			<View style={[styles.toolbar, slots.root, style]}>
				{leftContent}
				{rightContent}
			</View>
		</ToolbarContext.Provider>
	);
}

const EMPTY_TOOLBAR_STYLES: FileListToolbarStyles = {};

FileListToolbar.FileCount = FileCount;
FileListToolbar.ViewToggle = ViewToggle;

const styles = StyleSheet.create({
	fileCount: { color: colors.textPrimary, fontSize: 14 },
	toggleActive: { backgroundColor: colors.bgSubtle },
	toggleButton: { paddingHorizontal: 10, paddingVertical: 8 },
	toggleGroup: {
		borderColor: colors.border,
		borderRadius: radius.md,
		borderWidth: 1,
		flexDirection: "row",
		overflow: "hidden",
	},
	toggleText: { color: colors.textMuted, fontSize: 13, fontWeight: "500" },
	toggleTextActive: { color: colors.textPrimary },
	toolbar: {
		alignItems: "center",
		alignSelf: "stretch",
		flexDirection: "row",
		justifyContent: "space-between",
	},
});
