// Exercises expoVideo.ts's real behavior: resolving the optional `expo-video`
// module, memoizing the result, and warning exactly once when it is missing.
// The Thumbnail suites mock this seam, so without this file that logic is
// untested and an on-device playback regression would ship green.
//
// Each case runs in an isolated module registry so expoVideo.ts's module-level
// memo (`resolved`/`warnedMissingModule`) starts fresh and the `expo-video`
// mock can differ per case.

describe("getExpoVideo", () => {
	it("returns the expo-video module when it resolves, and memoizes it", () => {
		jest.isolateModules(() => {
			const fake = { useVideoPlayer: jest.fn(), VideoView: () => null };
			jest.doMock("expo-video", () => fake, { virtual: true });

			const { getExpoVideo } = require("../expoVideo");
			const first = getExpoVideo();
			const second = getExpoVideo();

			expect(first).toBe(fake);
			// Same reference on the second call proves the resolution is memoized.
			expect(second).toBe(first);
		});
	});

	it("returns null and warns once when expo-video is unavailable", () => {
		jest.isolateModules(() => {
			jest.doMock(
				"expo-video",
				() => {
					throw new Error("Cannot find module 'expo-video'");
				},
				{ virtual: true },
			);
			const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

			const { getExpoVideo } = require("../expoVideo");
			expect(getExpoVideo()).toBeNull();
			expect(getExpoVideo()).toBeNull();

			// Warns once across repeated calls, not on every render.
			expect(warn).toHaveBeenCalledTimes(1);
			expect(warn).toHaveBeenCalledWith(
				expect.stringContaining("install expo-video"),
			);
			warn.mockRestore();
		});
	});
});
