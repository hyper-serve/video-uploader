#!/usr/bin/env bun
/**
 * Publishes every public workspace package whose version is not yet on npm.
 *
 * Releases stay a hand-authored version bump in a `chore(release):` commit; this
 * script only turns that commit into registry state, so a release can never
 * again depend on which package manager happened to run `publish` on which
 * laptop. Packages publish in dependency order and already-published versions
 * are skipped, which makes the whole thing safe to re-run.
 *
 * Pass `--dry-run` to see the plan without touching the registry.
 */

import { join } from "node:path";
import { findManifestProblems } from "./check-publish-manifests";
import { ROOT, readWorkspacePackages, topologicalOrder } from "./workspace";

const dryRun = process.argv.includes("--dry-run");
// `--otp=123456` from an authenticator app, for the occasional local publish.
// CI never needs it: trusted publishing authenticates over OIDC, which the
// account's require-2FA-on-write setting does not apply to.
const otp = process.argv.find((arg) => arg.startsWith("--otp="));
// Provenance needs the OIDC token that only GitHub Actions issues; a local run
// would just fail on it.
const provenance = process.env.GITHUB_ACTIONS === "true";

function run(command: string[], cwd: string) {
	const result = Bun.spawnSync(command, {
		cwd,
		stderr: "inherit",
		// stdin defaults to "ignore", which leaves npm without a TTY. On a
		// 2FA-required account it then prints its browser-auth URL and exits
		// EOTP instead of waiting for you to finish authenticating.
		stdin: "inherit",
		stdout: "inherit",
	});
	return result.exitCode === 0;
}

function isAlreadyPublished(name: string, version: string) {
	const result = Bun.spawnSync(
		["npm", "view", `${name}@${version}`, "version"],
		{
			cwd: ROOT,
			stderr: "pipe",
			stdout: "pipe",
		},
	);

	if (result.exitCode === 0) {
		return result.stdout.toString().trim() !== "";
	}

	// E404 is the only failure that genuinely means "not published yet". A 429,
	// a registry 5xx, or an ENEEDAUTH must not be read as an absent version, or
	// the script publishes over a live one and npm rejects it with E403.
	const stderr = result.stderr.toString();
	if (stderr.includes("E404")) {
		return false;
	}

	throw new Error(
		`Could not determine whether ${name}@${version} is published:\n${stderr.trim()}`,
	);
}

const packages = await readWorkspacePackages();

// The local `--otp=` path would otherwise be the one publish route with no
// manifest gate, which is exactly the route that shipped the original
// EUNSUPPORTEDPROTOCOL break.
const problems = findManifestProblems(packages);
if (problems.length > 0) {
	console.error(
		`Refusing to publish, manifest preflight failed with ${problems.length} problem(s):\n`,
	);
	for (const problem of problems) console.error(`  • ${problem}\n`);
	process.exit(1);
}

const publishable = topologicalOrder(
	// `private` is the intended signal, but it is pure convention and nothing
	// enforces it, so an example app that forgets the flag would be published to
	// the public registry. Only `packages/` is ever publishable.
	packages.filter(
		({ dir, manifest }) => !manifest.private && dir.startsWith("packages/"),
	),
);
const published: string[] = [];
const failed: string[] = [];

for (const { dir, manifest } of publishable) {
	const spec = `${manifest.name}@${manifest.version}`;

	if (isAlreadyPublished(manifest.name, manifest.version)) {
		console.log(`skip    ${spec} (already on npm)`);
		continue;
	}

	if (dryRun) {
		console.log(`would publish ${spec}`);
		continue;
	}

	console.log(`publish ${spec}`);
	const command = ["npm", "publish", "--access", "public"];
	// npm tags every publish `latest` unless told otherwise, which would point
	// consumers at a prerelease. Anything with a `-1.2.3-rc.0` suffix goes out
	// under `next` instead.
	if (manifest.version.includes("-")) command.push("--tag", "next");
	if (provenance) command.push("--provenance");
	if (otp !== undefined) command.push(otp);

	if (run(command, join(ROOT, dir))) {
		published.push(spec);
		continue;
	}

	// Everything after this point in the order may declare a peer range on the
	// package that just failed. Publishing them anyway would point consumers at
	// a version that never reached the registry, and npm never lets a version
	// number be reused, so the mistake is permanent.
	failed.push(spec);
	console.error(`\n${spec} failed to publish. Stopping before its dependents.`);
	break;
}

if (published.length > 0) console.log(`\nPublished: ${published.join(", ")}`);
if (failed.length > 0) {
	console.error(`\nFailed to publish: ${failed.join(", ")}`);
	process.exit(1);
}
if (published.length === 0 && !dryRun) console.log("\nNothing to publish.");
