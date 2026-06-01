import type { FileState } from "@hyperserve/video-uploader";
import type React from "react";
import { useEffect, useState } from "react";
import { ThumbnailPlaceholderIcon } from "./icons";
import { colors, radius, thumbnailShadow } from "./theme";

export type ThumbnailStyles = {
	image?: React.CSSProperties;
	placeholder?: React.CSSProperties;
};

export type ThumbnailProps = {
	file: FileState;
	playback?: boolean;
	controls?: boolean;
	style?: React.CSSProperties;
	className?: string;
	placeholderStyle?: React.CSSProperties;
	placeholderClassName?: string;
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
	playback = false,
	controls = true,
	style,
	className,
	placeholderStyle,
	placeholderClassName,
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

	if (playback && isReady && file.playbackUrl) {
		return (
			<video
				className={className}
				controls={controls}
				src={file.playbackUrl}
				style={{
					aspectRatio: "16/9",
					borderRadius: radius.md,
					boxShadow: thumbnailShadow,
					width: "100%",
					...slots?.image,
					...style,
				}}
			>
				<track kind="captions" />
			</video>
		);
	}

	if (file.thumbnailUri && !thumbnailLoadFailed) {
		return (
			<img
				alt={file.ref.name}
				className={className}
				onError={() => setThumbnailLoadFailed(true)}
				src={file.thumbnailUri}
				style={{
					aspectRatio: "16/9",
					borderRadius: radius.md,
					objectFit: "cover",
					width: "100%",
					...slots?.image,
					...style,
				}}
			/>
		);
	}

	return (
		<div
			className={placeholderClassName}
			style={{
				alignItems: "center",
				aspectRatio: "16/9",
				backgroundColor: colors.bgPlaceholder,
				border: `1px solid ${colors.borderPlaceholder}`,
				borderRadius: radius.md,
				display: "flex",
				justifyContent: "center",
				width: "100%",
				...slots?.placeholder,
				...placeholderStyle,
				...style,
			}}
		>
			{placeholder !== undefined ? placeholder : <ThumbnailPlaceholderIcon />}
		</div>
	);
}
