import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const here = path.dirname(fileURLToPath(import.meta.url));
const pub = path.resolve(here, "../public");

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });

// 1. og.png (1200x630) from the HTML template
await page.setViewportSize({ height: 630, width: 1200 });
await page.goto("file://" + path.join(here, "og-template.html"));
await page.screenshot({ path: path.join(pub, "og.png") });

// 2. icon PNGs from the favicon SVG (tile is opaque, no transparency needed)
const faviconSvg = fs.readFileSync(path.join(pub, "favicon.svg"), "utf8");
async function rasterizeSvg(svg, size, out) {
	const html =
		`<!DOCTYPE html><html><head><style>*{margin:0;padding:0}` +
		`html,body{width:${size}px;height:${size}px}svg{width:${size}px;height:${size}px;display:block}` +
		`</style></head><body>${svg}</body></html>`;
	await page.setViewportSize({ height: size, width: size });
	await page.setContent(html);
	await page.screenshot({ path: out });
}
await rasterizeSvg(faviconSvg, 180, path.join(pub, "apple-touch-icon.png"));
await rasterizeSvg(faviconSvg, 32, path.join(pub, "favicon-32.png"));

await browser.close();
console.log("Generated og.png, apple-touch-icon.png, favicon-32.png");
