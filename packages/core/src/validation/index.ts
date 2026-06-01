import type { FileRef, ValidationResult } from "../types";

export { maxDuration } from "./maxDuration";

export type Validator = (
	file: FileRef,
) => ValidationResult | Promise<ValidationResult>;

export function maxFileSize(bytes: number): Validator {
	return (file) => {
		if (file.size > bytes) {
			const sizeMB = (bytes / (1024 * 1024)).toFixed(0);
			return {
				reason: `File exceeds maximum size of ${sizeMB}MB`,
				valid: false,
			};
		}
		return { valid: true };
	};
}

export function allowedTypes(types: string[]): Validator {
	return (file) => {
		const matches = types.some((t) => {
			if (t.includes("*")) {
				const pattern = t.replace("*", ".*");
				return new RegExp(`^${pattern}$`).test(file.type);
			}
			return file.type === t;
		});

		if (!matches) {
			return {
				reason: `File type "${file.type}" is not allowed. Allowed: ${types.join(", ")}`,
				valid: false,
			};
		}
		return { valid: true };
	};
}

export function composeValidators(...validators: Validator[]): Validator {
	return async (file) => {
		for (const validator of validators) {
			const result = await validator(file);
			if (!result.valid) return result;
		}
		return { valid: true };
	};
}
