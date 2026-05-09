import { render, screen } from "@testing-library/react-native";
import { ProgressBar } from "../ProgressBar.js";

describe("ProgressBar (native)", () => {
	it("renders with correct accessibility values", () => {
		render(<ProgressBar progress={42} />);
		const bar = screen.getByRole("progressbar");
		expect(bar.props.accessibilityValue).toEqual({
			max: 100,
			min: 0,
			now: 42,
		});
	});

	it("renders fill at 0%", () => {
		render(<ProgressBar progress={0} />);
		const bar = screen.getByRole("progressbar");
		expect(bar.props.accessibilityValue.now).toBe(0);
	});

	it("renders fill at 100%", () => {
		render(<ProgressBar progress={100} />);
		const bar = screen.getByRole("progressbar");
		expect(bar.props.accessibilityValue.now).toBe(100);
	});

	it("supports children render-prop", () => {
		const childFn = jest.fn((p: number) => <>{p}%</>);
		render(<ProgressBar progress={75}>{childFn}</ProgressBar>);
		expect(childFn).toHaveBeenCalledWith(75);
	});

	it("styles.track applies to the track View", () => {
		const { UNSAFE_getAllByType } = render(
			<ProgressBar
				progress={50}
				styles={{ track: { backgroundColor: "rgb(10, 20, 30)" } }}
			/>,
		);

		const views = UNSAFE_getAllByType(require("react-native").View);
		const track = views[0];
		const flat = (
			Array.isArray(track.props.style) ? track.props.style : [track.props.style]
		).flat();
		expect(flat).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ backgroundColor: "rgb(10, 20, 30)" }),
			]),
		);
	});

	it("trackStyle prop wins over styles.track slot", () => {
		const { UNSAFE_getAllByType } = render(
			<ProgressBar
				progress={50}
				styles={{ track: { backgroundColor: "rgb(0, 0, 0)" } }}
				trackStyle={{ backgroundColor: "rgb(255, 255, 255)" }}
			/>,
		);

		const views = UNSAFE_getAllByType(require("react-native").View);
		const track = views[0];
		const flat = (
			Array.isArray(track.props.style) ? track.props.style : [track.props.style]
		).flat();
		// Find color entries; trackStyle (last in style array) should win.
		const colors = flat
			.filter(
				(s): s is { backgroundColor: string } =>
					!!s && typeof s === "object" && "backgroundColor" in s,
			)
			.map((s) => s.backgroundColor);
		expect(colors[colors.length - 1]).toBe("rgb(255, 255, 255)");
	});
});
