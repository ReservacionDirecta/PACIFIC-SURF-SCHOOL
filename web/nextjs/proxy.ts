import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const decodeBasicAuth = (header: string): { username: string; password: string } | null => {
  const match = header.match(/^Basic\s+(.+)$/i);
  if (!match) return null;

  try {
    const decoded = atob(match[1]);
    const separator = decoded.indexOf(":");
    if (separator === -1) return null;

    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
};

export function proxy(request: NextRequest) {
  const requiredUser = process.env.CMS_ADMIN_USER?.trim();
  const requiredPassword = process.env.CMS_ADMIN_PASSWORD?.trim();

  if (!requiredUser || !requiredPassword) {
    return NextResponse.next();
  }

  const credentials = decodeBasicAuth(request.headers.get("authorization") || "");
  if (credentials?.username === requiredUser && credentials.password === requiredPassword) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Pacific Surf Admin"',
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
