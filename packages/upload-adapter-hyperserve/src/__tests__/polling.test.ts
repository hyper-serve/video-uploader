import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HyperserveStatusChecker } from "../polling/index.js";

describe("HyperserveStatusChecker", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("calls onStatusChange with 'ready' and playbackUrl when video is ready", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();
		const getVideoStatus = vi.fn().mockResolvedValue({
			playbackUrl: "https://cdn.example.com/video.mp4",
			status: "ready",
		});

		const checker = new HyperserveStatusChecker({
			getVideoStatus,
			intervalMs: 1000,
		});
		checker.checkStatus({
			uploadResult: { videoId: "video-1" },
			onStatusChange,
			signal: ac.signal,
		});

		await vi.advanceTimersByTimeAsync(0);

		expect(onStatusChange).toHaveBeenCalledWith("ready", {
			playbackUrl: "https://cdn.example.com/video.mp4",
		});
		expect(getVideoStatus).toHaveBeenCalledWith("video-1");
	});

	it("calls onStatusChange with 'failed' when video fails", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();
		const getVideoStatus = vi.fn().mockResolvedValue({ status: "failed" });

		const checker = new HyperserveStatusChecker({
			getVideoStatus,
			intervalMs: 1000,
		});
		checker.checkStatus({
			uploadResult: { videoId: "video-1" },
			onStatusChange,
			signal: ac.signal,
		});

		await vi.advanceTimersByTimeAsync(0);

		expect(onStatusChange).toHaveBeenCalledWith("failed");
	});

	it("continues polling when status is processing", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();
		const getVideoStatus = vi
			.fn()
			.mockResolvedValueOnce({ status: "processing", statusDetail: "encoding" })
			.mockResolvedValueOnce({
				playbackUrl: "https://cdn.example.com/video.mp4",
				status: "ready",
			});

		const checker = new HyperserveStatusChecker({
			getVideoStatus,
			intervalMs: 2000,
		});
		checker.checkStatus({
			uploadResult: { videoId: "video-1" },
			onStatusChange,
			signal: ac.signal,
		});

		await vi.advanceTimersByTimeAsync(0);
		expect(onStatusChange).toHaveBeenCalledWith("processing", {
			statusDetail: "encoding",
		});

		await vi.advanceTimersByTimeAsync(2000);
		expect(onStatusChange).toHaveBeenCalledWith("ready", {
			playbackUrl: "https://cdn.example.com/video.mp4",
		});
		expect(getVideoStatus).toHaveBeenCalledTimes(2);
	});

	it("stops polling when signal is aborted", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();
		const getVideoStatus = vi.fn().mockResolvedValue({ status: "processing" });

		const checker = new HyperserveStatusChecker({
			getVideoStatus,
			intervalMs: 1000,
		});
		checker.checkStatus({
			uploadResult: { videoId: "video-1" },
			onStatusChange,
			signal: ac.signal,
		});

		await vi.advanceTimersByTimeAsync(0);
		ac.abort();
		await vi.advanceTimersByTimeAsync(5000);

		expect(getVideoStatus).toHaveBeenCalledTimes(1);
	});

	it("retries with backoff when getVideoStatus throws", async () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const onStatusChange = vi.fn();
		const ac = new AbortController();
		const getVideoStatus = vi
			.fn()
			.mockRejectedValueOnce(new Error("Network error"))
			.mockResolvedValueOnce({
				playbackUrl: "https://cdn.example.com/video.mp4",
				status: "ready",
			});

		const checker = new HyperserveStatusChecker({
			getVideoStatus,
			intervalMs: 1000,
		});
		checker.checkStatus({
			uploadResult: { videoId: "video-1" },
			onStatusChange,
			signal: ac.signal,
		});

		await vi.advanceTimersByTimeAsync(0);
		expect(onStatusChange).not.toHaveBeenCalled();

		// first error backs off to intervalMs * 2^1 = 2000ms
		await vi.advanceTimersByTimeAsync(1999);
		expect(getVideoStatus).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(1);
		expect(onStatusChange).toHaveBeenCalledWith("ready", {
			playbackUrl: "https://cdn.example.com/video.mp4",
		});
		expect(getVideoStatus).toHaveBeenCalledTimes(2);
	});

	it("backs off exponentially on consecutive errors", async () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const onStatusChange = vi.fn();
		const ac = new AbortController();
		const getVideoStatus = vi
			.fn()
			.mockRejectedValueOnce(new Error("err")) // 1 → backoff 2000ms
			.mockRejectedValueOnce(new Error("err")) // 2 → backoff 4000ms
			.mockRejectedValueOnce(new Error("err")) // 3 → backoff 8000ms
			.mockResolvedValueOnce({
				playbackUrl: "https://cdn.example.com/video.mp4",
				status: "ready",
			});

		const checker = new HyperserveStatusChecker({
			getVideoStatus,
			intervalMs: 1000,
		});
		checker.checkStatus({
			uploadResult: { videoId: "video-1" },
			onStatusChange,
			signal: ac.signal,
		});

		await vi.advanceTimersByTimeAsync(0);
		expect(getVideoStatus).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(2000);
		expect(getVideoStatus).toHaveBeenCalledTimes(2);

		await vi.advanceTimersByTimeAsync(4000);
		expect(getVideoStatus).toHaveBeenCalledTimes(3);

		await vi.advanceTimersByTimeAsync(8000);
		expect(getVideoStatus).toHaveBeenCalledTimes(4);
		expect(onStatusChange).toHaveBeenCalledWith("ready", {
			playbackUrl: "https://cdn.example.com/video.mp4",
		});
	});

	it("resets backoff after a successful response", async () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const onStatusChange = vi.fn();
		const ac = new AbortController();
		const getVideoStatus = vi
			.fn()
			.mockRejectedValueOnce(new Error("err")) // error → backoff 2000ms
			.mockResolvedValueOnce({ status: "processing" }) // success → reset to 1000ms
			.mockResolvedValueOnce({
				playbackUrl: "https://cdn.example.com/video.mp4",
				status: "ready",
			});

		const checker = new HyperserveStatusChecker({
			getVideoStatus,
			intervalMs: 1000,
		});
		checker.checkStatus({
			uploadResult: { videoId: "video-1" },
			onStatusChange,
			signal: ac.signal,
		});

		await vi.advanceTimersByTimeAsync(0);
		expect(getVideoStatus).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(2000);
		expect(getVideoStatus).toHaveBeenCalledTimes(2);

		// backoff reset — next poll uses intervalMs (1000ms), not 4000ms
		await vi.advanceTimersByTimeAsync(1000);
		expect(getVideoStatus).toHaveBeenCalledTimes(3);
		expect(onStatusChange).toHaveBeenCalledWith("ready", {
			playbackUrl: "https://cdn.example.com/video.mp4",
		});
	});

	it("caps backoff at MAX_BACKOFF_MS (60 seconds)", async () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const onStatusChange = vi.fn();
		const ac = new AbortController();
		const getVideoStatus = vi
			.fn()
			.mockRejectedValueOnce(new Error("err")) // 1 → 2000
			.mockRejectedValueOnce(new Error("err")) // 2 → 4000
			.mockRejectedValueOnce(new Error("err")) // 3 → 8000
			.mockRejectedValueOnce(new Error("err")) // 4 → 16000
			.mockRejectedValueOnce(new Error("err")) // 5 → 32000
			.mockRejectedValueOnce(new Error("err")) // 6 → 60000 (capped)
			.mockResolvedValueOnce({
				playbackUrl: "https://cdn.example.com/video.mp4",
				status: "ready",
			});

		const checker = new HyperserveStatusChecker({
			getVideoStatus,
			intervalMs: 1000,
		});
		checker.checkStatus({
			uploadResult: { videoId: "video-1" },
			onStatusChange,
			signal: ac.signal,
		});

		await vi.advanceTimersByTimeAsync(0); // 1st
		await vi.advanceTimersByTimeAsync(2000); // 2nd
		await vi.advanceTimersByTimeAsync(4000); // 3rd
		await vi.advanceTimersByTimeAsync(8000); // 4th
		await vi.advanceTimersByTimeAsync(16000); // 5th
		await vi.advanceTimersByTimeAsync(32000); // 6th
		expect(getVideoStatus).toHaveBeenCalledTimes(6);
		// 7th fires at 60000ms (capped), not 64000ms
		await vi.advanceTimersByTimeAsync(60000);
		expect(getVideoStatus).toHaveBeenCalledTimes(7);
		expect(onStatusChange).toHaveBeenCalledWith("ready", {
			playbackUrl: "https://cdn.example.com/video.mp4",
		});
	});

	it("passes statusDetail through when processing", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();
		const getVideoStatus = vi.fn().mockResolvedValue({
			status: "processing",
			statusDetail: "480p: transcoding, 1080p: pending",
		});

		const checker = new HyperserveStatusChecker({
			getVideoStatus,
			intervalMs: 1000,
		});
		checker.checkStatus({
			uploadResult: { videoId: "video-1" },
			onStatusChange,
			signal: ac.signal,
		});

		await vi.advanceTimersByTimeAsync(0);

		expect(onStatusChange).toHaveBeenCalledWith("processing", {
			statusDetail: "480p: transcoding, 1080p: pending",
		});
	});

	it("forwards thumbnailUri from VideoStatusResult to onStatusChange", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();
		const getVideoStatus = vi.fn().mockResolvedValue({
			playbackUrl: "https://cdn.example.com/video.mp4",
			thumbnailUri: "https://cdn.example.com/poster.jpg",
			status: "ready",
		});

		const checker = new HyperserveStatusChecker({
			getVideoStatus,
			intervalMs: 1000,
		});
		checker.checkStatus({
			uploadResult: { videoId: "video-1" },
			onStatusChange,
			signal: ac.signal,
		});

		await vi.advanceTimersByTimeAsync(0);

		expect(onStatusChange).toHaveBeenCalledWith("ready", {
			playbackUrl: "https://cdn.example.com/video.mp4",
			thumbnailUri: "https://cdn.example.com/poster.jpg",
		});
	});

	it("calls getVideoStatus with videoId from uploadResult", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();
		const getVideoStatus = vi.fn().mockResolvedValue({ status: "failed" });

		const checker = new HyperserveStatusChecker({
			getVideoStatus,
			intervalMs: 2000,
		});

		checker.checkStatus({
			onStatusChange,
			signal: ac.signal,
			uploadResult: { videoId: "video-99" },
		});

		await vi.advanceTimersByTimeAsync(0);

		expect(getVideoStatus).toHaveBeenCalledWith("video-99");
		expect(onStatusChange).toHaveBeenCalledWith("failed");
	});

	it("defaults intervalMs to 3000 when not provided", async () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const onStatusChange = vi.fn();
		const ac = new AbortController();
		const getVideoStatus = vi
			.fn()
			.mockResolvedValueOnce({ status: "processing" })
			.mockResolvedValueOnce({ status: "failed" });

		const checker = new HyperserveStatusChecker({ getVideoStatus });

		checker.checkStatus({
			onStatusChange,
			signal: ac.signal,
			uploadResult: { videoId: "video-1" },
		});

		await vi.advanceTimersByTimeAsync(0);
		expect(getVideoStatus).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(2999);
		expect(getVideoStatus).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(1);
		expect(getVideoStatus).toHaveBeenCalledTimes(2);
	});
});
