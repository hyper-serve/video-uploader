import { colors } from "./theme";
import type { FileStatus } from "./types";

export const statusConfig: Record<
	FileStatus,
	{ bg: string; label: string; text: string }
> = {
	failed: { bg: "#fef2f2", label: "Failed", text: colors.error },
	processing: { bg: "#fffbeb", label: "Processing", text: "#d97706" },
	ready: { bg: "#f0fdf4", label: "Ready", text: "#16a34a" },
	selected: {
		bg: colors.bgSubtle,
		label: "Selected",
		text: colors.textSecondary,
	},
	uploading: { bg: "#eff6ff", label: "Uploading", text: colors.accent },
	validating: { bg: "#f5f3ff", label: "Validating", text: "#7c3aed" },
};
