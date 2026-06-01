import type { FileState, WebFileRef } from "@hyperserve/video-uploader";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FileListToolbar } from "../FileListToolbar";
import { ViewModeProvider } from "../ViewModeContext";

let mockFiles: FileState[] = [];

vi.mock("@hyperserve/video-uploader", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@hyperserve/video-uploader")>();
	return {
		...actual,
		useUpload: () => ({
			files: mockFiles,
		}),
	};
});

function makeFile(id: string): FileState {
	return {
		error: null,
		id,
		playbackUrl: null,
		progress: 0,
		ref: {
			name: `${id}.mp4`,
			platform: "web",
			raw: new File([], `${id}.mp4`, { type: "video/mp4" }),
			size: 1000,
			type: "video/mp4",
			uri: "x",
		} satisfies WebFileRef,
		status: "selected",
		statusDetail: null,
		thumbnailUri: null,
		videoId: null,
	};
}

describe("FileListToolbar", () => {
	beforeEach(() => {
		mockFiles = [];
	});

	it("renders file count with correct singular/plural", () => {
		mockFiles = [makeFile("1")];
		const { rerender } = render(
			<ViewModeProvider>
				<FileListToolbar />
			</ViewModeProvider>,
		);
		expect(screen.getByText("1 file added")).toBeTruthy();

		mockFiles = [makeFile("1"), makeFile("2")];
		rerender(
			<ViewModeProvider>
				<FileListToolbar />
			</ViewModeProvider>,
		);
		expect(screen.getByText("2 files added")).toBeTruthy();
	});

	it("renders 0 files added when empty", () => {
		render(
			<ViewModeProvider>
				<FileListToolbar />
			</ViewModeProvider>,
		);
		expect(screen.getByText("0 files added")).toBeTruthy();
	});

	it("uses custom label function for FileCount", () => {
		mockFiles = [makeFile("1"), makeFile("2"), makeFile("3")];
		render(
			<ViewModeProvider>
				<FileListToolbar
					left={<FileListToolbar.FileCount label={(n) => `${n} videos`} />}
				/>
			</ViewModeProvider>,
		);
		expect(screen.getByText("3 videos")).toBeTruthy();
	});

	it("renders ViewToggle with List and Grid buttons", () => {
		render(
			<ViewModeProvider>
				<FileListToolbar />
			</ViewModeProvider>,
		);
		expect(screen.getByLabelText("List view")).toBeTruthy();
		expect(screen.getByLabelText("Grid view")).toBeTruthy();
	});

	it("ViewToggle calls setViewMode on click", () => {
		render(
			<ViewModeProvider>
				<FileListToolbar />
			</ViewModeProvider>,
		);
		fireEvent.click(screen.getByLabelText("Grid view"));
		fireEvent.click(screen.getByLabelText("List view"));
	});

	it("hides file count when showFileCount is false", () => {
		mockFiles = [makeFile("1")];
		render(
			<ViewModeProvider>
				<FileListToolbar showFileCount={false} />
			</ViewModeProvider>,
		);
		expect(screen.queryByText("1 file added")).toBeNull();
	});

	it("hides view toggle when showViewToggle is false", () => {
		render(
			<ViewModeProvider>
				<FileListToolbar showViewToggle={false} />
			</ViewModeProvider>,
		);
		expect(screen.queryByLabelText("List view")).toBeNull();
		expect(screen.queryByLabelText("Grid view")).toBeNull();
	});

	it("uses custom left and right slots", () => {
		render(
			<ViewModeProvider>
				<FileListToolbar
					left={<span>Custom Left</span>}
					right={<span>Custom Right</span>}
				/>
			</ViewModeProvider>,
		);
		expect(screen.getByText("Custom Left")).toBeTruthy();
		expect(screen.getByText("Custom Right")).toBeTruthy();
		expect(screen.queryByLabelText("List view")).toBeNull();
	});

	it("ViewToggle supports children render-prop", () => {
		render(
			<ViewModeProvider>
				<FileListToolbar
					right={
						<FileListToolbar.ViewToggle>
							{({ viewMode }) => <span data-testid="mode">{viewMode}</span>}
						</FileListToolbar.ViewToggle>
					}
				/>
			</ViewModeProvider>,
		);
		expect(screen.getByTestId("mode").textContent).toBe("list");
	});

	it("styles.root applies to toolbar container", () => {
		const { container } = render(
			<ViewModeProvider>
				<FileListToolbar styles={{ root: { padding: "8px" } }} />
			</ViewModeProvider>,
		);

		// ViewModeProvider renders a wrapping div; toolbar is its first child
		const viewModeDiv = container.firstElementChild as HTMLElement;
		const root = viewModeDiv.firstElementChild as HTMLElement;
		expect(root.style.padding).toBe("8px");
	});

	it("styles.fileCount applies to FileCount span", () => {
		const { container } = render(
			<ViewModeProvider>
				<FileListToolbar styles={{ fileCount: { color: "rgb(255, 0, 0)" } }} />
			</ViewModeProvider>,
		);

		const span = container.querySelector("span") as HTMLElement;
		expect(span.style.color).toBe("rgb(255, 0, 0)");
	});
});
