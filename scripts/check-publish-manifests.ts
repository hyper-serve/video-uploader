#!/usr/bin/env bun
/**
 * Publish preflight for the workspace manifests.
 *
 * Catches two ways a published tarball can break a consumer's install:
 *
 *   1. A range that is not a semver range at all. `@hyperserve/video-uploader-react@0.1.2`
 *      shipped `"@hyperserve/video-uploader": "workspace:^"`, which resolves only
 *      because the publisher rewrites it at pack time, and npm did not. Every
 *      `npm install` against it failed with EUNSUPPORTEDPROTOCOL.
 *
 *   2. A literal range on a sibling workspace package that the sibling's current
 *      version no longer satisfies, e.g. a peer of `^0.1.2` left behind after
 *      core moved to 0.2.0. Replacing the protocol with a literal range trades
 *      one failure mode for this one unless something checks it.
 *
 * `devDependencies` is not checked: consumers never install a dependency's
 * devDependencies, and `workspace:*` there is the standard monorepo idiom.
 *
 * Importable as `findManifestProblems` so the publisher can gate on it too;
 * running the file directly is the CLI form used by CI.
 */

import {
	PUBLISHED_BLOCKS,
	readWorkspacePackages,
	type WorkspacePackage,
} from "./workspace";

/**
 * Every workspace-manager protocol (`workspace:`, `catalog:`, `link:`, `file:`,
 * `portal:`) carries a colon and resolves only inside the monorepo. Blocklisting
 * `workspace:` alone is not enough, and `Bun.semver.satisfies` is no help as a
 * filter: it returns true for every one of those strings, and for the empty
 * string as well.
 */
function isNotSemverRange(range: string) {
	return range.trim() === "" || range.includes(":");
}

/**
 * Semver excludes prereleases from ranges that do not themselves carry a
 * prerelease tag, so `0.2.0-rc.0` does not satisfy `^0.2.0`. Comparing the base
 * version keeps an rc of one package from failing every sibling's preflight.
 */
function baseVersion(version: string) {
	return version.split("-")[0];
}

export function findManifestProblems(packages: WorkspacePackage[]): string[] {
	const workspaceVersions = new Map(
		packages.map(({ manifest }) => [manifest.name, manifest.version]),
	);
	const problems: string[] = [];

	for (const { dir, manifest } of packages) {
		if (manifest.private) continue;

		for (const block of PUBLISHED_BLOCKS) {
			for (const [dependency, range] of Object.entries(manifest[block] ?? {})) {
				const where = `${dir}/package.json → ${block}.${dependency}`;
				const localVersion = workspaceVersions.get(dependency);

				if (isNotSemverRange(range)) {
					problems.push(
						`${where} is "${range}", which is not a semver range. It resolves only inside this workspace, so every npm install of the published package fails with EUNSUPPORTEDPROTOCOL. Use a literal range such as "^${localVersion ?? "0.0.0"}".`,
					);
					continue;
				}

				if (localVersion === undefined) continue;

				if (!Bun.semver.satisfies(baseVersion(localVersion), range)) {
					problems.push(
						`${where} is "${range}", which the workspace version of ${dependency} (${localVersion}) does not satisfy. Widen or bump the range.`,
					);
				}
			}
		}
	}

	return problems;
}

if (import.meta.main) {
	const packages = await readWorkspacePackages();
	const problems = findManifestProblems(packages);

	if (problems.length > 0) {
		console.error(
			`Publish preflight failed with ${problems.length} problem(s):\n`,
		);
		for (const problem of problems) console.error(`  • ${problem}\n`);
		process.exit(1);
	}

	const publishable = packages.filter(
		({ manifest }) => !manifest.private,
	).length;
	console.log(
		`Publish preflight passed for ${publishable} publishable package(s).`,
	);
}
