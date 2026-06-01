import type { FileRef, WebFileRef } from "../types";

export function toFileRef(file: File): WebFileRef {
	return {
		name: file.name,
		platform: "web",
		raw: file,
		size: file.size,
		type: file.type,
		uri: URL.createObjectURL(file),
	};
}

export function toFileRefs(files: FileList | File[]): WebFileRef[] {
	return Array.from(files).map(toFileRef);
}

export function revokeFileRef(ref: FileRef): void {
	URL.revokeObjectURL(ref.uri);
}
