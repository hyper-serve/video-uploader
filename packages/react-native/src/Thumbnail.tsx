import type { FileState } from "@hyperserve/video-uploader";
import type React from "react";
import { useEffect, useState } from "react";
import type { ImageStyle, StyleProp, ViewStyle } from "react-native";
import { Image, StyleSheet, View } from "react-native";
import { colors, radius } from "./theme";

export type ThumbnailStyles = {
	image?: StyleProp<ImageStyle>;
	placeholder?: StyleProp<ViewStyle>;
};

export type ThumbnailProps = {
	file: FileState;
	style?: StyleProp<ImageStyle>;
	placeholderStyle?: StyleProp<ViewStyle>;
	placeholder?: React.ReactNode;
	styles?: ThumbnailStyles;
	children?: (info: {
		thumbnailUri: string | null;
		playbackUrl: string | null;
		isReady: boolean;
	}) => React.ReactNode;
};

export function Thumbnail({
	file,
	style,
	placeholderStyle,
	placeholder,
	styles: slots,
	children,
}: ThumbnailProps) {
	const isReady = file.status === "ready";
	const [thumbnailLoadFailed, setThumbnailLoadFailed] = useState(false);

	useEffect(() => {
		setThumbnailLoadFailed(false);
	}, [file.thumbnailUri, file.id]);

	if (children) {
		return (
			<>
				{children({
					isReady,
					playbackUrl: file.playbackUrl,
					thumbnailUri: file.thumbnailUri,
				})}
			</>
		);
	}

	if (file.thumbnailUri && !thumbnailLoadFailed) {
		return (
			<Image
				onError={() => setThumbnailLoadFailed(true)}
				source={{ uri: file.thumbnailUri }}
				style={[styles.image, slots?.image, style]}
			/>
		);
	}

	return (
		<View
			style={[
				styles.placeholder,
				slots?.placeholder,
				placeholderStyle,
				style as StyleProp<ViewStyle>,
			]}
		>
			{placeholder !== undefined ? (
				placeholder
			) : (
				<View style={styles.placeholderIcon}>
					<View style={styles.filmSegment} />
					<View style={styles.filmSegment} />
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	filmSegment: {
		backgroundColor: colors.iconMuted,
		borderRadius: 2,
		height: 32,
		width: 10,
	},
	image: {
		borderRadius: radius.md,
		height: 100,
		width: "100%",
	},
	placeholder: {
		alignItems: "center",
		backgroundColor: colors.bgPlaceholder,
		borderColor: colors.borderPlaceholder,
		borderRadius: radius.md,
		borderWidth: 1,
		height: 100,
		justifyContent: "center",
	},
	placeholderIcon: {
		alignItems: "center",
		flexDirection: "row",
		gap: 6,
		justifyContent: "center",
	},
});
