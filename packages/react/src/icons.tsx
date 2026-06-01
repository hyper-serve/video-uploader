import { colors } from "./theme";

export function ListIcon() {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			height="18"
			stroke="currentColor"
			strokeWidth="2"
			viewBox="0 0 24 24"
			width="18"
		>
			<line x1="8" x2="21" y1="6" y2="6" />
			<line x1="8" x2="21" y1="12" y2="12" />
			<line x1="8" x2="21" y1="18" y2="18" />
			<line x1="3" x2="3.01" y1="6" y2="6" />
			<line x1="3" x2="3.01" y1="12" y2="12" />
			<line x1="3" x2="3.01" y1="18" y2="18" />
		</svg>
	);
}

export function GridIcon() {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			height="18"
			stroke="currentColor"
			strokeWidth="2"
			viewBox="0 0 24 24"
			width="18"
		>
			<rect height="7" rx="1" width="7" x="3" y="3" />
			<rect height="7" rx="1" width="7" x="14" y="3" />
			<rect height="7" rx="1" width="7" x="3" y="14" />
			<rect height="7" rx="1" width="7" x="14" y="14" />
		</svg>
	);
}

export function ThumbnailPlaceholderIcon() {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			height="24"
			stroke={colors.iconMuted}
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			viewBox="0 0 24 24"
			width="24"
		>
			<rect height="18" rx="2" width="18" x="3" y="3" />
			<path d="M7 3v18" />
			<path d="M3 7.5h4" />
			<path d="M3 12h18" />
			<path d="M3 16.5h4" />
			<path d="M17 3v18" />
			<path d="M17 7.5h4" />
			<path d="M17 16.5h4" />
		</svg>
	);
}

export function SpinnerIcon({ size = 14 }: { size?: number }) {
	return (
		// biome-ignore lint/a11y/useSemanticElements: role="status" on SVG spinner is intentional
		<svg
			aria-hidden="true"
			height={size}
			role="status"
			viewBox="0 0 24 24"
			width={size}
		>
			<circle
				cx="12"
				cy="12"
				fill="none"
				r="10"
				stroke="#E5E7EB"
				strokeWidth="2"
			/>
			<g>
				<path
					d="M22 12a10 10 0 0 0-10-10"
					fill="none"
					stroke="#4B5563"
					strokeLinecap="round"
					strokeWidth="2.5"
				/>
				<animateTransform
					attributeName="transform"
					dur="0.75s"
					from="0 12 12"
					repeatCount="indefinite"
					to="360 12 12"
					type="rotate"
				/>
			</g>
		</svg>
	);
}

export function CheckCircleIcon({ size = 14 }: { size?: number }) {
	return (
		<svg aria-hidden="true" height={size} viewBox="0 0 24 24" width={size}>
			<circle
				cx="12"
				cy="12"
				fill="none"
				r="10"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<path
				d="M8 12.5 11 15l5-6"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
			/>
		</svg>
	);
}

export function RetryIcon({ size = 16 }: { size?: number }) {
	return (
		<svg aria-hidden="true" height={size} viewBox="0 0 24 24" width={size}>
			<path
				d="M3 4v6h6"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
			/>
			<path
				d="M5 13a7 7 0 1 0 2-8.7"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
			/>
		</svg>
	);
}

export function UploadIcon() {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			height="40"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			style={{ display: "block" }}
			viewBox="0 0 24 24"
			width="40"
		>
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<polyline points="17 8 12 3 7 8" />
			<line x1="12" x2="12" y1="3" y2="15" />
		</svg>
	);
}
