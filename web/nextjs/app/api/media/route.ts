import { NextResponse } from "next/server";
import { deleteStoredMedia, listStoredMedia, saveUploadedMedia } from "../../../lib/siteContent.server";

const isAuthorized = (request: Request): boolean => {
  const requiredToken = process.env.CMS_ADMIN_TOKEN?.trim();
  if (!requiredToken) return true;

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  return token === requiredToken;
};

export async function GET() {
  const files = await listStoredMedia();
  return NextResponse.json({ files });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "File is required" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const saved = await saveUploadedMedia(file.name, Buffer.from(arrayBuffer));
    return NextResponse.json({ file: saved }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Upload failed" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || "";
  if (!name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }

  const deleted = await deleteStoredMedia(name);
  if (!deleted) {
    return NextResponse.json({ message: "File not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
