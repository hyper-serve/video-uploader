import type { FileStatus } from "@hyperserve/video-uploader";
import { render, screen } from "@testing-library/react-native";
import { Text, View } from "react-native";
import { StatusBadge } from "../StatusBadge";

describe("StatusBadge (native)", () => {
	it("renders default label for each status", () => {
		const statuses: Array<{ status: FileStatus; label: string }> = [
			{ label: "Selected", status: "selected" },
			{ label: "Validating", status: "validating" },
			{ label: "Uploading", status: "uploading" },
			{ label: "Processing", status: "processing" },
			{ label: "Ready", status: "ready" },
			{ label: "Failed", status: "failed" },
		];

		for (const { status, label } of statuses) {
			const { unmount } = render(<StatusBadge status={status} />);
			expect(screen.getByText(label)).toBeTruthy();
			unmount();
		}
	});

	it("allows overriding label via statusConfig", () => {
		render(
			<StatusBadge
				status="ready"
				statusConfig={{
					ready: { bg: "#000", label: "Done!", text: "#fff" },
				}}
			/>,
		);
		expect(screen.getByText("Done!")).toBeTruthy();
	});

	it("uses getLabel over statusConfig label", () => {
		render(
			<StatusBadge
				getLabel={() => "Complete"}
				status="ready"
				statusConfig={{
					ready: { bg: "#000", label: "ignored", text: "#fff" },
				}}
			/>,
		);
		expect(screen.getByText("Complete")).toBeTruthy();
	});

	it("StatusBadge style prop applies to the badge container", () => {
		const { UNSAFE_getAllByType } = render(
			<StatusBadge
				status="ready"
				style={{ backgroundColor: "rgb(10, 20, 30)" }}
			/>,
		);

		// The badge View is the only View rendered by StatusBadge
		const views = UNSAFE_getAllByType(View);
		const badgeView = views[0];
		const flat = (
			Array.isArray(badgeView.props.style)
				? badgeView.props.style
				: [badgeView.props.style]
		).flat();
		expect(flat).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ backgroundColor: "rgb(10, 20, 30)" }),
			]),
		);
	});

	it("supports children render-prop", () => {
		// biome-ignore lint/correctness/noUnusedFunctionParameters: color destructured to verify shape, not used in render
		const childFn = jest.fn(({ label, color }) => (
			<Text testID="custom-label">{label}</Text>
		));
		render(<StatusBadge status="failed">{childFn}</StatusBadge>);
		expect(childFn).toHaveBeenCalledWith(
			expect.objectContaining({ label: "Failed" }),
		);
		expect(screen.getByTestId("custom-label")).toBeTruthy();
	});
});
