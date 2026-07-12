const STYLE_ID = "hs-uploader-keyframes";

const KEYFRAMES = `@keyframes hs-indeterminate {
	0% { transform: translateX(-60%); }
	100% { transform: translateX(160%); }
}`;

/**
 * Injects the keyframes used by the indeterminate ProgressBar into
 * <head> exactly once. The library ships inline styles only (no CSS
 * files), and @keyframes cannot live in an inline style attribute, so
 * this is the one place they get registered.
 *
 * No-ops during SSR (no `document`) and never injects twice.
 */
export function injectKeyframes(): void {
	if (typeof document === "undefined") return;
	if (document.getElementById(STYLE_ID)) return;
	const style = document.createElement("style");
	style.id = STYLE_ID;
	style.textContent = KEYFRAMES;
	document.head.appendChild(style);
}
