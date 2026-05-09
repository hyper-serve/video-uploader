import { HyperserveClient } from "@hyperserve/hyperserve-js";

const client = new HyperserveClient({
	apiKey: process.env.HYPERSERVE_API_KEY ?? "",
	baseUrl: process.env.HYPERSERVE_BASE_URL,
});

const PORT = 3001;

const cors = {
	"Access-Control-Allow-Headers": "Content-Type",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Origin": "*",
};

Bun.serve({
	async fetch(req) {
		const { pathname } = new URL(req.url);

		if (req.method === "OPTIONS") {
			return new Response(null, { headers: cors, status: 204 });
		}

		try {
			if (req.method === "POST" && pathname === "/create-upload") {
				const { filename, fileSizeBytes, resolutions, isPublic } =
					await req.json();
				const result = await client.createVideo({
					filename,
					fileSizeBytes,
					isPublic,
					resolutions,
				});
				return Response.json(
					{
						contentType: result.contentType,
						uploadUrl: result.uploadUrl,
						videoId: result.id,
					},
					{ headers: cors },
				);
			}

			const completeMatch = pathname.match(/^\/complete-upload\/(.+)$/);
			if (req.method === "POST" && completeMatch) {
				await client.completeUpload(completeMatch[1]);
				return new Response(null, { headers: cors, status: 204 });
			}

			const statusMatch = pathname.match(/^\/video-status\/(.+)$/);
			if (req.method === "GET" && statusMatch) {
				const video = await client.getVideo(statusMatch[1]);
				const status =
					video.status === "ready"
						? "ready"
						: video.status === "fail"
							? "failed"
							: "processing";
				const readyRes = Object.values(video.resolutions).find(
					(r) => r?.status === "ready" && r?.videoUrl,
				);
				return Response.json(
					{ playbackUrl: readyRes?.videoUrl, status },
					{ headers: cors },
				);
			}

			return new Response("Not found", { headers: cors, status: 404 });
		} catch (err) {
			const message = err instanceof Error ? err.message : "Internal error";
			return Response.json({ error: message }, { headers: cors, status: 500 });
		}
	},
	port: PORT,
});

console.log(`Server running at http://localhost:${PORT}`);
