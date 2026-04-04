export type EditableTextContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroLead: string;
  brandNote: string;
  galleryEyebrow: string;
  galleryTitle: string;
  finalCtaTitle: string;
  finalCtaBody: string;
  finalCtaButton: string;
};

export type GalleryImage = {
  src: string;
  alt: string;
};

export type EditableMediaContent = {
  heroYoutubeUrl: string;
  storyYoutubeUrl: string;
  instagramProfileUrl: string;
  instagramLinks: string[];
  instagramVideoLinks: string[];
  youtubeGalleryLinks: string[];
  galleryImages: GalleryImage[];
};

export type SiteContent = {
  texts: EditableTextContent;
  media: EditableMediaContent;
};

const defaultGalleryImages: GalleryImage[] = [
  { src: "/media/session-a.svg", alt: "Alumno practicando take off en Barranquito" },
  { src: "/media/session-b.svg", alt: "Vista abierta del mar en Costa Verde durante clase" },
  { src: "/media/session-c.svg", alt: "Instructor corrigiendo postura antes de entrar al agua" },
  { src: "/media/session-a.svg", alt: "Alumno sonriendo despues de una buena ola" },
  { src: "/media/session-b.svg", alt: "Sesion de surf al atardecer en Barranquito" },
  { src: "/media/session-c.svg", alt: "Momento de remada y enfoque tecnico en clase" },
];

const splitCsv = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const toYoutubeWatchUrl = (rawValue: string): string => {
  const cleanValue = rawValue.trim();
  if (!cleanValue) return "";

  const idMatch = cleanValue.match(/^[A-Za-z0-9_-]{11}$/);
  if (idMatch) return `https://www.youtube.com/watch?v=${cleanValue}`;

  return cleanValue;
};

export const defaultSiteContent: SiteContent = {
  texts: {
    heroEyebrow: "Barranquito, Lima",
    heroTitle: "Surf en Lima, bien hecho y sin el caos de spots saturados",
    heroLead:
      "Somos Pacific Surf School. Clases claras, progreso real y buena vibra en Barranquito para gente que quiere aprender de verdad.",
    brandNote:
      "No vendemos una clase suelta. Disenamos una experiencia de progreso para que vuelvas al trabajo con energia, foco y la sensacion real de haber avanzado.",
    galleryEyebrow: "Galeria",
    galleryTitle: "La energia real de cada sesion, en imagenes",
    finalCtaTitle: "Reserva hoy y convierte el mar en tu mejor rutina de bienestar",
    finalCtaBody:
      "Escribenos por WhatsApp, recibe recomendacion en minutos y asegura tu horario en Barranquito.",
    finalCtaButton: "Reservar por WhatsApp ahora",
  },
  media: {
    heroYoutubeUrl: toYoutubeWatchUrl(process.env.NEXT_PUBLIC_HERO_VIDEO_ID || "7gWl1-k6QpE"),
    storyYoutubeUrl: toYoutubeWatchUrl(
      process.env.NEXT_PUBLIC_STORY_VIDEO_ID || process.env.NEXT_PUBLIC_HERO_VIDEO_ID || "7gWl1-k6QpE"
    ),
    instagramProfileUrl: "https://www.instagram.com/pacific_surfschool/",
    instagramLinks: splitCsv(process.env.NEXT_PUBLIC_INSTAGRAM_POST_URLS || ""),
    instagramVideoLinks: splitCsv(process.env.NEXT_PUBLIC_INSTAGRAM_VIDEO_LINKS || ""),
    youtubeGalleryLinks: splitCsv(process.env.NEXT_PUBLIC_GALLERY_YOUTUBE_LINKS || ""),
    galleryImages: defaultGalleryImages,
  },
};

const normalizeImages = (input: unknown): GalleryImage[] => {
  if (!Array.isArray(input)) return defaultGalleryImages;

  const normalized = input
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const src = String((item as { src?: unknown }).src || "").trim();
      const alt = String((item as { alt?: unknown }).alt || "").trim();
      if (!src) return null;
      return { src, alt: alt || "Media de Pacific Surf School" };
    })
    .filter((item): item is GalleryImage => item !== null);

  return normalized.length > 0 ? normalized : defaultGalleryImages;
};

export const mergeWithDefaultSiteContent = (input: unknown): SiteContent => {
  if (!input || typeof input !== "object") return defaultSiteContent;

  const raw = input as {
    texts?: Partial<EditableTextContent>;
    media?: Partial<EditableMediaContent>;
  };

  return {
    texts: {
      heroEyebrow: String(raw.texts?.heroEyebrow || defaultSiteContent.texts.heroEyebrow),
      heroTitle: String(raw.texts?.heroTitle || defaultSiteContent.texts.heroTitle),
      heroLead: String(raw.texts?.heroLead || defaultSiteContent.texts.heroLead),
      brandNote: String(raw.texts?.brandNote || defaultSiteContent.texts.brandNote),
      galleryEyebrow: String(raw.texts?.galleryEyebrow || defaultSiteContent.texts.galleryEyebrow),
      galleryTitle: String(raw.texts?.galleryTitle || defaultSiteContent.texts.galleryTitle),
      finalCtaTitle: String(raw.texts?.finalCtaTitle || defaultSiteContent.texts.finalCtaTitle),
      finalCtaBody: String(raw.texts?.finalCtaBody || defaultSiteContent.texts.finalCtaBody),
      finalCtaButton: String(raw.texts?.finalCtaButton || defaultSiteContent.texts.finalCtaButton),
    },
    media: {
      heroYoutubeUrl: String(raw.media?.heroYoutubeUrl || defaultSiteContent.media.heroYoutubeUrl),
      storyYoutubeUrl: String(raw.media?.storyYoutubeUrl || defaultSiteContent.media.storyYoutubeUrl),
      instagramProfileUrl: String(
        raw.media?.instagramProfileUrl || defaultSiteContent.media.instagramProfileUrl
      ),
      instagramLinks: Array.isArray(raw.media?.instagramLinks)
        ? raw.media?.instagramLinks.map((value) => String(value).trim()).filter(Boolean)
        : defaultSiteContent.media.instagramLinks,
      instagramVideoLinks: Array.isArray(raw.media?.instagramVideoLinks)
        ? raw.media?.instagramVideoLinks.map((value) => String(value).trim()).filter(Boolean)
        : defaultSiteContent.media.instagramVideoLinks,
      youtubeGalleryLinks: Array.isArray(raw.media?.youtubeGalleryLinks)
        ? raw.media?.youtubeGalleryLinks.map((value) => String(value).trim()).filter(Boolean)
        : defaultSiteContent.media.youtubeGalleryLinks,
      galleryImages: normalizeImages(raw.media?.galleryImages),
    },
  };
};
