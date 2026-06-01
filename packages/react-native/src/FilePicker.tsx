import type { FileRef } from "@hyperserve/video-uploader";
import { useUpload } from "@hyperserve/video-uploader";
import type React from "react";
import { useCallback } from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius } from "./theme";

export type FilePickerStyles = {
	root?: StyleProp<ViewStyle>;
	text?: StyleProp<TextStyle>;
};

export type FilePickerProps = {
	pickFiles: () => Promise<FileRef[]>;
	style?: StyleProp<ViewStyle>;
	textStyle?: StyleProp<TextStyle>;
	styles?: FilePickerStyles;
	children?:
		| React.ReactNode
		| ((state: { pick: () => void }) => React.ReactNode);
};

export function FilePicker({
	pickFiles,
	style,
	textStyle,
	styles: slots,
	children,
}: FilePickerProps) {
	const { addFiles } = useUpload();

	const pick = useCallback(async () => {
		const refs = await pickFiles();
		if (refs.length > 0) {
			addFiles(refs);
		}
	}, [pickFiles, addFiles]);

	if (typeof children === "function") {
		return <>{children({ pick })}</>;
	}

	return (
		<Pressable onPress={pick} style={[styles.button, slots?.root, style]}>
			{children ?? (
				<Text style={[styles.text, slots?.text, textStyle]}>Pick Videos</Text>
			)}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		alignItems: "center",
		backgroundColor: colors.accent,
		borderRadius: radius.lg,
		paddingHorizontal: 18,
		paddingVertical: 12,
	},
	text: {
		color: colors.white,
		fontSize: 15,
		fontWeight: "600",
	},
});
