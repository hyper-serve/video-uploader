import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
	integrations: [
		starlight({
			customCss: ["./src/styles/custom.css"],
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
});
