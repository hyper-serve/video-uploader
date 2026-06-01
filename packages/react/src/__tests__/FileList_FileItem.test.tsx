import type { FileState, WebFileRef } from "@hyperserve/video-uploader";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FileItem } from "../FileItem";
import { FileList } from "../FileList";

function makeRef(name: string, size: number): WebFileRef {
	return {
		name,
		platform: "web",
		raw: new File([], name, { type: "video/mp4" }),
		size,
		type: "video/mp4",
		uri: "x",
	};
}

type MockUploadContext = {
	files: FileState[];
	removeFile: (id: string) => void;
	retryFile: (id: string) => void;
};

const removeFileMock = vi.fn();
const retryFileMock = vi.fn();

let mockContext: MockUploadContext = {
	files: [],
	removeFile: removeFileMock,
	retryFile: retryFileMock,
};

vi.mock("@hyperserve/video-uploader", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@hyperserve/video-uploader")>();
	return {
		...actual,
		useUpload: () => mockContext,
	};
});

describe("FileList and FileItem", () => {
	beforeEach(() => {
		removeFileMock.mockReset();
		retryFileMock.mockReset();
		mockContext = {
			files: [],
			removeFile: removeFileMock,
			retryFile: retryFileMock,
		};
	});

	it("renders emptyMessage when there are no files", () => {
		render(<FileList emptyMessage="Nothing here yet">{() => null}</FileList>);

		expect(screen.getByText("Nothing here yet")).toBeTruthy();
	});

	it("prefers renderEmpty over emptyMessage", () => {
		render(
			<FileList
				emptyMessage="won't show"
				renderEmpty={() => <div>Custom empty</div>}
			>
				{() => null}
			</FileList>,
		);

		expect(screen.getByText("Custom empty")).toBeTruthy();
		expect(screen.queryByText("won't show")).toBeNull();
	});

	it("styles.root applies to list container", () => {
		const file: FileState = {
			error: null,
			id: "1",
			playbackUrl: null,
			progress: 0,
			ref: makeRef("video.mp4", 1234),
			status: "selected",
			statusDetail: null,
			thumbnailUri: null,
			videoId: null,
		};
		mockContext.files = [file];

		const { container } = render(
			<FileList styles={{ root: { backgroundColor: "rgb(1, 2, 3)" } }}>
				{(f) => <div>{f.ref.name}</div>}
			</FileList>,
		);

		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper.style.backgroundColor).toBe("rgb(1, 2, 3)");
	});

	it("renders files in list mode by default", () => {
		const file: FileState = {
			error: null,
			id: "1",
			playbackUrl: null,
			progress: 0,
			ref: makeRef("video.mp4", 1234),
			status: "selected",
			statusDetail: null,
			thumbnailUri: null,
			videoId: null,
		};
		mockContext.files = [file];

		const { container } = render(
			<FileList>{(f) => <div>{f.ref.name}</div>}</FileList>,
		);

		expect(screen.getByText("video.mp4")).toBeTruthy();
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper.style.display).toBe("flex");
		expect(wrapper.style.flexDirection).toBe("column");
	});

	it("renders files in grid mode when viewMode is grid", () => {
		const file: FileState = {
			error: null,
			id: "1",
			playbackUrl: null,
			progress: 0,
			ref: makeRef("video.mp4", 1234),
			status: "selected",
			statusDetail: null,
			thumbnailUri: null,
			videoId: null,
		};
		mockContext.files = [file];

		const { container } = render(
			<FileList mode="grid">{(f) => <div>{f.ref.name}</div>}</FileList>,
		);

		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper.style.display).toBe("grid");
		expect(wrapper.style.gridTemplateColumns).toContain("minmax");
	});

	it("FileItem compound components render name, size, error and buttons by status", () => {
		const base: FileState = {
			error: "Oops",
			id: "1",
			playbackUrl: null,
			progress: 0,
			ref: makeRef("clip.mp4", 1024 * 1024),
			status: "failed",
			statusDetail: null,
			thumbnailUri: null,
			videoId: null,
		};

		render(
			<FileItem file={base}>
				<FileItem.FileName />
				<FileItem.FileSize />
				<FileItem.ErrorMessage />
				<FileItem.RetryButton />
				<FileItem.RemoveButton />
			</FileItem>,
		);

		expect(screen.getByText("clip.mp4")).toBeTruthy();
		expect(screen.getByText(/MB|KB/)).toBeTruthy();
		expect(screen.getByText("Oops")).toBeTruthy();

		fireEvent.click(screen.getByLabelText("Retry"));
		expect(retryFileMock).toHaveBeenCalledWith("1");

		fireEvent.click(screen.getByLabelText("Remove"));
		expect(removeFileMock).toHaveBeenCalledWith("1");
	});

	it("FileItem children render-prop receives file state", () => {
		const file: FileState = {
			error: null,
			id: "1",
			playbackUrl: null,
			progress: 42,
			ref: makeRef("clip.mp4", 1024),
			status: "uploading",
			statusDetail: null,
			thumbnailUri: null,
			videoId: null,
		};

		render(
			<FileItem file={file}>
				{(f) => (
					<span data-testid="status">
						{f.status}:{f.progress}
					</span>
				)}
			</FileItem>,
		);

		expect(screen.getByTestId("status").textContent).toBe("uploading:42");
	});

	it("StatusIcon renders spinner text for processing status", () => {
		const file: FileState = {
			error: null,
			id: "1",
			playbackUrl: null,
			progress: 100,
			ref: makeRef("clip.mp4", 1024),
			status: "processing",
			statusDetail: null,
			thumbnailUri: null,
			videoId: "v1",
		};

		render(
			<FileItem file={file}>
				<FileItem.StatusIcon />
			</FileItem>,
		);

		expect(screen.getByText("Processing...")).toBeTruthy();
	});

	it("StatusIcon renders check icon for ready status", () => {
		const file: FileState = {
			error: null,
			id: "1",
			playbackUrl: "https://example.com",
			progress: 100,
			ref: makeRef("clip.mp4", 1024),
			status: "ready",
			statusDetail: null,
			thumbnailUri: null,
			videoId: "v1",
		};

		const { container } = render(
			<FileItem file={file}>
				<FileItem.StatusIcon />
			</FileItem>,
		);

		expect(container.querySelector("svg")).toBeTruthy();
	});

	it("StatusIcon renders nothing for selected status", () => {
		const file: FileState = {
			error: null,
			id: "1",
			playbackUrl: null,
			progress: 0,
			ref: makeRef("clip.mp4", 1024),
			status: "selected",
			statusDetail: null,
			thumbnailUri: null,
			videoId: null,
		};

		const { container } = render(
			<FileItem file={file}>
				<FileItem.StatusIcon />
			</FileItem>,
		);

		expect(container.querySelector("svg")).toBeNull();
		expect(container.textContent).toBe("");
	});

	it("UploadProgress only renders when status is uploading", () => {
		const uploading: FileState = {
			error: null,
			id: "1",
			playbackUrl: null,
			progress: 65,
			ref: makeRef("clip.mp4", 1024),
			status: "uploading",
			statusDetail: null,
			thumbnailUri: null,
			videoId: null,
		};

		const { container, rerender } = render(
			<FileItem file={uploading}>
				<FileItem.UploadProgress />
			</FileItem>,
		);

		expect(container.querySelector("[role='progressbar']")).toBeTruthy();

		const selected: FileState = {
			...uploading,
			progress: 0,
			status: "selected",
		};
		rerender(
			<FileItem file={selected}>
				<FileItem.UploadProgress />
			</FileItem>,
		);

		expect(container.querySelector("[role='progressbar']")).toBeNull();
	});

	it("RemoveButton shows Cancel label when file is uploading", () => {
		const file: FileState = {
			error: null,
			id: "1",
			playbackUrl: null,
			progress: 50,
			ref: makeRef("clip.mp4", 1024),
			status: "uploading",
			statusDetail: null,
			thumbnailUri: null,
			videoId: null,
		};

		render(
			<FileItem file={file}>
				<FileItem.RemoveButton />
			</FileItem>,
		);

		expect(screen.getByLabelText("Cancel")).toBeTruthy();
	});

	it("RemoveButton shows Remove label for selected/failed files", () => {
		const file: FileState = {
			error: "Error",
			id: "1",
			playbackUrl: null,
			progress: 0,
			ref: makeRef("clip.mp4", 1024),
			status: "failed",
			statusDetail: null,
			thumbnailUri: null,
			videoId: null,
		};

		render(
			<FileItem file={file}>
				<FileItem.RemoveButton />
			</FileItem>,
		);

		expect(screen.getByLabelText("Remove")).toBeTruthy();
	});

	it("throws when compound component is used outside FileItem", () => {
		expect(() => {
			render(<FileItem.FileName />);
		}).toThrow("FileItem compound components must be used within <FileItem>");
	});

	it("hides RetryButton when status is not failed and hides RemoveButton for ready files", () => {
		const ready: FileState = {
			error: null,
			id: "2",
			playbackUrl: "https://example.com",
			progress: 100,
			ref: makeRef("ready.mp4", 1000),
			status: "ready",
			statusDetail: null,
			thumbnailUri: null,
			videoId: "v2",
		};

		render(
			<FileItem file={ready}>
				<FileItem.FileName />
				<FileItem.RetryButton />
				<FileItem.RemoveButton />
			</FileItem>,
		);

		expect(screen.queryByText("Retry")).toBeNull();
		expect(screen.queryByLabelText("Remove")).toBeNull();
	});

	it("styles slot map applies to compound sub-components via context", () => {
		const file: FileState = {
			error: "Boom",
			id: "1",
			playbackUrl: null,
			progress: 0,
			ref: makeRef("clip.mp4", 1024),
			status: "failed",
			statusDetail: null,
			thumbnailUri: null,
			videoId: null,
		};

		render(
			<FileItem
				file={file}
				styles={{
					errorMessage: { color: "rgb(0, 128, 0)" },
					fileName: { color: "rgb(255, 0, 0)" },
				}}
			>
				<FileItem.FileName />
				<FileItem.ErrorMessage />
			</FileItem>,
		);

		const name = screen.getByText("clip.mp4") as HTMLElement;
		const error = screen.getByText("Boom") as HTMLElement;
		expect(name.style.color).toBe("rgb(255, 0, 0)");
		expect(error.style.color).toBe("rgb(0, 128, 0)");
	});

	it("local style prop wins over styles slot", () => {
		const file: FileState = {
			error: null,
			id: "1",
			playbackUrl: null,
			progress: 0,
			ref: makeRef("clip.mp4", 1024),
			status: "selected",
			statusDetail: null,
			thumbnailUri: null,
			videoId: null,
		};

		render(
			<FileItem file={file} styles={{ fileName: { color: "rgb(255, 0, 0)" } }}>
				<FileItem.FileName style={{ color: "rgb(0, 0, 255)" }} />
			</FileItem>,
		);

		const name = screen.getByText("clip.mp4") as HTMLElement;
		expect(name.style.color).toBe("rgb(0, 0, 255)");
	});

	it("styles.root merges into the FileItem container", () => {
		const file: FileState = {
			error: null,
			id: "1",
			playbackUrl: null,
			progress: 0,
			ref: makeRef("clip.mp4", 1024),
			status: "selected",
			statusDetail: null,
			thumbnailUri: null,
			videoId: null,
		};

		const { container } = render(
			<FileItem
				file={file}
				styles={{ root: { backgroundColor: "rgb(10, 20, 30)" } }}
			>
				<FileItem.FileName />
			</FileItem>,
		);

		const root = container.firstElementChild as HTMLElement;
		expect(root.style.backgroundColor).toBe("rgb(10, 20, 30)");
	});

	it("StatusIcon textStyle prop overrides inner text font-size", () => {
		const file: FileState = {
			error: null,
			id: "1",
			playbackUrl: null,
			progress: 100,
			ref: makeRef("clip.mp4", 1024),
			status: "processing",
			statusDetail: null,
			thumbnailUri: null,
			videoId: "v1",
		};

		render(
			<FileItem file={file}>
				<FileItem.StatusIcon textStyle={{ fontSize: 10 }} />
			</FileItem>,
		);

		const text = screen.getByText("Processing...") as HTMLElement;
		expect(text.style.fontSize).toBe("10px");
	});

	it("StatusIcon children render prop receives status and label", () => {
		const file: FileState = {
			error: null,
			id: "1",
			playbackUrl: null,
			progress: 100,
			ref: makeRef("clip.mp4", 1024),
			status: "processing",
			statusDetail: null,
			thumbnailUri: null,
			videoId: "v1",
		};

		render(
			<FileItem file={file}>
				<FileItem.StatusIcon>
					{({ status, label }) => (
						<span data-testid="custom-status">
							{status}:{label}
						</span>
					)}
				</FileItem.StatusIcon>
			</FileItem>,
		);

		expect(screen.getByTestId("custom-status").textContent).toBe(
			"processing:Processing",
		);
	});
});
