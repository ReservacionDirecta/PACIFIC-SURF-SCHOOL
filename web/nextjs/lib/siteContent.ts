export type EditableTextContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroLead: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  brandNote: string;
  galleryEyebrow: string;
  galleryTitle: string;
  finalCtaTitle: string;
  finalCtaBody: string;
  finalCtaButton: string;
};

export type SeoContent = {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
};

export type Testimonial = {
  quote: string;
  author: string;
};

export type ComparisonRow = {
  factor: string;
  barranquito: string;
  crowded: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type PricingPackage = {
  classes: number;
  discount: number;
};

export type PricingContent = {
  groupRate: number;
  privateRate: number;
  packages: PricingPackage[];
};

export type GalleryImage = {
  src: string;
  alt: string;
};

export type BeachContent = {
  name: string;
  image: string;
  alt: string;
  main: boolean;
  description: string;
  level: string;
  bestWindow: string;
  googleMapsUrl: string;
  tips: string[];
};

export type EditableMediaContent = {
  heroYoutubeUrl: string;
  storyYoutubeUrl: string;
  instagramProfileUrl: string;
  instagramAutoFeedEnabled: boolean;
  instagramAutoFeedLimit: number;
  instagramLinks: string[];
  instagramVideoLinks: string[];
  youtubeGalleryLinks: string[];
  galleryImages: GalleryImage[];
};

export type SiteContent = {
  seo: SeoContent;
  texts: EditableTextContent;
  pricing: PricingContent;
  heroPoints: string[];
  testimonials: Testimonial[];
  comparisonRows: ComparisonRow[];
  faqItems: FaqItem[];
  beaches: BeachContent[];
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

const defaultBeaches: BeachContent[] = [
  {
    name: "Barranquito",
    image: "/media/session-a.svg",
    alt: "Olas en Barranquito para clase de surf",
    main: true,
    description:
      "Nuestro punto base en Lima por su entorno mas ordenado para aprendizaje, sesiones progresivas y experiencia premium para alumnos locales y corporativos.",
    level: "Inicial a intermedio",
    bestWindow: "Mananas con mar limpio y menor trafico",
    googleMapsUrl: "https://maps.google.com/?q=Playa+Barranquito+Lima",
    tips: [
      "Llega 20 minutos antes para revisar condiciones y estirar.",
      "Usa bloqueador resistente al agua y lycra manga larga.",
      "Ideal para construir tecnica base con sesiones progresivas.",
    ],
  },
  {
    name: "La Pampilla",
    image: "/media/session-b.svg",
    alt: "Vista de La Pampilla en la Costa Verde",
    main: false,
    description: "Spot de referencia en Miraflores con acceso rapido y olas consistentes segun temporada.",
    level: "Intermedio",
    bestWindow: "Temprano entre semana",
    googleMapsUrl: "https://maps.google.com/?q=Playa+La+Pampilla+Miraflores",
    tips: [
      "Prioriza control de remada y lectura de serie antes de entrar.",
      "Evita horas pico para mejorar seguridad y fluidez.",
      "Revisa corrientes laterales antes de cada bloque.",
    ],
  },
  {
    name: "Redondo",
    image: "/media/session-c.svg",
    alt: "Playa Redondo en Lima para sesiones de surf",
    main: false,
    description: "Zona con energia variable donde entrenamos adaptacion de postura y timing de take-off.",
    level: "Intermedio",
    bestWindow: "Mananas y tardes con viento suave",
    googleMapsUrl: "https://maps.google.com/?q=Playa+Redondo+Miraflores",
    tips: [
      "Manten distancia de seguridad al compartir pico.",
      "Practica salida controlada para conservar energia.",
      "Buena opcion para reforzar giros basicos.",
    ],
  },
  {
    name: "Punta Roquitas",
    image: "/media/session-a.svg",
    alt: "Zona de Punta Roquitas para practica de surf",
    main: false,
    description: "Punto tecnico para mejorar lineas y control de velocidad cuando el mar esta ordenado.",
    level: "Intermedio a avanzado",
    bestWindow: "Swell moderado y viento limpio",
    googleMapsUrl: "https://maps.google.com/?q=Punta+Roquitas+Lima",
    tips: [
      "Calienta hombros y zona lumbar antes de entrar.",
      "Define objetivo tecnico de la sesion en cada serie.",
      "Usa leash en buen estado por seguridad.",
    ],
  },
  {
    name: "Triangulo",
    image: "/media/session-b.svg",
    alt: "Spot Triangulo con olas en Costa Verde",
    main: false,
    description: "Escenario util para trabajar lectura de ola y transiciones en diferentes secciones.",
    level: "Intermedio",
    bestWindow: "Mareas medias con mar ordenado",
    googleMapsUrl: "https://maps.google.com/?q=Playa+Triangulo+Lima",
    tips: [
      "Observa 10 minutos las series antes de ingresar.",
      "Entra con plan de posicionamiento y punto de salida.",
      "Prioriza tecnica sobre volumen de olas tomadas.",
    ],
  },
  {
    name: "San Bartolo",
    image: "/media/session-c.svg",
    alt: "Mar en San Bartolo para clases avanzadas",
    main: false,
    description: "Destino ideal para sesiones avanzadas y progresion de maniobras en olas con mayor recorrido.",
    level: "Intermedio alto a avanzado",
    bestWindow: "Temporadas de mejor periodo de swell",
    googleMapsUrl: "https://maps.google.com/?q=Playa+San+Bartolo+Lima",
    tips: [
      "Planifica traslado con anticipacion para aprovechar ventana de mar.",
      "Lleva hidratacion y snack para sesiones largas.",
      "Recomendado para alumnos con base tecnica consolidada.",
    ],
  },
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
  seo: {
    title: "Escuela de Surf Premium en Barranquito | Paquetes 4 y 8 Clases | Pacific Surf School",
    description:
      "Mejora tu surf en Barranquito sin la saturacion de Makaha. Paquetes de 4 y 8 clases para ejecutivos en Lima. Reserva por WhatsApp y paga con Yape o Plin.",
    ogTitle: "Surf premium en Barranquito para ejecutivos de Lima | Pacific Surf School",
    ogDescription:
      "Paquetes de progresion 4 y 8 clases con reserva por WhatsApp y pago por Yape/Plin.",
  },
  texts: {
    heroEyebrow: "Barranquito, Lima",
    heroTitle: "Surf en Lima, bien hecho y sin el caos de spots saturados",
    heroLead:
      "Somos Pacific Surf School. Clases claras, progreso real y buena vibra en Barranquito para gente que quiere aprender de verdad.",
    heroPrimaryCta: "Quiero mi plan por WhatsApp",
    heroSecondaryCta: "Ver tarifas y paquetes",
    brandNote:
      "No vendemos una clase suelta. Disenamos una experiencia de progreso para que vuelvas al trabajo con energia, foco y la sensacion real de haber avanzado.",
    galleryEyebrow: "Galeria",
    galleryTitle: "La energia real de cada sesion, en imagenes",
    finalCtaTitle: "Reserva hoy y convierte el mar en tu mejor rutina de bienestar",
    finalCtaBody:
      "Escribenos por WhatsApp, recibe recomendacion en minutos y asegura tu horario en Barranquito.",
    finalCtaButton: "Reservar por WhatsApp ahora",
  },
  pricing: {
    groupRate: 110,
    privateRate: 150,
    packages: [
      { classes: 1, discount: 0 },
      { classes: 4, discount: 0.05 },
      { classes: 8, discount: 0.1 },
      { classes: 12, discount: 0.15 },
      { classes: 16, discount: 0.2 },
    ],
  },
  heroPoints: [
    "Horarios que si calzan con tu semana: 6:00, 8:00, 10:00 y 4:00",
    "Paquetes con descuento y coordinacion rapida por WhatsApp",
  ],
  testimonials: [
    {
      quote: "La coordinacion por WhatsApp me ahorro tiempo. En pocas sesiones ya senti progreso real.",
      author: "Profesional de tecnologia, 34",
    },
    {
      quote: "Buscaba desconectar sin caos en el agua. Barranquito fue justo lo que necesitaba.",
      author: "Consultora, 29",
    },
    {
      quote: "El plan de 8 clases me dio continuidad. No perdi ritmo entre semana y semana.",
      author: "Gerente comercial, 41",
    },
  ],
  comparisonRows: [
    {
      factor: "Flujo de sesion",
      barranquito: "Mas ordenado para practicar tecnica",
      crowded: "Mayor congestion en horas pico",
    },
    {
      factor: "Experiencia para ejecutivos",
      barranquito: "Ambiente premium y enfocado",
      crowded: "Mayor ruido y friccion",
    },
    {
      factor: "Continuidad",
      barranquito: "Mejor para rutas de 4 y 8 clases",
      crowded: "Mas interrupciones en sesion",
    },
  ],
  faqItems: [
    {
      question: "Nunca hice surf. Puedo empezar?",
      answer: "Si. El plan esta pensado para iniciar desde cero y progresar por etapas.",
    },
    {
      question: "Como pago y confirmo mi cupo?",
      answer: "Se coordina por WhatsApp y la confirmacion se realiza con pago por Yape o Plin.",
    },
    {
      question: "Cuanto tardan en responder?",
      answer: "Objetivo operativo: menos de 10 minutos en horario de atencion.",
    },
  ],
  beaches: defaultBeaches,
  media: {
    heroYoutubeUrl: toYoutubeWatchUrl(process.env.NEXT_PUBLIC_HERO_VIDEO_ID || "7gWl1-k6QpE"),
    storyYoutubeUrl: toYoutubeWatchUrl(
      process.env.NEXT_PUBLIC_STORY_VIDEO_ID || process.env.NEXT_PUBLIC_HERO_VIDEO_ID || "7gWl1-k6QpE"
    ),
    instagramProfileUrl: "https://www.instagram.com/pacific_surfschool/",
    instagramAutoFeedEnabled: false,
    instagramAutoFeedLimit: 6,
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

const normalizePricingPackages = (input: unknown): PricingPackage[] => {
  if (!Array.isArray(input)) return defaultSiteContent.pricing.packages;

  const normalized = input
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const classes = Number((item as { classes?: unknown }).classes);
      const discount = Number((item as { discount?: unknown }).discount);
      if (!Number.isFinite(classes) || classes < 1) return null;
      if (!Number.isFinite(discount) || discount < 0 || discount >= 1) return null;
      return { classes: Math.round(classes), discount };
    })
    .filter((item): item is PricingPackage => item !== null)
    .sort((left, right) => left.classes - right.classes);

  return normalized.length > 0 ? normalized : defaultSiteContent.pricing.packages;
};

const normalizeBeaches = (input: unknown): BeachContent[] => {
  if (!Array.isArray(input)) return defaultBeaches;

  const normalized = input
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const name = String((item as { name?: unknown }).name || "").trim();
      const image = String((item as { image?: unknown }).image || "").trim();
      const alt = String((item as { alt?: unknown }).alt || "").trim();
      const description = String((item as { description?: unknown }).description || "").trim();
      const level = String((item as { level?: unknown }).level || "").trim();
      const bestWindow = String((item as { bestWindow?: unknown }).bestWindow || "").trim();
      const googleMapsUrl = String((item as { googleMapsUrl?: unknown }).googleMapsUrl || "").trim();
      const tipsInput = (item as { tips?: unknown }).tips;
      const tips = Array.isArray(tipsInput)
        ? tipsInput.map((tip) => String(tip).trim()).filter(Boolean)
        : [];
      const main = Boolean((item as { main?: unknown }).main);

      if (!name || !image || !description) return null;

      return {
        name,
        image,
        alt: alt || `Playa ${name} en Lima para clases de surf`,
        main,
        description,
        level: level || "Intermedio",
        bestWindow: bestWindow || "Ventana por confirmar",
        googleMapsUrl,
        tips: tips.length > 0 ? tips : ["Tip pendiente de configuracion en CMS."],
      };
    })
    .filter((item): item is BeachContent => item !== null);

  return normalized.length > 0 ? normalized : defaultBeaches;
};

export const mergeWithDefaultSiteContent = (input: unknown): SiteContent => {
  if (!input || typeof input !== "object") return defaultSiteContent;

  const raw = input as {
    seo?: Partial<SeoContent>;
    texts?: Partial<EditableTextContent>;
    pricing?: Partial<PricingContent>;
    heroPoints?: unknown;
    testimonials?: unknown;
    comparisonRows?: unknown;
    faqItems?: unknown;
    beaches?: unknown;
    media?: Partial<EditableMediaContent>;
  };

  const heroPoints = Array.isArray(raw.heroPoints)
    ? raw.heroPoints.map((value) => String(value).trim()).filter(Boolean)
    : defaultSiteContent.heroPoints;

  const testimonials = Array.isArray(raw.testimonials)
    ? raw.testimonials
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const quote = String((item as { quote?: unknown }).quote || "").trim();
          const author = String((item as { author?: unknown }).author || "").trim();
          if (!quote || !author) return null;
          return { quote, author };
        })
        .filter((item): item is Testimonial => item !== null)
    : defaultSiteContent.testimonials;

  const comparisonRows = Array.isArray(raw.comparisonRows)
    ? raw.comparisonRows
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const factor = String((item as { factor?: unknown }).factor || "").trim();
          const barranquito = String((item as { barranquito?: unknown }).barranquito || "").trim();
          const crowded = String((item as { crowded?: unknown }).crowded || "").trim();
          if (!factor || !barranquito || !crowded) return null;
          return { factor, barranquito, crowded };
        })
        .filter((item): item is ComparisonRow => item !== null)
    : defaultSiteContent.comparisonRows;

  const faqItems = Array.isArray(raw.faqItems)
    ? raw.faqItems
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const question = String((item as { question?: unknown }).question || "").trim();
          const answer = String((item as { answer?: unknown }).answer || "").trim();
          if (!question || !answer) return null;
          return { question, answer };
        })
        .filter((item): item is FaqItem => item !== null)
    : defaultSiteContent.faqItems;

  return {
    seo: {
      title: String(raw.seo?.title || defaultSiteContent.seo.title),
      description: String(raw.seo?.description || defaultSiteContent.seo.description),
      ogTitle: String(raw.seo?.ogTitle || defaultSiteContent.seo.ogTitle),
      ogDescription: String(raw.seo?.ogDescription || defaultSiteContent.seo.ogDescription),
    },
    texts: {
      heroEyebrow: String(raw.texts?.heroEyebrow || defaultSiteContent.texts.heroEyebrow),
      heroTitle: String(raw.texts?.heroTitle || defaultSiteContent.texts.heroTitle),
      heroLead: String(raw.texts?.heroLead || defaultSiteContent.texts.heroLead),
      heroPrimaryCta: String(raw.texts?.heroPrimaryCta || defaultSiteContent.texts.heroPrimaryCta),
      heroSecondaryCta: String(
        raw.texts?.heroSecondaryCta || defaultSiteContent.texts.heroSecondaryCta
      ),
      brandNote: String(raw.texts?.brandNote || defaultSiteContent.texts.brandNote),
      galleryEyebrow: String(raw.texts?.galleryEyebrow || defaultSiteContent.texts.galleryEyebrow),
      galleryTitle: String(raw.texts?.galleryTitle || defaultSiteContent.texts.galleryTitle),
      finalCtaTitle: String(raw.texts?.finalCtaTitle || defaultSiteContent.texts.finalCtaTitle),
      finalCtaBody: String(raw.texts?.finalCtaBody || defaultSiteContent.texts.finalCtaBody),
      finalCtaButton: String(raw.texts?.finalCtaButton || defaultSiteContent.texts.finalCtaButton),
    },
    pricing: {
      groupRate:
        Number.isFinite(Number(raw.pricing?.groupRate)) && Number(raw.pricing?.groupRate) > 0
          ? Number(raw.pricing?.groupRate)
          : defaultSiteContent.pricing.groupRate,
      privateRate:
        Number.isFinite(Number(raw.pricing?.privateRate)) && Number(raw.pricing?.privateRate) > 0
          ? Number(raw.pricing?.privateRate)
          : defaultSiteContent.pricing.privateRate,
      packages: normalizePricingPackages(raw.pricing?.packages),
    },
    heroPoints: heroPoints.length > 0 ? heroPoints : defaultSiteContent.heroPoints,
    testimonials: testimonials.length > 0 ? testimonials : defaultSiteContent.testimonials,
    comparisonRows: comparisonRows.length > 0 ? comparisonRows : defaultSiteContent.comparisonRows,
    faqItems: faqItems.length > 0 ? faqItems : defaultSiteContent.faqItems,
    beaches: normalizeBeaches(raw.beaches),
    media: {
      heroYoutubeUrl: String(raw.media?.heroYoutubeUrl || defaultSiteContent.media.heroYoutubeUrl),
      storyYoutubeUrl: String(raw.media?.storyYoutubeUrl || defaultSiteContent.media.storyYoutubeUrl),
      instagramProfileUrl: String(
        raw.media?.instagramProfileUrl || defaultSiteContent.media.instagramProfileUrl
      ),
      instagramAutoFeedEnabled:
        typeof raw.media?.instagramAutoFeedEnabled === "boolean"
          ? raw.media.instagramAutoFeedEnabled
          : defaultSiteContent.media.instagramAutoFeedEnabled,
      instagramAutoFeedLimit:
        Number.isFinite(Number(raw.media?.instagramAutoFeedLimit)) && Number(raw.media?.instagramAutoFeedLimit) >= 1
          ? Math.min(12, Math.max(1, Math.round(Number(raw.media?.instagramAutoFeedLimit))))
          : defaultSiteContent.media.instagramAutoFeedLimit,
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
