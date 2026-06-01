import { toFileRefs, useUpload } from "@hyperserve/video-uploader";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import { filterFilesByAccept } from "./acceptFilter";
import { UploadIcon } from "./icons";
import { colors, radius } from "./theme";

export type DropZoneRenderProps = {
	isDragging: boolean;
	openPicker: () => void;
};

export type DropZoneStyles = {
	root?: React.CSSProperties;
	activeRoot?: React.CSSProperties;
	icon?: React.CSSProperties;
	primaryText?: React.CSSProperties;
	browseText?: React.CSSProperties;
	supportingText?: React.CSSProperties;
};

export type DropZoneProps = {
	accept?: string;
	multiple?: boolean;
	disabled?: boolean;
	style?: React.CSSProperties;
	activeStyle?: React.CSSProperties;
	className?: string;
	activeClassName?: string;
	supportingText?: React.ReactNode;
	styles?: DropZoneStyles;
	children?:
		| React.ReactNode
		| ((state: DropZoneRenderProps) => React.ReactNode);
};

export function DropZone({
	accept = "video/*",
	multiple = true,
	disabled = false,
	style,
	activeStyle,
	className,
	activeClassName,
	supportingText,
	styles: slots,
	children,
}: DropZoneProps) {
	const { addFiles, canAddMore } = useUpload();
	const [isDragging, setIsDragging] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const isDisabled = disabled || canAddMore === false;

	const openPicker = useCallback(() => {
		if (isDisabled) return;
		inputRef.current?.click();
	}, [isDisabled]);

	const handleFiles = useCallback(
		(fileList: FileList | File[]) => {
			const files = Array.from(fileList);
			if (files.length > 0) {
				addFiles(toFileRefs(files));
			}
		},
		[addFiles],
	);

	const handleDragOver = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			if (isDisabled) return;
			setIsDragging(true);
		},
		[isDisabled],
	);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		if (e.currentTarget.contains(e.relatedTarget as Node)) return;
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			if (isDisabled) return;
			const raw = Array.from(e.dataTransfer.files);
			const filtered = filterFilesByAccept(raw, accept);
			if (filtered.length > 0) {
				handleFiles(filtered);
			}
		},
		[handleFiles, accept, isDisabled],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (isDisabled) return;
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				openPicker();
			}
		},
		[isDisabled, openPicker],
	);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files) {
				handleFiles(e.target.files);
				e.target.value = "";
			}
		},
		[handleFiles],
	);

	const resolvedClassName =
		isDragging && activeClassName
			? `${className ?? ""} ${activeClassName}`.trim()
			: className;

	const resolvedStyle: React.CSSProperties = {
		alignItems: "center",
		backgroundColor: isDragging ? colors.dropZoneActiveBg : colors.dropZoneBg,
		border: `1.5px dashed ${colors.dropZoneBorder}`,
		borderRadius: radius.xl,
		cursor: isDisabled ? "not-allowed" : "pointer",
		display: "flex",
		flexDirection: "column",
		gap: "0.375rem",
		justifyContent: "center",
		minHeight: 160,
		opacity: isDisabled ? 0.6 : 1,
		padding: "1.5rem",
		pointerEvents: isDisabled ? "none" : undefined,
		transition: "border-color 0.2s ease, background-color 0.2s ease",
		...slots?.root,
		...style,
		...(isDragging
			? {
					backgroundColor: colors.dropZoneActiveBg,
					borderColor: colors.dropZoneActiveBorder,
					...slots?.activeRoot,
					...activeStyle,
				}
			: {}),
	};

	return (
		// biome-ignore lint/a11y/useSemanticElements: div contains a file <input> so cannot be a <button>
		<div
			aria-disabled={isDisabled}
			className={resolvedClassName}
			onClick={openPicker}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
			onKeyDown={handleKeyDown}
			role="button"
			style={resolvedStyle}
			tabIndex={isDisabled ? -1 : 0}
		>
			<input
				accept={accept}
				multiple={multiple}
				onChange={handleInputChange}
				ref={inputRef}
				style={{ display: "none" }}
				type="file"
			/>
			{typeof children === "function"
				? children({ isDragging, openPicker })
				: (children ?? (
						<>
							<div
								style={{ color: colors.accent, lineHeight: 1, ...slots?.icon }}
							>
								<UploadIcon />
							</div>
							<div
								style={{
									color: colors.textPrimary,
									fontSize: "0.9375rem",
									fontWeight: 600,
									...slots?.primaryText,
								}}
							>
								{isDragging ? "Drop your videos here" : "Drop videos here or "}
								{!isDragging && (
									<span
										style={{
											color: colors.accent,
											fontWeight: 600,
											...slots?.browseText,
										}}
									>
										browse
									</span>
								)}
							</div>
							{supportingText != null && (
								<div
									style={{
										color: colors.textMuted,
										fontSize: "0.8125rem",
										...slots?.supportingText,
									}}
								>
									{supportingText}
								</div>
							)}
						</>
					))}
		</div>
	);
}
