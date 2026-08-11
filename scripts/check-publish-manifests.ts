#!/usr/bin/env bun
/**
 * Publish preflight for the workspace manifests.
 *
 * Catches two ways a published tarball can break a consumer's install:
 *
 *   1. A `workspace:` protocol left in a consumer-facing dependency block.
 *      It resolves only because the publisher rewrites it at pack time, and not
 *      every publisher does. `@hyperserve/video-uploader-react@0.1.2` shipped
 *      `"@hyperserve/video-uploader": "workspace:^"` this way and every `npm
 *      install` against it failed with EUNSUPPORTEDPROTOCOL.
 *
 *   2. A literal range on a sibling workspace package that the sibling's current
 *      version no longer satisfies, e.g. a peer of `^0.1.2` left behind after
 *      core moved to 0.2.0. Replacing the protocol with a literal range trades
 *      one failure mode for this one unless something checks it.
 *
 * `devDependencies` is deliberately not checked: consumers never install them,
 * and `workspace:*` there is the correct idiom.
 */

import { PUBLISHED_BLOCKS, readWorkspacePackages } from "./workspace";

const packages = await readWorkspacePackages();
const workspaceVersions = new Map(
	packages.map(({ manifest }) => [manifest.name, manifest.version]),
);
const publishable = packages.filter(({ manifest }) => !manifest.private);
const errors: string[] = [];

for (const { dir, manifest } of publishable) {
	for (const block of PUBLISHED_BLOCKS) {
		for (const [dependency, range] of Object.entries(manifest[block] ?? {})) {
			const where = `${dir}/package.json → ${block}.${dependency}`;

			if (range.startsWith("workspace:")) {
				errors.push(
					`${where} is "${range}". The workspace protocol is not a semver range, so it breaks installs for anyone whose publisher did not rewrite it. Use a literal range such as "^${workspaceVersions.get(dependency) ?? "0.0.0"}".`,
				);
				continue;
			}

			const localVersion = workspaceVersions.get(dependency);
			if (localVersion === undefined) continue;

			if (!Bun.semver.satisfies(localVersion, range)) {
				errors.push(
					`${where} is "${range}", which the workspace version of ${dependency} (${localVersion}) does not satisfy. Widen or bump the range.`,
				);
			}
		}
	}
}

if (errors.length > 0) {
	console.error(`Publish preflight failed with ${errors.length} problem(s):\n`);
	for (const error of errors) console.error(`  • ${error}\n`);
	process.exit(1);
}

console.log(
	`Publish preflight passed for ${publishable.length} publishable package(s).`,
);
