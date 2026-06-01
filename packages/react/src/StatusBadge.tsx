import type { FileStatus } from "@hyperserve/video-uploader";
import type React from "react";
import { radius } from "./theme";
import { statusConfig } from "./utils";

export type StatusConfigEntry = {
	label: string;
	bg?: string;
	text?: string;
};

export type StatusBadgeStyles = {
	label?: React.CSSProperties;
};

export type StatusBadgeProps = {
	status: FileStatus;
	style?: React.CSSProperties;
	className?: string;
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
	const merged = {
		bg: override?.bg ?? base.bg,
		label: getLabel ? getLabel(status) : (override?.label ?? base.label),
		text: override?.text ?? base.text,
	};
	return merged;
}

export function StatusBadge({
	status,
	style,
	className,
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
		<span
			className={className}
			style={{
				backgroundColor: config.bg,
				borderRadius: radius.pill,
				color: config.text,
				display: "inline-block",
				fontSize: "0.6875rem",
				fontWeight: 600,
				letterSpacing: "0.02em",
				lineHeight: 1,
				padding: "0.2rem 0.5rem",
				textTransform: "uppercase",
				...slots?.label,
				...style,
			}}
		>
			{config.label}
		</span>
	);
}
