import { NextResponse } from "next/server";
import { mergeWithDefaultSiteContent, type SiteContent } from "../../../lib/siteContent";
import { readSiteContent, writeSiteContent } from "../../../lib/siteContent.server";

const isAuthorized = (request: Request): boolean => {
  const requiredToken = process.env.CMS_ADMIN_TOKEN?.trim();
  if (!requiredToken) return true;

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  return token === requiredToken;
};

export async function GET() {
  const content = await readSiteContent();
  return NextResponse.json({ content });
}

export async function PUT(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { content?: SiteContent };
    const normalized = mergeWithDefaultSiteContent(body.content);
    const saved = await writeSiteContent(normalized);
    return NextResponse.json({ content: saved });
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }
}
