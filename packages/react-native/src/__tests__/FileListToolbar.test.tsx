import type { FileState } from "@hyperserve/video-uploader";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { FileListToolbar } from "../FileListToolbar";

let mockFiles: FileState[] = [];
let mockViewMode = "list";
const mockSetViewMode = jest.fn((mode: string) => {
	mockViewMode = mode;
});

jest.mock("@hyperserve/video-uploader", () => ({
	...jest.requireActual("@hyperserve/video-uploader"),
	useUpload: () => ({
		files: mockFiles,
	}),
}));

jest.mock("../ViewModeContext", () => ({
	useViewMode: () => ({
		setViewMode: mockSetViewMode,
		viewMode: mockViewMode,
	}),
}));

function makeFile(id: string): FileState {
	return {
		error: null,
		id,
		playbackUrl: null,
		progress: 0,
		ref: {
			name: `${id}.mp4`,
			platform: "native",
			size: 1000,
			type: "video/mp4",
			uri: "x",
		},
		status: "selected",
		statusDetail: null,
		thumbnailUri: null,
		videoId: null,
	};
}

describe("FileListToolbar (native)", () => {
	beforeEach(() => {
		mockFiles = [];
		mockViewMode = "list";
		mockSetViewMode.mockClear();
	});

	it("renders file count with correct pluralization", () => {
		mockFiles = [makeFile("1")];
		const { rerender } = render(<FileListToolbar />);
		expect(screen.getByText("1 file added")).toBeTruthy();

		mockFiles = [makeFile("1"), makeFile("2")];
		rerender(<FileListToolbar />);
		expect(screen.getByText("2 files added")).toBeTruthy();
	});

	it("renders 0 files added when empty", () => {
		render(<FileListToolbar />);
		expect(screen.getByText("0 files added")).toBeTruthy();
	});

	it("uses custom label for FileCount", () => {
		mockFiles = [makeFile("1"), makeFile("2")];
		render(
			<FileListToolbar
				left={<FileListToolbar.FileCount label={(n) => `${n} videos`} />}
			/>,
		);
		expect(screen.getByText("2 videos")).toBeTruthy();
	});

	it("renders List and Grid toggle buttons", () => {
		render(<FileListToolbar />);
		expect(screen.getByText("List")).toBeTruthy();
		expect(screen.getByText("Grid")).toBeTruthy();
	});

	it("ViewToggle calls setViewMode on press", () => {
		render(<FileListToolbar />);
		fireEvent.press(screen.getByText("Grid"));
		expect(mockSetViewMode).toHaveBeenCalledWith("grid");

		fireEvent.press(screen.getByText("List"));
		expect(mockSetViewMode).toHaveBeenCalledWith("list");
	});

	it("hides file count when showFileCount is false", () => {
		mockFiles = [makeFile("1")];
		render(<FileListToolbar showFileCount={false} />);
		expect(screen.queryByText("1 file added")).toBeNull();
	});

	it("hides view toggle when showViewToggle is false", () => {
		render(<FileListToolbar showViewToggle={false} />);
		expect(screen.queryByText("List")).toBeNull();
		expect(screen.queryByText("Grid")).toBeNull();
	});

	it("uses custom left and right slots", () => {
		render(
			<FileListToolbar
				left={<Text>Custom Left</Text>}
				right={<Text>Custom Right</Text>}
			/>,
		);
		expect(screen.getByText("Custom Left")).toBeTruthy();
		expect(screen.getByText("Custom Right")).toBeTruthy();
	});

	it("ViewToggle supports children render-prop", () => {
		render(
			<FileListToolbar
				right={
					<FileListToolbar.ViewToggle>
						{({ viewMode }) => <Text testID="mode">{viewMode}</Text>}
					</FileListToolbar.ViewToggle>
				}
			/>,
		);
		expect(screen.getByTestId("mode").props.children).toBe("list");
	});

	it("styles.root applies to toolbar View", () => {
		const { UNSAFE_getAllByType } = render(
			<FileListToolbar styles={{ root: { padding: 8 } }} />,
		);
		const views = UNSAFE_getAllByType(require("react-native").View);
		const root = views[0];
		const flat = (
			Array.isArray(root.props.style) ? root.props.style : [root.props.style]
		).flat();
		expect(flat).toEqual(
			expect.arrayContaining([expect.objectContaining({ padding: 8 })]),
		);
	});
});
