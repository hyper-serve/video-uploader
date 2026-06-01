import type React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";
import { colors, radius } from "./theme";

export type ProgressBarStyles = {
	track?: StyleProp<ViewStyle>;
	fill?: StyleProp<ViewStyle>;
};

export type ProgressBarProps = {
	progress: number;
	trackStyle?: StyleProp<ViewStyle>;
	fillStyle?: StyleProp<ViewStyle>;
	styles?: ProgressBarStyles;
	children?: (progress: number) => React.ReactNode;
};

export function ProgressBar({
	progress,
	trackStyle,
	fillStyle,
	styles: slots,
	children,
}: ProgressBarProps) {
	if (children) {
		return <>{children(progress)}</>;
	}

	return (
		<View
			accessibilityRole="progressbar"
			accessibilityValue={{ max: 100, min: 0, now: progress }}
			accessible
			style={[styles.track, slots?.track, trackStyle]}
		>
			<View
				style={[styles.fill, { width: `${progress}%` }, slots?.fill, fillStyle]}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	fill: {
		backgroundColor: colors.accent,
		borderRadius: radius.sm,
		height: "100%",
	},
	track: {
		backgroundColor: colors.border,
		borderRadius: radius.sm,
		height: 6,
		overflow: "hidden",
	},
});
