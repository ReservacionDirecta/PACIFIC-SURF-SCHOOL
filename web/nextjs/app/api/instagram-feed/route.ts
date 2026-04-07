import { NextResponse } from "next/server";

type InstagramGraphItem = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
};

type InstagramFeedPost = {
  id: string;
  caption: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  mediaUrl: string;
  permalink: string;
  timestamp: string;
};

const clampLimit = (value: string | null): number => {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed)) return 6;
  return Math.min(12, Math.max(1, parsed));
};

export async function GET(request: Request) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  const { searchParams } = new URL(request.url);
  const limit = clampLimit(searchParams.get("limit"));

  if (!token) {
    return NextResponse.json({ posts: [], connected: false, message: "INSTAGRAM_ACCESS_TOKEN no configurado." });
  }

  try {
    const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
    const endpoint = `https://graph.instagram.com/me/media?fields=${encodeURIComponent(fields)}&limit=${limit}&access_token=${encodeURIComponent(token)}`;

    const response = await fetch(endpoint, {
      method: "GET",
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { posts: [], connected: false, message: "No se pudo consultar Instagram Graph API." },
        { status: 502 }
      );
    }

    const payload = (await response.json()) as { data?: InstagramGraphItem[] };
    const posts: InstagramFeedPost[] = (payload.data || [])
      .map((item) => {
        const mediaType = item.media_type;
        if (mediaType !== "IMAGE" && mediaType !== "VIDEO" && mediaType !== "CAROUSEL_ALBUM") {
          return null;
        }

        const mediaUrl = (item.thumbnail_url || item.media_url || "").trim();
        const permalink = (item.permalink || "").trim();
        if (!mediaUrl || !permalink) return null;

        return {
          id: item.id,
          caption: (item.caption || "Publicacion de Instagram").trim(),
          mediaType,
          mediaUrl,
          permalink,
          timestamp: (item.timestamp || "").trim(),
        };
      })
      .filter((item): item is InstagramFeedPost => item !== null)
      .slice(0, limit);

    return NextResponse.json(
      { posts, connected: true },
      {
        headers: {
          "cache-control": "public, s-maxage=900, stale-while-revalidate=86400",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { posts: [], connected: false, message: "Error consultando Instagram." },
      { status: 500 }
    );
  }
}
