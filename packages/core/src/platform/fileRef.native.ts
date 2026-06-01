import type { FileRef, NativeFileRef } from "../types";

export type DocumentPickerResult = {
	name: string;
	size: number;
	type: string;
	uri: string;
};

export function toFileRef(result: DocumentPickerResult): NativeFileRef {
	return {
		name: result.name,
		platform: "native",
		size: result.size,
		type: result.type,
		uri: result.uri,
	};
}

export function toFileRefs(results: DocumentPickerResult[]): NativeFileRef[] {
	return results.map(toFileRef);
}

export function revokeFileRef(_ref: FileRef): void {}
