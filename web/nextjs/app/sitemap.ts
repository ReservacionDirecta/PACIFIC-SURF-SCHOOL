import type { MetadataRoute } from "next";

const BASE_URL = "https://pacificsurfschool.pe";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          "es-PE": `${BASE_URL}/`,
          "en-US": `${BASE_URL}/en`,
        },
      },
    },
    {
      url: `${BASE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          "es-PE": `${BASE_URL}/`,
          "en-US": `${BASE_URL}/en`,
        },
      },
    },
  ];
}
