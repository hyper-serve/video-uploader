import type { FileStatus } from "@hyperserve/video-uploader";
import type React from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { StyleSheet, Text, View } from "react-native";
import { radius } from "./theme";
import { statusConfig } from "./utils";

export type StatusConfigEntry = {
	label: string;
	bg?: string;
	text?: string;
};

export type StatusBadgeStyles = {
	label?: StyleProp<TextStyle>;
};

export type StatusBadgeProps = {
	status: FileStatus;
	style?: StyleProp<ViewStyle>;
	textStyle?: StyleProp<TextStyle>;
	statusConfig?: Partial<Record<FileStatus, StatusConfigEntry>>;
	getLabel?: (status: FileStatus) => string;
	styles?: StatusBadgeStyles;
	children?: (info: { label: string; color: string }) => React.ReactNode;
};

function mergeConfig(
	status: FileStatus,
	overrides?: Partial<Record<FileStatus, StatusConfigEntry>>,
	getLabel?: (status: FileStatus) => string,
): { bg: string; text: string; label: string } {
	const base = statusConfig[status];
	const override = overrides?.[status];
	return {
		bg: override?.bg ?? base.bg,
		label: getLabel ? getLabel(status) : (override?.label ?? base.label),
		text: override?.text ?? base.text,
	};
}

export function StatusBadge({
	status,
	style,
	textStyle,
	statusConfig: statusConfigOverride,
	getLabel,
	styles: slots,
	children,
}: StatusBadgeProps) {
	const config = mergeConfig(status, statusConfigOverride, getLabel);

	if (children) {
		return <>{children({ color: config.text, label: config.label })}</>;
	}

	return (
		<View style={[styles.badge, { backgroundColor: config.bg }, style]}>
			<Text
				style={[styles.text, { color: config.text }, slots?.label, textStyle]}
			>
				{config.label}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	badge: {
		borderRadius: radius.pill,
		paddingHorizontal: 8,
		paddingVertical: 4,
	},
	text: {
		fontSize: 11,
		fontWeight: "600",
		letterSpacing: 0.3,
		textTransform: "uppercase",
	},
});
