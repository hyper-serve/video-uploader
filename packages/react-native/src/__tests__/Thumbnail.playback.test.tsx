import type { FileState } from "@hyperserve/video-uploader";
import { render, screen } from "@testing-library/react-native";
import { Image } from "react-native";

const mockUseVideoPlayer = jest.fn();

jest.mock(
	"expo-video",
	() => {
		const React = require("react");
		const { Text } = require("react-native");
		return {
			useVideoPlayer: (source: unknown) => {
				mockUseVideoPlayer(source);
				return { source };
			},
			VideoView: (props: Record<string, unknown>) =>
				React.createElement(
					Text,
					{ testID: "video-view" },
					props.player ? "has-player" : "no-player",
				),
		};
	},
	{ virtual: true },
);

import { FileItem } from "../FileItem";
import { Thumbnail } from "../Thumbnail";

const readyFile: FileState = {
	error: null,
	id: "f1",
	playbackUrl: "https://cdn.example.com/video.m3u8",
	progress: 100,
	ref: {
		name: "clip.mp4",
		platform: "native",
		size: 1000,
		type: "video/mp4",
		uri: "file:///clip.mp4",
	},
	status: "ready",
	statusDetail: null,
	thumbnailUri: "file:///thumb.jpg",
	videoId: "v1",
};

describe("Thumbnail playback (native)", () => {
	beforeEach(() => {
		mockUseVideoPlayer.mockReset();
	});

	it("renders the expo-video player when playback is enabled and file is ready", () => {
		render(<Thumbnail file={readyFile} playback />);
		expect(screen.getByTestId("video-view")).toBeTruthy();
		expect(mockUseVideoPlayer).toHaveBeenCalledWith(readyFile.playbackUrl);
		expect(screen.queryByTestId("thumbnail-image")).toBeNull();
	});

	it("does not render the player without the playback prop, even when ready", () => {
		const { UNSAFE_getByType } = render(<Thumbnail file={readyFile} />);
		expect(screen.queryByTestId("video-view")).toBeNull();
		expect(UNSAFE_getByType(Image).props.source).toEqual({
			uri: "file:///thumb.jpg",
		});
	});

	it("falls back to the thumbnail when playback is enabled but the file is not ready", () => {
		const pending: FileState = { ...readyFile, status: "uploading" };
		const { UNSAFE_getByType } = render(<Thumbnail file={pending} playback />);
		expect(screen.queryByTestId("video-view")).toBeNull();
		expect(UNSAFE_getByType(Image)).toBeTruthy();
	});

	it("falls back to the thumbnail when ready but playbackUrl is missing", () => {
		const noUrl: FileState = { ...readyFile, playbackUrl: null };
		const { UNSAFE_getByType } = render(<Thumbnail file={noUrl} playback />);
		expect(screen.queryByTestId("video-view")).toBeNull();
		expect(UNSAFE_getByType(Image)).toBeTruthy();
	});

	it("FileItem.PlaybackPreview renders the player for a ready file", () => {
		render(
			<FileItem file={readyFile}>
				<FileItem.PlaybackPreview />
			</FileItem>,
		);
		expect(screen.getByTestId("video-view")).toBeTruthy();
	});

	it("FileItem.PlaybackPreview renders nothing when the file is not ready", () => {
		const pending: FileState = { ...readyFile, status: "uploading" };
		render(
			<FileItem file={pending}>
				<FileItem.PlaybackPreview />
			</FileItem>,
		);
		expect(screen.queryByTestId("video-view")).toBeNull();
	});
});
