import type { FileState } from "@hyperserve/video-uploader";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { FileItem } from "../FileItem.js";

const mockRemoveFile = jest.fn();
const mockRetryFile = jest.fn();

jest.mock("@hyperserve/video-uploader", () => ({
	...jest.requireActual("@hyperserve/video-uploader"),
	useUpload: () => ({
		removeFile: mockRemoveFile,
		retryFile: mockRetryFile,
	}),
}));

function makeFile(overrides: Partial<FileState> = {}): FileState {
	return {
		error: null,
		id: "1",
		playbackUrl: null,
		progress: 0,
		ref: {
			name: "clip.mp4",
			platform: "native",
			size: 1024 * 1024,
			type: "video/mp4",
			uri: "file:///clip.mp4",
		},
		status: "selected",
		statusDetail: null,
		thumbnailUri: null,
		videoId: null,
		...overrides,
	};
}

describe("FileItem (native)", () => {
	beforeEach(() => {
		mockRemoveFile.mockReset();
		mockRetryFile.mockReset();
	});

	it("renders FileName with the file name", () => {
		render(
			<FileItem file={makeFile()}>
				<FileItem.FileName />
			</FileItem>,
		);
		expect(screen.getByText("clip.mp4")).toBeTruthy();
	});

	it("renders FileSize formatted as MB", () => {
		render(
			<FileItem file={makeFile()}>
				<FileItem.FileSize />
			</FileItem>,
		);
		expect(screen.getByText("1.0 MB")).toBeTruthy();
	});

	it("renders FileSize as KB for small files", () => {
		render(
			<FileItem
				file={makeFile({
					ref: {
						name: "s.mp4",
						platform: "native",
						size: 512,
						type: "video/mp4",
						uri: "x",
					},
				})}
			>
				<FileItem.FileSize />
			</FileItem>,
		);
		expect(screen.getByText("1 KB")).toBeTruthy();
	});

	it("renders ErrorMessage only when error exists", () => {
		const { rerender } = render(
			<FileItem file={makeFile()}>
				<FileItem.ErrorMessage />
			</FileItem>,
		);
		expect(screen.queryByText("Upload failed")).toBeNull();

		rerender(
			<FileItem file={makeFile({ error: "Upload failed", status: "failed" })}>
				<FileItem.ErrorMessage />
			</FileItem>,
		);
		expect(screen.getByText("Upload failed")).toBeTruthy();
	});

	it("RemoveButton calls removeFile and is hidden for ready", () => {
		const { rerender } = render(
			<FileItem file={makeFile({ error: "err", status: "failed" })}>
				<FileItem.RemoveButton />
			</FileItem>,
		);

		fireEvent.press(screen.getByLabelText("Remove"));
		expect(mockRemoveFile).toHaveBeenCalledWith("1");

		rerender(
			<FileItem
				file={makeFile({
					playbackUrl: "url",
					progress: 100,
					status: "ready",
					videoId: "v1",
				})}
			>
				<FileItem.RemoveButton />
			</FileItem>,
		);
		expect(screen.queryByLabelText("Remove")).toBeNull();
	});

	it("RemoveButton shows Cancel when file is uploading", () => {
		render(
			<FileItem file={makeFile({ progress: 50, status: "uploading" })}>
				<FileItem.RemoveButton />
			</FileItem>,
		);
		expect(screen.getByLabelText("Cancel")).toBeTruthy();
	});

	it("RetryButton only visible for failed files and calls retryFile", () => {
		const { rerender } = render(
			<FileItem file={makeFile({ status: "selected" })}>
				<FileItem.RetryButton />
			</FileItem>,
		);
		expect(screen.queryByLabelText("Retry")).toBeNull();

		rerender(
			<FileItem file={makeFile({ error: "err", status: "failed" })}>
				<FileItem.RetryButton />
			</FileItem>,
		);
		fireEvent.press(screen.getByLabelText("Retry"));
		expect(mockRetryFile).toHaveBeenCalledWith("1");
	});

	it("StatusIcon renders for processing and ready, nothing for selected", () => {
		const { rerender } = render(
			<FileItem file={makeFile({ status: "selected" })}>
				<FileItem.StatusIcon />
			</FileItem>,
		);
		expect(screen.queryByText("✓")).toBeNull();

		rerender(
			<FileItem
				file={makeFile({
					playbackUrl: "url",
					progress: 100,
					status: "ready",
					videoId: "v1",
				})}
			>
				<FileItem.StatusIcon />
			</FileItem>,
		);
		expect(screen.getByText("✓")).toBeTruthy();
	});

	it("UploadProgress renders only when uploading", () => {
		const { rerender } = render(
			<FileItem file={makeFile({ progress: 50, status: "uploading" })}>
				<FileItem.UploadProgress />
			</FileItem>,
		);
		expect(screen.getByRole("progressbar")).toBeTruthy();

		rerender(
			<FileItem file={makeFile({ status: "selected" })}>
				<FileItem.UploadProgress />
			</FileItem>,
		);
		expect(screen.queryByRole("progressbar")).toBeNull();
	});

	it("children render-prop receives file state", () => {
		const childFn = jest.fn(() => <></>);
		render(
			<FileItem file={makeFile({ progress: 77, status: "uploading" })}>
				{childFn}
			</FileItem>,
		);
		expect(childFn).toHaveBeenCalledWith(
			expect.objectContaining({ progress: 77, status: "uploading" }),
		);
	});

	it("throws when compound component is used outside FileItem", () => {
		expect(() => {
			render(<FileItem.FileName />);
		}).toThrow("FileItem compound components must be used within <FileItem>");
	});

	it("styles slot map applies to compound sub-components via context", () => {
		render(
			<FileItem
				file={makeFile()}
				styles={{ fileName: { color: "rgb(255, 0, 0)" } }}
			>
				<FileItem.FileName />
			</FileItem>,
		);

		const name = screen.getByText("clip.mp4");
		expect(name.props.style).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ color: "rgb(255, 0, 0)" }),
			]),
		);
	});

	it("local style prop wins over styles slot (RN array merge)", () => {
		render(
			<FileItem
				file={makeFile()}
				styles={{ fileName: { color: "rgb(255, 0, 0)" } }}
			>
				<FileItem.FileName style={{ color: "rgb(0, 0, 255)" }} />
			</FileItem>,
		);

		const name = screen.getByText("clip.mp4");
		// RN style merges from left to right within an array; local style sits
		// last in the [base, slot, local] order, so its color wins.
		const flat = (
			Array.isArray(name.props.style) ? name.props.style : [name.props.style]
		).flat();
		const colors = flat
			.filter(
				(s: unknown): s is { color: string } =>
					!!s && typeof s === "object" && "color" in s,
			)
			.map((s: { color: string }) => s.color);
		expect(colors[colors.length - 1]).toBe("rgb(0, 0, 255)");
	});

	it("StatusIcon children render prop receives status and label", () => {
		const childFn = jest.fn(() => <></>);
		render(
			<FileItem file={makeFile({ status: "processing" })}>
				<FileItem.StatusIcon>{childFn}</FileItem.StatusIcon>
			</FileItem>,
		);
		expect(childFn).toHaveBeenCalledWith({
			label: "Processing",
			status: "processing",
		});
	});
});
