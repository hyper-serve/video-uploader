import type { FileRef } from "@hyperserve/video-uploader";
import {
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react-native";
import { FilePicker } from "../FilePicker";

const mockAddFiles = jest.fn();

jest.mock("@hyperserve/video-uploader", () => ({
	...jest.requireActual("@hyperserve/video-uploader"),
	useUpload: () => ({
		addFiles: mockAddFiles,
	}),
}));

function makeRef(name = "video.mp4"): FileRef {
	return {
		name,
		platform: "native",
		size: 1024,
		type: "video/mp4",
		uri: `file:///${name}`,
	};
}

describe("FilePicker (native)", () => {
	beforeEach(() => {
		mockAddFiles.mockReset();
	});

	it("renders default button with Pick Videos text", () => {
		const pickFiles = jest.fn().mockResolvedValue([]);
		render(<FilePicker pickFiles={pickFiles} />);
		expect(screen.getByText("Pick Videos")).toBeTruthy();
	});

	it("calls pickFiles and addFiles when pressed", async () => {
		const refs = [makeRef("a.mp4"), makeRef("b.mp4")];
		const pickFiles = jest.fn().mockResolvedValue(refs);

		render(<FilePicker pickFiles={pickFiles} />);
		fireEvent.press(screen.getByText("Pick Videos"));

		await waitFor(() => {
			expect(mockAddFiles).toHaveBeenCalledWith(refs);
		});
	});

	it("does not call addFiles when pickFiles returns empty array", async () => {
		const pickFiles = jest.fn().mockResolvedValue([]);

		render(<FilePicker pickFiles={pickFiles} />);
		fireEvent.press(screen.getByText("Pick Videos"));

		await waitFor(() => {
			expect(pickFiles).toHaveBeenCalled();
		});
		expect(mockAddFiles).not.toHaveBeenCalled();
	});

	it("renders custom children", () => {
		const pickFiles = jest.fn().mockResolvedValue([]);
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { Text } = require("react-native");
		render(
			<FilePicker pickFiles={pickFiles}>
				<Text>Custom Button</Text>
			</FilePicker>,
		);
		expect(screen.queryByText("Pick Videos")).toBeNull();
	});

	it("supports children render-prop with pick function", async () => {
		const refs = [makeRef()];
		const pickFiles = jest.fn().mockResolvedValue(refs);
		const TestButton = () => {
			return (
				<FilePicker pickFiles={pickFiles}>
					{({ pick }) => {
						// eslint-disable-next-line @typescript-eslint/no-var-requires
						const { Pressable, Text } = require("react-native");
						return (
							<Pressable onPress={pick} testID="pick-btn">
								<Text>Custom Pick</Text>
							</Pressable>
						);
					}}
				</FilePicker>
			);
		};

		render(<TestButton />);
		fireEvent.press(screen.getByTestId("pick-btn"));

		await waitFor(() => {
			expect(mockAddFiles).toHaveBeenCalledWith(refs);
		});
	});

	it("styles.root applies to Pressable", async () => {
		const { UNSAFE_getByType } = render(
			<FilePicker
				pickFiles={async () => []}
				styles={{ root: { backgroundColor: "rgb(10, 20, 30)" } }}
			/>,
		);

		// Pressable renders as View in the RN test environment; check the
		// outermost View (the Pressable host node) carries the slot style.
		const pressable = UNSAFE_getByType(require("react-native").View);
		const flat = (
			Array.isArray(pressable.props.style)
				? pressable.props.style
				: [pressable.props.style]
		).flat();
		expect(flat).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ backgroundColor: "rgb(10, 20, 30)" }),
			]),
		);
	});
});
