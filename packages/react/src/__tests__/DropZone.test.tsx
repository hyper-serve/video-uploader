import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DropZone } from "../DropZone";

const addFilesMock = vi.fn();
let canAddMoreValue = true;

vi.mock("@hyperserve/video-uploader", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@hyperserve/video-uploader")>();
	return {
		...actual,
		toFileRefs: (files: File[] | FileList) => Array.from(files),
		useUpload: () => ({
			addFiles: addFilesMock,
			canAddMore: canAddMoreValue,
		}),
	};
});

function createFile(name: string, type: string): File {
	return new File(["content"], name, { type });
}

describe("DropZone", () => {
	beforeEach(() => {
		addFilesMock.mockReset();
		canAddMoreValue = true;
		vi.restoreAllMocks();
	});

	it("calls input click on Enter and Space when enabled", () => {
		const clickSpy = vi
			.spyOn(HTMLInputElement.prototype, "click")
			.mockImplementation(() => {});

		const { getByRole } = render(<DropZone />);
		const button = getByRole("button");

		fireEvent.keyDown(button, { key: "Enter" });
		fireEvent.keyDown(button, { key: " " });

		expect(clickSpy).toHaveBeenCalledTimes(2);
	});

	it("does not open picker when disabled", () => {
		const clickSpy = vi
			.spyOn(HTMLInputElement.prototype, "click")
			.mockImplementation(() => {});

		const { getByRole } = render(<DropZone disabled />);
		const button = getByRole("button");

		fireEvent.keyDown(button, { key: "Enter" });
		fireEvent.keyDown(button, { key: " " });
		fireEvent.click(button);

		expect(clickSpy).not.toHaveBeenCalled();
	});

	it("filters dropped files using accept and passes only matching files to addFiles", () => {
		const { getByRole } = render(<DropZone accept="video/*" />);
		const zone = getByRole("button");

		const videoFile = createFile("video.mp4", "video/mp4");
		const textFile = createFile("notes.txt", "text/plain");

		fireEvent.drop(zone, {
			dataTransfer: {
				files: [videoFile, textFile],
			},
		});

		expect(addFilesMock).toHaveBeenCalledTimes(1);
		const passed = addFilesMock.mock.calls[0][0] as File[];
		expect(passed).toHaveLength(1);
		expect(passed[0].name).toBe("video.mp4");
	});

	it("adds files via file input change event", () => {
		const { container } = render(<DropZone />);
		const input = container.querySelector(
			"input[type='file']",
		) as HTMLInputElement;
		const videoFile = createFile("video.mp4", "video/mp4");

		Object.defineProperty(input, "files", {
			value: [videoFile],
			writable: false,
		});

		fireEvent.change(input);

		expect(addFilesMock).toHaveBeenCalledTimes(1);
	});

	it("passes multiple prop to file input", () => {
		const { container: c1 } = render(<DropZone multiple={false} />);
		const input1 = c1.querySelector("input[type='file']") as HTMLInputElement;
		expect(input1.hasAttribute("multiple")).toBe(false);

		const { container: c2 } = render(<DropZone multiple />);
		const input2 = c2.querySelector("input[type='file']") as HTMLInputElement;
		expect(input2.hasAttribute("multiple")).toBe(true);
	});

	it("renders supportingText when provided", () => {
		render(<DropZone supportingText="MP4 files up to 100MB" />);
		expect(screen.getByText("MP4 files up to 100MB")).toBeTruthy();
	});

	it("renders children render-prop with isDragging and openPicker", () => {
		const childFn = vi.fn(({ isDragging, openPicker }) => (
			<div>
				<span data-testid="dragging">{isDragging.toString()}</span>
				<button data-testid="pick-btn" onClick={openPicker} type="button">
					Pick
				</button>
			</div>
		));

		render(<DropZone>{childFn}</DropZone>);

		expect(childFn).toHaveBeenCalled();
		expect(screen.getByTestId("dragging").textContent).toBe("false");
	});

	it("sets isDragging to true on dragOver and false on dragLeave", () => {
		const childFn = vi.fn(({ isDragging }: { isDragging: boolean }) => (
			<span data-testid="dragging">{isDragging.toString()}</span>
		));

		const { getByRole } = render(<DropZone>{childFn}</DropZone>);
		const zone = getByRole("button");

		fireEvent.dragOver(zone, { dataTransfer: { files: [] } });
		expect(screen.getByTestId("dragging").textContent).toBe("true");

		fireEvent.dragLeave(zone, { relatedTarget: null });
		expect(screen.getByTestId("dragging").textContent).toBe("false");
	});

	it("does nothing on drop when disabled via canAddMore === false", () => {
		addFilesMock.mockImplementation(() => {});
		canAddMoreValue = false;

		const { getByRole } = render(<DropZone />);
		const zone = getByRole("button");

		const videoFile = createFile("video.mp4", "video/mp4");

		fireEvent.drop(zone, {
			dataTransfer: {
				files: [videoFile],
			},
		});

		expect(addFilesMock).not.toHaveBeenCalled();
		expect(zone.getAttribute("aria-disabled")).toBe("true");
		expect(zone.getAttribute("tabindex")).toBe("-1");
	});

	it("styles slot map themes default inner content", () => {
		const { container } = render(
			<DropZone
				styles={{
					primaryText: { color: "rgb(255, 0, 0)" },
					root: { backgroundColor: "rgb(10, 20, 30)" },
					supportingText: { color: "rgb(0, 128, 0)" },
				}}
				supportingText="MP4 only"
			/>,
		);

		const root = container.firstElementChild as HTMLElement;
		expect(root.style.backgroundColor).toBe("rgb(10, 20, 30)");
		expect(
			(screen.getByText(/Drop videos here/) as HTMLElement).style.color,
		).toBe("rgb(255, 0, 0)");
		expect((screen.getByText("MP4 only") as HTMLElement).style.color).toBe(
			"rgb(0, 128, 0)",
		);
	});

	it("local style prop wins over styles.root", () => {
		const { container } = render(
			<DropZone
				style={{ backgroundColor: "rgb(0, 0, 0)" }}
				styles={{ root: { backgroundColor: "rgb(255, 255, 255)" } }}
			/>,
		);

		const root = container.firstElementChild as HTMLElement;
		expect(root.style.backgroundColor).toBe("rgb(0, 0, 0)");
	});
});
