import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { colors, radius } from "./theme";

export type ProgressBarStyles = {
	track?: StyleProp<ViewStyle>;
	fill?: StyleProp<ViewStyle>;
};

export type ProgressBarProps = {
	progress: number;
	/**
	 * Render an animated sliding band instead of a width-driven fill, for
	 * phases with activity but no measurable percentage (e.g. "preparing").
	 * When true, `progress` is ignored and no `now` value is reported.
	 */
	indeterminate?: boolean;
	trackStyle?: StyleProp<ViewStyle>;
	fillStyle?: StyleProp<ViewStyle>;
	styles?: ProgressBarStyles;
	children?: (progress: number) => React.ReactNode;
};

export function ProgressBar({
	progress,
	indeterminate = false,
	trackStyle,
	fillStyle,
	styles: slots,
	children,
}: ProgressBarProps) {
	if (children) {
		return <>{children(progress)}</>;
	}

	if (indeterminate) {
		return (
			<IndeterminateBar
				fillStyle={fillStyle}
				slots={slots}
				trackStyle={trackStyle}
			/>
		);
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

function IndeterminateBar({
	slots,
	trackStyle,
	fillStyle,
}: {
	slots?: ProgressBarStyles;
	trackStyle?: StyleProp<ViewStyle>;
	fillStyle?: StyleProp<ViewStyle>;
}) {
	const [trackWidth, setTrackWidth] = useState(0);
	const translate = useRef(new Animated.Value(0)).current;
	const bandWidth = trackWidth * 0.4;

	useEffect(() => {
		if (trackWidth === 0) return;
		const anim = Animated.loop(
			Animated.timing(translate, {
				duration: 1200,
				easing: Easing.inOut(Easing.ease),
				toValue: 1,
				useNativeDriver: true,
			}),
		);
		anim.start();
		return () => anim.stop();
	}, [trackWidth, translate]);

	const translateX = translate.interpolate({
		inputRange: [0, 1],
		outputRange: [-bandWidth, trackWidth],
	});

	return (
		<View
			accessibilityRole="progressbar"
			accessibilityState={{ busy: true }}
			accessibilityValue={{ max: 100, min: 0 }}
			accessible
			onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
			style={[styles.track, slots?.track, trackStyle]}
		>
			<Animated.View
				style={[
					styles.fill,
					{ transform: [{ translateX }], width: bandWidth },
					slots?.fill,
					fillStyle,
				]}
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
