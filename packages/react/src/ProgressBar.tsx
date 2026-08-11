import type React from "react";
import { injectKeyframes } from "./injectKeyframes";
import { colors, radius } from "./theme";

export type ProgressBarStyles = {
	track?: React.CSSProperties;
	fill?: React.CSSProperties;
};

export type ProgressBarProps = {
	progress: number;
	/**
	 * Render an animated "sliding" fill instead of a width-driven one, for
	 * phases with activity but no measurable percentage (e.g. "preparing").
	 * When true, `progress` is ignored and no `aria-valuenow` is reported.
	 */
	indeterminate?: boolean;
	trackStyle?: React.CSSProperties;
	fillStyle?: React.CSSProperties;
	trackClassName?: string;
	fillClassName?: string;
	styles?: ProgressBarStyles;
	children?: (progress: number) => React.ReactNode;
};

export function ProgressBar({
	progress,
	indeterminate = false,
	trackStyle,
	fillStyle,
	trackClassName,
	fillClassName,
	styles: slots,
	children,
}: ProgressBarProps) {
	if (children) {
		return <>{children(progress)}</>;
	}

	if (indeterminate) {
		injectKeyframes();
	}

	return (
		<div
			aria-busy={indeterminate || undefined}
			aria-valuemax={100}
			aria-valuemin={0}
			aria-valuenow={indeterminate ? undefined : progress}
			className={trackClassName}
			role="progressbar"
			style={{
				backgroundColor: colors.border,
				borderRadius: radius.sm,
				height: 6,
				overflow: "hidden",
				width: "100%",
				...slots?.track,
				...trackStyle,
			}}
		>
			<div
				className={fillClassName}
				style={{
					backgroundColor: colors.accent,
					borderRadius: radius.sm,
					height: "100%",
					...(indeterminate
						? {
								animationDuration: "1.2s",
								animationIterationCount: "infinite",
								animationName: "hs-indeterminate",
								animationTimingFunction: "ease-in-out",
								width: "40%",
							}
						: {
								transition: "width 0.25s ease-out",
								width: `${progress}%`,
							}),
					...slots?.fill,
					...fillStyle,
				}}
			/>
		</div>
	);
}
