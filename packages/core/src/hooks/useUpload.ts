import { useContext } from "react";
import { UploadContext } from "../context";
import type { UploadContextValue } from "../types";

export function useUpload(): UploadContextValue {
	const context = useContext(UploadContext);
	if (!context) {
		throw new Error("useUpload must be used within an UploadProvider");
	}
	return context;
}
