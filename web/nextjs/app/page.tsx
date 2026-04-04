import type { Metadata } from "next";
import SurfWellnessLanding from "../SurfWellnessLanding";
import { readSiteContent } from "../lib/siteContent.server";

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
  };
}

export default function Page() {
  return <SurfWellnessLanding />;
}
