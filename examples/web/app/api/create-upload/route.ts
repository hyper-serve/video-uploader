import { NextResponse } from "next/server";
import { hyperserve } from "../../../lib/hyperserve";

export async function POST(req: Request) {
	try {
		const { filename, fileSizeBytes, resolutions, isPublic } = await req.json();

		const result = await hyperserve.createVideo({
			filename,
			fileSizeBytes,
			isPublic,
			resolutions,
		});

		return NextResponse.json({
			contentType: result.contentType,
			uploadUrl: result.uploadUrl,
			videoId: result.id,
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : "Internal error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
