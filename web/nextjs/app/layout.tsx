import type { Metadata } from "next";
import "./globals.css";
import { readSiteContent } from "../lib/siteContent.server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await readSiteContent();

  return {
    title: content.seo.title,
    description: content.seo.description,
    alternates: {
      canonical: "/",
      languages: {
        "es-PE": "/",
        "en-US": "/en",
      },
    },
    openGraph: {
      title: content.seo.ogTitle,
      description: content.seo.ogDescription,
      type: "website",
      locale: "es_PE",
      siteName: "Pacific Surf School",
    },
    icons: {
      icon: "/logo.png",
      shortcut: "/logo.png",
      apple: "/logo.png",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
