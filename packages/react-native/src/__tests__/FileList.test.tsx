import type { FileState } from "@hyperserve/video-uploader";
import { render, screen } from "@testing-library/react-native";
import { Text, View } from "react-native";
import { FileList } from "../FileList";

let mockFiles: FileState[] = [];

jest.mock("@hyperserve/video-uploader", () => ({
	...jest.requireActual("@hyperserve/video-uploader"),
	useUpload: () => ({
		files: mockFiles,
	}),
}));

jest.mock("../ViewModeContext", () => ({
	useViewMode: () => ({ setViewMode: jest.fn(), viewMode: "list" }),
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
			uri: `file:///${id}.mp4`,
		},
		status: "selected",
		statusDetail: null,
		thumbnailUri: null,
		videoId: null,
	};
}

describe("FileList (native)", () => {
	beforeEach(() => {
		mockFiles = [];
	});

	it("renders emptyMessage as string when no files", () => {
		render(<FileList emptyMessage="No videos yet" />);
		expect(screen.getByText("No videos yet")).toBeTruthy();
	});

	it("renders emptyMessage as ReactNode when no files", () => {
		render(
			<FileList
				emptyMessage={<Text testID="custom-empty">Custom Empty</Text>}
			/>,
		);
		expect(screen.getByTestId("custom-empty")).toBeTruthy();
	});

	it("renders files using custom children render function", () => {
		mockFiles = [makeFile("a"), makeFile("b")];
		render(
			<FileList>
				{(file) => (
					<Text key={file.id} testID={`file-${file.id}`}>
						{file.ref.name}
					</Text>
				)}
			</FileList>,
		);
		expect(screen.getByTestId("file-a")).toBeTruthy();
		expect(screen.getByTestId("file-b")).toBeTruthy();
	});

	it("renders default items when no children prop", () => {
		mockFiles = [makeFile("x")];
		render(<FileList />);
		expect(screen.getByText("x.mp4")).toBeTruthy();
	});

	it("grid mode caps every item to one column width so a lone item does not stretch", () => {
		mockFiles = [makeFile("a"), makeFile("b"), makeFile("c")];
		const { UNSAFE_getAllByType } = render(<FileList mode="grid" />);

		const flatten = (s: unknown): Record<string, unknown> =>
			Object.assign({}, ...(Array.isArray(s) ? s.flat() : [s]).filter(Boolean));
		const gridWrappers = UNSAFE_getAllByType(View).filter((v) => {
			const f = flatten(v.props.style);
			return f.flex === 1 && f.maxWidth !== undefined;
		});

		expect(gridWrappers).toHaveLength(3);
		for (const w of gridWrappers) {
			expect(flatten(w.props.style).maxWidth).toBe("50%");
		}
	});

	it("styles.empty applies to empty wrapper View", () => {
		const { UNSAFE_getAllByType } = render(
			<FileList
				emptyMessage="Empty"
				styles={{ empty: { backgroundColor: "rgb(1, 2, 3)" } }}
			/>,
		);

		const views = UNSAFE_getAllByType(View);
		const emptyView = views[0];
		const style = emptyView.props.style as Array<unknown>;
		const merged = Object.assign({}, ...style.filter(Boolean));
		expect((merged as Record<string, unknown>).backgroundColor).toBe(
			"rgb(1, 2, 3)",
		);
	});
});
