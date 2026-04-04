import { NextResponse } from "next/server";
import { readStoredMedia } from "../../../../../lib/siteContent.server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> }
) {
  const params = await context.params;
  const file = await readStoredMedia(params.name);

  if (!file) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(file.buffer, {
    status: 200,
    headers: {
      "content-type": file.mimeType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
