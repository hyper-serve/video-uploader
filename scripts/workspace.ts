import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

export const ROOT = resolve(import.meta.dir, "..");

const WORKSPACE_DIRS = ["packages", "examples"];

/** Dependency blocks a consumer of the published tarball actually installs from. */
export const PUBLISHED_BLOCKS = [
	"dependencies",
	"peerDependencies",
	"optionalDependencies",
] as const;

export type DependencyBlock = (typeof PUBLISHED_BLOCKS)[number];

export type Manifest = {
	name: string;
	version: string;
	private?: boolean;
} & Partial<Record<DependencyBlock, Record<string, string>>>;

export type WorkspacePackage = {
	/** Path relative to the repo root, e.g. `packages/react`. */
	dir: string;
	manifest: Manifest;
};

export async function readWorkspacePackages(): Promise<WorkspacePackage[]> {
	const found: WorkspacePackage[] = [];

	for (const workspaceDir of WORKSPACE_DIRS) {
		const entries = await readdir(join(ROOT, workspaceDir), {
			withFileTypes: true,
		});

		for (const entry of entries) {
			if (!entry.isDirectory()) continue;

			const dir = join(workspaceDir, entry.name);
			const raw = await readFile(join(ROOT, dir, "package.json"), "utf8").catch(
				() => null,
			);
			if (raw === null) continue;

			found.push({ dir, manifest: JSON.parse(raw) as Manifest });
		}
	}

	return found;
}

/**
 * Publishable packages ordered so a package always follows the workspace
 * packages it depends on. Core has to reach the registry before the adapters
 * and UI packages that declare a peer range on it.
 */
export function topologicalOrder(
	packages: WorkspacePackage[],
): WorkspacePackage[] {
	const byName = new Map(packages.map((pkg) => [pkg.manifest.name, pkg]));
	const ordered: WorkspacePackage[] = [];
	const visited = new Set<string>();

	function visit(pkg: WorkspacePackage) {
		if (visited.has(pkg.manifest.name)) return;
		visited.add(pkg.manifest.name);

		for (const block of PUBLISHED_BLOCKS) {
			for (const dependency of Object.keys(pkg.manifest[block] ?? {})) {
				const local = byName.get(dependency);
				if (local !== undefined) visit(local);
			}
		}

		ordered.push(pkg);
	}

	for (const pkg of packages) visit(pkg);

	return ordered;
}
