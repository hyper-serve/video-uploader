import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
	integrations: [
		starlight({
			components: {
				Footer: "./src/components/overrides/Footer.astro",
				SocialIcons: "./src/components/overrides/SocialIcons.astro",
			},
			customCss: ["./src/styles/custom.css"],
			favicon: "/favicon.svg",
			head: [
				{
					attrs: {
						content: "https://videouploader.fyi/og.png",
						property: "og:image",
					},
					tag: "meta",
				},
				{ attrs: { content: "1200", property: "og:image:width" }, tag: "meta" },
				{ attrs: { content: "630", property: "og:image:height" }, tag: "meta" },
				{
					attrs: {
						content:
							"Universal Video Uploader: headless video uploads with a full UI kit",
						property: "og:image:alt",
					},
					tag: "meta",
				},
				{
					attrs: {
						content: "Universal Video Uploader",
						property: "og:site_name",
					},
					tag: "meta",
				},
				{
					attrs: {
						content: "https://videouploader.fyi/og.png",
						name: "twitter:image",
					},
					tag: "meta",
				},
				{
					attrs: { content: "summary_large_image", name: "twitter:card" },
					tag: "meta",
				},
				{ attrs: { content: "#0a0a0b", name: "theme-color" }, tag: "meta" },
				{
					attrs: { href: "/apple-touch-icon.png", rel: "apple-touch-icon" },
					tag: "link",
				},
				{
					attrs: {
						href: "/favicon-32.png",
						rel: "icon",
						sizes: "32x32",
						type: "image/png",
					},
					tag: "link",
				},
				{
					attrs: { type: "application/ld+json" },
					content: JSON.stringify({
						"@context": "https://schema.org",
						"@graph": [
							{
								"@id": "https://videouploader.fyi/#website",
								"@type": "WebSite",
								description:
									"Single or multi-video uploads for React and React Native. Headless and full UI kit.",
								name: "Universal Video Uploader",
								publisher: { "@id": "https://hyperserve.io/#organization" },
								url: "https://videouploader.fyi",
							},
							{
								"@id": "https://videouploader.fyi/#software",
								"@type": "SoftwareApplication",
								applicationCategory: "DeveloperApplication",
								author: { "@id": "https://hyperserve.io/#organization" },
								description:
									"Single or multi-video uploads for React and React Native. Headless and full UI kit.",
								image: "https://videouploader.fyi/og.png",
								name: "Universal Video Uploader",
								offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
								operatingSystem: "Web, iOS, Android",
								sameAs: ["https://github.com/hyper-serve/video-uploader"],
								url: "https://videouploader.fyi",
							},
							{
								"@id": "https://hyperserve.io/#organization",
								"@type": "Organization",
								name: "Hyperserve",
								url: "https://hyperserve.io",
							},
						],
					}),
					tag: "script",
				},
			],
			logo: {
				alt: "Universal Video Uploader",
				src: "./src/assets/uvu-logo.svg",
			},
			sidebar: [
				{
					items: [
						{ label: "Introduction", slug: "index" },
						{ label: "Installation", slug: "getting-started/installation" },
						{ label: "Quick Start", slug: "getting-started/quick-start" },
						{ label: "React Native", slug: "getting-started/react-native" },
					],
					label: "Getting Started",
				},
				{
					items: [
						{ label: "Lifecycle", slug: "core-concepts/lifecycle" },
						{ label: "Adapters", slug: "core-concepts/adapters" },
						{ label: "Validation", slug: "core-concepts/validation" },
						{ label: "Previews", slug: "core-concepts/previews" },
						{ label: "Provider", slug: "core-concepts/provider" },
						{ label: "Hooks", slug: "core-concepts/hooks" },
						{ label: "Theming", slug: "core-concepts/theming" },
						{
							label: "Composable Layout",
							slug: "core-concepts/composable-layout",
						},
						{ label: "Headless Usage", slug: "core-concepts/headless" },
					],
					label: "Core Concepts",
				},
				{
					items: [
						{
							label: "ViewModeProvider",
							slug: "components/view-mode-provider",
						},
						{ label: "DropZone", slug: "components/drop-zone" },
						{ label: "FileList", slug: "components/file-list" },
						{ label: "FileItem", slug: "components/file-item" },
						{ label: "FileListToolbar", slug: "components/file-list-toolbar" },
						{ label: "StatusBadge", slug: "components/status-badge" },
						{ label: "ProgressBar", slug: "components/progress-bar" },
						{ label: "Thumbnail", slug: "components/thumbnail" },
					],
					label: "Components",
				},
				{
					items: [
						{ label: "Hyperserve", slug: "adapters/hyperserve-adapter" },
						{ label: "Custom Adapter", slug: "adapters/custom-adapter" },
					],
					label: "Adapters",
				},
				{
					items: [
						{ label: "Example: Next.js", slug: "guides/next-js" },
						{ label: "Example: Expo", slug: "guides/expo" },
					],
					label: "Guides",
				},
			],
			social: [
				{
					href: "https://hyperserve.io",
					icon: "external",
					label: "Hyperserve",
				},
				{
					href: "https://github.com/hyper-serve/video-uploader",
					icon: "github",
					label: "GitHub",
				},
			],
			title: "Universal Video Uploader",
		}),
		react(),
	],
	site: "https://videouploader.fyi",
});
