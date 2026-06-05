import type { FileState } from "@hyperserve/video-uploader";
import { useUpload } from "@hyperserve/video-uploader";
import type React from "react";
import type {
	DimensionValue,
	StyleProp,
	TextStyle,
	ViewStyle,
} from "react-native";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { FileItem } from "./FileItem";
import { colors } from "./theme";
import { useViewMode, type ViewMode } from "./ViewModeContext";

export type FileListStyles = {
	root?: StyleProp<ViewStyle>;
	empty?: StyleProp<ViewStyle>;
	emptyText?: StyleProp<TextStyle>;
};

export type FileListProps = {
	mode?: ViewMode;
	style?: StyleProp<ViewStyle>;
	columns?: number;
	emptyMessage?: React.ReactNode;
	styles?: FileListStyles;
	children?: (file: FileState, index: number) => React.ReactElement;
};

export function FileList({
	mode,
	style,
	columns = 2,
	emptyMessage,
	styles: slots,
	children,
}: FileListProps) {
	const { files } = useUpload();
	const { viewMode } = useViewMode();
	const resolvedMode = mode ?? viewMode;

	if (files.length === 0 && emptyMessage) {
		return (
			<View style={[styles.empty, slots?.empty]}>
				{typeof emptyMessage === "string" ? (
					<Text style={[styles.emptyText, slots?.emptyText]}>
						{emptyMessage}
					</Text>
				) : (
					emptyMessage
				)}
			</View>
		);
	}

	const renderItem = children ?? makeDefaultRenderItem(resolvedMode);
	// Cap each cell to one column's width so a lone item in the final row does
	// not stretch to fill the whole row (FlatList's default flex behavior).
	const gridItemStyle =
		resolvedMode === "grid"
			? [styles.gridItem, { maxWidth: `${100 / columns}%` as DimensionValue }]
			: undefined;

	return (
		<FlatList
			contentContainerStyle={[styles.content, slots?.root, style]}
			data={files}
			key={resolvedMode === "grid" ? `grid-${columns}` : "list"}
			keyExtractor={(item) => item.id}
			numColumns={resolvedMode === "grid" ? columns : 1}
			renderItem={({ item, index }) => (
				<View style={gridItemStyle}>{renderItem(item, index)}</View>
			)}
		/>
	);
}

function makeDefaultRenderItem(resolvedMode: ViewMode) {
	return function renderItem(file: FileState): React.ReactElement {
		return (
			<FileItem
				file={file}
				key={file.id}
				layout={resolvedMode === "list" ? "row" : "column"}
			>
				<FileItem.Content />
			</FileItem>
		);
	};
}

const styles = StyleSheet.create({
	content: {
		gap: 12,
	},
	empty: {
		alignItems: "center",
		paddingVertical: 40,
	},
	emptyText: {
		color: colors.textSecondary,
		fontSize: 14,
		textAlign: "center",
	},
	gridItem: {
		flex: 1,
		padding: 4,
	},
});
