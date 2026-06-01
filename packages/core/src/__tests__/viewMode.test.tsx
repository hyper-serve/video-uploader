import { act, renderHook } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { useViewMode, ViewModeProvider } from "../viewMode";

describe("ViewModeProvider + useViewMode", () => {
	it("defaults to list mode", () => {
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<ViewModeProvider>{children}</ViewModeProvider>
		);
		const { result } = renderHook(() => useViewMode(), { wrapper });
		expect(result.current.viewMode).toBe("list");
	});

	it("respects defaultMode prop", () => {
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<ViewModeProvider defaultMode="grid">{children}</ViewModeProvider>
		);
		const { result } = renderHook(() => useViewMode(), { wrapper });
		expect(result.current.viewMode).toBe("grid");
	});

	it("setViewMode toggles between list and grid", () => {
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<ViewModeProvider>{children}</ViewModeProvider>
		);
		const { result } = renderHook(() => useViewMode(), { wrapper });

		expect(result.current.viewMode).toBe("list");

		act(() => {
			result.current.setViewMode("grid");
		});
		expect(result.current.viewMode).toBe("grid");

		act(() => {
			result.current.setViewMode("list");
		});
		expect(result.current.viewMode).toBe("list");
	});

	it("returns safe fallback when used outside provider", () => {
		const { result } = renderHook(() => useViewMode());
		expect(result.current.viewMode).toBe("list");
		expect(typeof result.current.setViewMode).toBe("function");
		// should not throw
		act(() => {
			result.current.setViewMode("grid");
		});
		expect(result.current.viewMode).toBe("list");
	});
});
