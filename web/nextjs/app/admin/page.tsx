"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultSiteContent, type SiteContent } from "../../lib/siteContent";

type NoticeState = "idle" | "saved" | "reset" | "error";
type MediaOrientation = "landscape" | "portrait" | "square";
type StoredMediaFile = {
  name: string;
  url: string;
  mimeType: string;
  size: number;
  modifiedAt: string;
};

const toLines = (items: string[]): string => items.join("\n");

const toTestimonialLines = (items: SiteContent["testimonials"]): string =>
  items.map((item) => `${item.quote} | ${item.author}`).join("\n");

const toComparisonLines = (items: SiteContent["comparisonRows"]): string =>
  items.map((item) => `${item.factor} | ${item.barranquito} | ${item.crowded}`).join("\n");

const toFaqLines = (items: SiteContent["faqItems"]): string =>
  items.map((item) => `${item.question} | ${item.answer}`).join("\n");

const toImageLines = (items: SiteContent["media"]["galleryImages"]): string =>
  items.map((item) => `${item.src} | ${item.alt}`).join("\n");

const toPricingLines = (items: SiteContent["pricing"]["packages"]): string =>
  items.map((item) => `${item.classes} | ${item.discount}`).join("\n");

const parseLines = (value: string): string[] =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const parseImageLines = (value: string): SiteContent["media"]["galleryImages"] => {
  const parsed = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [srcPart, altPart] = line.split("|");
      const src = (srcPart || "").trim();
      const alt = (altPart || "Media de Pacific Surf School").trim();
      if (!src) return null;
      return { src, alt };
    })
    .filter((item): item is { src: string; alt: string } => item !== null);

  return parsed.length > 0 ? parsed : defaultSiteContent.media.galleryImages;
};

const parseTestimonialLines = (value: string): SiteContent["testimonials"] => {
  const parsed = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [quotePart, authorPart] = line.split("|");
      const quote = (quotePart || "").trim();
      const author = (authorPart || "").trim();
      if (!quote || !author) return null;
      return { quote, author };
    })
    .filter((item): item is SiteContent["testimonials"][number] => item !== null);

  return parsed.length > 0 ? parsed : defaultSiteContent.testimonials;
};

const parseComparisonLines = (value: string): SiteContent["comparisonRows"] => {
  const parsed = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [factorPart, barranquitoPart, crowdedPart] = line.split("|");
      const factor = (factorPart || "").trim();
      const barranquito = (barranquitoPart || "").trim();
      const crowded = (crowdedPart || "").trim();
      if (!factor || !barranquito || !crowded) return null;
      return { factor, barranquito, crowded };
    })
    .filter((item): item is SiteContent["comparisonRows"][number] => item !== null);

  return parsed.length > 0 ? parsed : defaultSiteContent.comparisonRows;
};

const parseFaqLines = (value: string): SiteContent["faqItems"] => {
  const parsed = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [questionPart, answerPart] = line.split("|");
      const question = (questionPart || "").trim();
      const answer = (answerPart || "").trim();
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((item): item is SiteContent["faqItems"][number] => item !== null);

  return parsed.length > 0 ? parsed : defaultSiteContent.faqItems;
};

const parsePricingLines = (value: string): SiteContent["pricing"]["packages"] => {
  const parsed = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [classesPart, discountPart] = line.split("|");
      const classes = Number.parseInt((classesPart || "").trim(), 10);
      const discount = Number.parseFloat((discountPart || "").trim());

      if (!Number.isFinite(classes) || classes < 1) return null;
      if (!Number.isFinite(discount) || discount < 0 || discount >= 1) return null;

      return {
        classes: Math.round(classes),
        discount,
      };
    })
    .filter((item): item is SiteContent["pricing"]["packages"][number] => item !== null)
    .sort((left, right) => left.classes - right.classes);

  return parsed.length > 0 ? parsed : defaultSiteContent.pricing.packages;
};

const normalizeBeachDrafts = (items: SiteContent["beaches"]): SiteContent["beaches"] => {
  const cleaned = items
    .map((item) => ({
      name: item.name.trim(),
      main: Boolean(item.main),
      image: item.image.trim(),
      alt: item.alt.trim() || `Playa ${item.name.trim()} para clases de surf`,
      level: item.level.trim() || "Intermedio",
      bestWindow: item.bestWindow.trim() || "Ventana por confirmar",
      googleMapsUrl: item.googleMapsUrl.trim(),
      description: item.description.trim(),
      tips: item.tips.map((tip) => tip.trim()).filter(Boolean),
    }))
    .filter((item) => item.name && item.image && item.description)
    .map((item) => ({
      ...item,
      tips: item.tips.length > 0 ? item.tips : ["Tip pendiente de configuracion."],
    }));

  if (cleaned.length === 0) return defaultSiteContent.beaches;
  if (!cleaned.some((item) => item.main)) {
    cleaned[0] = { ...cleaned[0], main: true };
  }

  return cleaned;
};

const createEmptyBeach = (): SiteContent["beaches"][number] => ({
  name: "",
  main: false,
  image: "/media/session-a.svg",
  alt: "",
  level: "Intermedio",
  bestWindow: "",
  googleMapsUrl: "",
  description: "",
  tips: [""],
});

function MediaPreview({ file }: { file: StoredMediaFile }) {
  const [orientation, setOrientation] = useState<MediaOrientation>("landscape");

  const updateOrientation = (width: number, height: number) => {
    if (!width || !height) return;
    if (Math.abs(width - height) < 8) {
      setOrientation("square");
      return;
    }

    setOrientation(width > height ? "landscape" : "portrait");
  };

  if (file.mimeType.startsWith("video/")) {
    return (
      <div className={`admin-library-preview admin-library-preview-${orientation}`}>
        <video
          src={file.url}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          onLoadedMetadata={(event) =>
            updateOrientation(event.currentTarget.videoWidth, event.currentTarget.videoHeight)
          }
        />
      </div>
    );
  }

  if (file.mimeType.startsWith("image/")) {
    return (
      <div className={`admin-library-preview admin-library-preview-${orientation}`}>
        <img
          src={file.url}
          alt={file.name}
          loading="lazy"
          onLoad={(event) =>
            updateOrientation(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)
          }
        />
      </div>
    );
  }

  return (
    <div className={`admin-library-preview admin-library-preview-${orientation}`}>
      <div className="admin-library-placeholder">Archivo</div>
    </div>
  );
}

export default function AdminPage() {
  const initial = useMemo(() => defaultSiteContent, []);
  const [content, setContent] = useState<SiteContent>(initial);
  const [adminToken, setAdminToken] = useState<string>("");
  const [mediaLibrary, setMediaLibrary] = useState<StoredMediaFile[]>([]);
  const [activeSection, setActiveSection] = useState<string>("seo");
  const [heroPointsLines, setHeroPointsLines] = useState<string>(toLines(initial.heroPoints));
  const [testimonialLines, setTestimonialLines] = useState<string>(toTestimonialLines(initial.testimonials));
  const [comparisonLines, setComparisonLines] = useState<string>(toComparisonLines(initial.comparisonRows));
  const [faqLines, setFaqLines] = useState<string>(toFaqLines(initial.faqItems));
  const [instagramLines, setInstagramLines] = useState<string>(toLines(initial.media.instagramLinks));
  const [instagramVideoLines, setInstagramVideoLines] = useState<string>(
    toLines(initial.media.instagramVideoLinks)
  );
  const [youtubeGalleryLines, setYoutubeGalleryLines] = useState<string>(
    toLines(initial.media.youtubeGalleryLinks)
  );
  const [imageLines, setImageLines] = useState<string>(toImageLines(initial.media.galleryImages));
  const [pricingLines, setPricingLines] = useState<string>(toPricingLines(initial.pricing.packages));
  const [beachesDraft, setBeachesDraft] = useState<SiteContent["beaches"]>(initial.beaches);
  const [notice, setNotice] = useState<NoticeState>("idle");
  const [noticeMessage, setNoticeMessage] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const syncFromDefault = (source: SiteContent) => {
    setContent(source);
    setHeroPointsLines(toLines(source.heroPoints));
    setTestimonialLines(toTestimonialLines(source.testimonials));
    setComparisonLines(toComparisonLines(source.comparisonRows));
    setFaqLines(toFaqLines(source.faqItems));
    setInstagramLines(toLines(source.media.instagramLinks));
    setInstagramVideoLines(toLines(source.media.instagramVideoLinks));
    setYoutubeGalleryLines(toLines(source.media.youtubeGalleryLinks));
    setImageLines(toImageLines(source.media.galleryImages));
    setPricingLines(toPricingLines(source.pricing.packages));
    setBeachesDraft(source.beaches);
  };

  const updateBeach = (index: number, updater: (beach: SiteContent["beaches"][number]) => SiteContent["beaches"][number]) => {
    setBeachesDraft((current) =>
      current.map((beach, beachIndex) => (beachIndex === index ? updater(beach) : beach))
    );
  };

  const setMainBeach = (index: number) => {
    setBeachesDraft((current) =>
      current.map((beach, beachIndex) => ({
        ...beach,
        main: beachIndex === index,
      }))
    );
  };

  const moveBeach = (index: number, direction: -1 | 1) => {
    setBeachesDraft((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const removeBeach = (index: number) => {
    setBeachesDraft((current) => {
      const filtered = current.filter((_, beachIndex) => beachIndex !== index);
      if (filtered.length === 0) return [createEmptyBeach()];
      if (!filtered.some((beach) => beach.main)) {
        filtered[0] = { ...filtered[0], main: true };
      }
      return filtered;
    });
  };

  const setSavedNotice = (message: string) => {
    setNotice("saved");
    setNoticeMessage(message);
  };

  const setErrorNotice = (message: string) => {
    setNotice("error");
    setNoticeMessage(message);
  };

  const fetchMediaLibrary = async (token?: string) => {
    try {
      const response = await fetch("/api/media", {
        cache: "no-store",
        headers: token?.trim() ? { authorization: `Bearer ${token.trim()}` } : undefined,
      });
      if (!response.ok) return;
      const payload = (await response.json()) as { files?: StoredMediaFile[] };
      setMediaLibrary(payload.files || []);
    } catch {
      // Ignore library refresh failures in UI init.
    }
  };

  const appendUniqueLine = (current: string, value: string): string => {
    const items = parseLines(current);
    if (items.includes(value)) return current;
    return [...items, value].join("\n");
  };

  const appendUniqueImageLine = (current: string, value: string, alt: string): string => {
    const entry = `${value} | ${alt}`;
    const items = current
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (items.includes(entry)) return current;
    return [...items, entry].join("\n");
  };

  const useFileInHero = (file: StoredMediaFile) => {
    if (!file.mimeType.startsWith("video/")) {
      setErrorNotice("El hero de fondo debe usar un archivo de video.");
      return;
    }

    setContent((current) => ({
      ...current,
      media: { ...current.media, heroYoutubeUrl: file.url },
    }));
    setSavedNotice(`Hero asignado a ${file.name}. Guarda cambios para persistir.`);
  };

  const useFileInStory = (file: StoredMediaFile) => {
    if (!file.mimeType.startsWith("video/") && !file.mimeType.startsWith("image/")) {
      setErrorNotice("La seccion experiencia acepta video o imagen.");
      return;
    }

    setContent((current) => ({
      ...current,
      media: { ...current.media, storyYoutubeUrl: file.url },
    }));
    setSavedNotice(`Seccion experiencia asignada a ${file.name}. Guarda cambios para persistir.`);
  };

  const addFileToGallery = (file: StoredMediaFile) => {
    if (file.mimeType.startsWith("video/")) {
      setInstagramVideoLines((current) => appendUniqueLine(current, file.url));
      setSavedNotice(`Video ${file.name} agregado a galeria interna. Guarda cambios para persistir.`);
      return;
    }

    if (file.mimeType.startsWith("image/")) {
      setImageLines((current) => appendUniqueImageLine(current, file.url, file.name));
      setSavedNotice(`Imagen ${file.name} agregada a galeria. Guarda cambios para persistir.`);
      return;
    }

    setErrorNotice("Solo imagenes y videos pueden agregarse a la galeria.");
  };

  const deleteFile = async (file: StoredMediaFile) => {
    try {
      const response = await fetch(`/api/media?name=${encodeURIComponent(file.name)}`, {
        method: "DELETE",
        headers: adminToken.trim() ? { authorization: `Bearer ${adminToken.trim()}` } : undefined,
      });

      if (!response.ok) {
        setErrorNotice(response.status === 401 ? "Token invalido para eliminar archivos." : "No se pudo eliminar el archivo.");
        return;
      }

      await fetchMediaLibrary(adminToken);
      setSavedNotice(`Archivo ${file.name} eliminado de la biblioteca.`);
    } catch {
      setErrorNotice("Error de red eliminando archivo.");
    }
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/media", {
          method: "POST",
          headers: adminToken.trim() ? { authorization: `Bearer ${adminToken.trim()}` } : undefined,
          body: formData,
        });

        if (!response.ok) {
          setErrorNotice(response.status === 401 ? "Token invalido para subir archivos." : `No se pudo subir ${file.name}.`);
          return;
        }
      }

      await fetchMediaLibrary(adminToken);
      setSavedNotice("Archivos subidos a la biblioteca interna.");
    } catch {
      setErrorNotice("Error de red subiendo archivos.");
    } finally {
      setIsUploading(false);
    }
  };

  const publicationChecks = useMemo(() => {
    const heroPoints = parseLines(heroPointsLines);
    const testimonials = parseTestimonialLines(testimonialLines);
    const comparisonRows = parseComparisonLines(comparisonLines);
    const faqItems = parseFaqLines(faqLines);
    const pricingPackages = parsePricingLines(pricingLines);
    const beaches = normalizeBeachDrafts(beachesDraft);
    const galleryVideos = parseLines(instagramVideoLines).length + parseLines(youtubeGalleryLines).length;
    const galleryImages = parseImageLines(imageLines).length;

    return [
      {
        label: "SEO title y description definidos",
        ok: Boolean(content.seo.title.trim() && content.seo.description.trim()),
      },
      {
        label: "Hero con titulo, descripcion y CTA primario",
        ok: Boolean(
          content.texts.heroTitle.trim() &&
            content.texts.heroLead.trim() &&
            content.texts.heroPrimaryCta.trim()
        ),
      },
      {
        label: "Hero media configurado",
        ok: Boolean(content.media.heroYoutubeUrl.trim()),
      },
      {
        label: "Minimo 2 bullets de valor en hero",
        ok: heroPoints.length >= 2,
      },
      {
        label: "Minimo 3 testimonios",
        ok: testimonials.length >= 3,
      },
      {
        label: "Minimo 3 filas en comparativo",
        ok: comparisonRows.length >= 3,
      },
      {
        label: "Minimo 3 FAQs",
        ok: faqItems.length >= 3,
      },
      {
        label: "Tarifas base configuradas",
        ok: content.pricing.groupRate > 0 && content.pricing.privateRate > 0,
      },
      {
        label: "Paquetes validos para calculo",
        ok: pricingPackages.some((plan) => plan.classes >= 4) && pricingPackages.length >= 2,
      },
      {
        label: "Playas con detalle para modal",
        ok: beaches.length >= 3 && beaches.some((beach) => beach.main),
      },
      {
        label: "Playas con link de Google Maps",
        ok: beaches.every((beach) => beach.googleMapsUrl.trim().length > 0),
      },
      {
        label: "Galeria con al menos 4 medios",
        ok: galleryVideos + galleryImages >= 4,
      },
    ];
  }, [
    comparisonLines,
    content.media.heroYoutubeUrl,
    content.pricing.groupRate,
    content.pricing.privateRate,
    content.seo.description,
    content.seo.title,
    content.texts.heroLead,
    content.texts.heroPrimaryCta,
    content.texts.heroTitle,
    faqLines,
    heroPointsLines,
    imageLines,
    instagramVideoLines,
    beachesDraft,
    pricingLines,
    testimonialLines,
    youtubeGalleryLines,
  ]);

  useEffect(() => {
    let isMounted = true;

    const loadFromApi = async () => {
      try {
        const response = await fetch("/api/site-content", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { content?: SiteContent };
        if (payload.content && isMounted) syncFromDefault(payload.content);
        await fetchMediaLibrary();
      } catch {
        // Keep defaults.
      }
    };

    loadFromApi();
    return () => {
      isMounted = false;
    };
  }, []);

  const saveChanges = async () => {
    const normalized: SiteContent = {
      seo: { ...content.seo },
      texts: { ...content.texts },
      heroPoints: parseLines(heroPointsLines),
      testimonials: parseTestimonialLines(testimonialLines),
      comparisonRows: parseComparisonLines(comparisonLines),
      faqItems: parseFaqLines(faqLines),
      beaches: normalizeBeachDrafts(beachesDraft),
      pricing: {
        groupRate: Number.isFinite(content.pricing.groupRate)
          ? Math.max(1, Math.round(content.pricing.groupRate))
          : defaultSiteContent.pricing.groupRate,
        privateRate: Number.isFinite(content.pricing.privateRate)
          ? Math.max(1, Math.round(content.pricing.privateRate))
          : defaultSiteContent.pricing.privateRate,
        packages: parsePricingLines(pricingLines),
      },
      media: {
        ...content.media,
        instagramLinks: parseLines(instagramLines),
        instagramVideoLinks: parseLines(instagramVideoLines),
        youtubeGalleryLinks: parseLines(youtubeGalleryLines),
        galleryImages: parseImageLines(imageLines),
      },
    };

    setIsSaving(true);
    try {
      const response = await fetch("/api/site-content", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          ...(adminToken.trim() ? { authorization: `Bearer ${adminToken.trim()}` } : {}),
        },
        body: JSON.stringify({ content: normalized }),
      });

      if (!response.ok) {
        setNotice("error");
        setNoticeMessage(response.status === 401 ? "Token invalido para guardar." : "No se pudo guardar.");
        return;
      }

      const payload = (await response.json()) as { content?: SiteContent };
      if (payload.content) {
        syncFromDefault(payload.content);
      }
      setNotice("saved");
      setNoticeMessage("Cambios guardados en servidor.");
    } catch {
      setNotice("error");
      setNoticeMessage("Error de red guardando cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/site-content", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          ...(adminToken.trim() ? { authorization: `Bearer ${adminToken.trim()}` } : {}),
        },
        body: JSON.stringify({ content: defaultSiteContent }),
      });

      if (!response.ok) {
        setNotice("error");
        setNoticeMessage(response.status === 401 ? "Token invalido para restaurar." : "No se pudo restaurar.");
        return;
      }

      syncFromDefault(defaultSiteContent);
      setNotice("reset");
      setNoticeMessage("Configuracion reiniciada y guardada en servidor.");
    } catch {
      setNotice("error");
      setNoticeMessage("Error de red restaurando configuracion.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1 className="admin-title">CMS Pacific Surf</h1>
            <p className="admin-subtitle">Administra contenido, medios y configuración</p>
          </div>
          <a className="btn btn-secondary" href="/" target="_blank" rel="noopener noreferrer">
            Ver landing →
          </a>
        </div>
      </header>

      <div className="admin-container">
        {/* Sidebar Navigation */}
        <nav className="admin-sidebar">
          <div className="admin-sidebar-content">
            <div className="admin-token-section">
              <label className="admin-token-label">
                Token admin:
                <input
                  type="password"
                  value={adminToken}
                  onChange={(event) => setAdminToken(event.target.value)}
                  placeholder="CMS_ADMIN_TOKEN"
                  className="admin-token-input"
                />
              </label>
            </div>

            <ul className="admin-nav-list">
              <li>
                <button
                  type="button"
                  className={`admin-nav-button${activeSection === "checklist" ? " is-active" : ""}`}
                  onClick={() => setActiveSection("checklist")}
                >
                  ✓ Checklist
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`admin-nav-button${activeSection === "seo" ? " is-active" : ""}`}
                  onClick={() => setActiveSection("seo")}
                >
                  🔍 SEO
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`admin-nav-button${activeSection === "textos" ? " is-active" : ""}`}
                  onClick={() => setActiveSection("textos")}
                >
                  ✏️ Textos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`admin-nav-button${activeSection === "bloques" ? " is-active" : ""}`}
                  onClick={() => setActiveSection("bloques")}
                >
                  📦 Bloques
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`admin-nav-button${activeSection === "precios" ? " is-active" : ""}`}
                  onClick={() => setActiveSection("precios")}
                >
                  💰 Precios
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`admin-nav-button${activeSection === "playas" ? " is-active" : ""}`}
                  onClick={() => setActiveSection("playas")}
                >
                  🏄 Playas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`admin-nav-button${activeSection === "media" ? " is-active" : ""}`}
                  onClick={() => setActiveSection("media")}
                >
                  🎬 Videos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`admin-nav-button${activeSection === "galeria" ? " is-active" : ""}`}
                  onClick={() => setActiveSection("galeria")}
                >
                  🖼️ Galería
                </button>
              </li>
            </ul>

            <div className="admin-sidebar-footer">
              <button className="btn btn-primary" type="button" onClick={saveChanges} disabled={isSaving}>
                {isSaving ? "Guardando..." : "💾 Guardar"}
              </button>
              <button className="btn btn-secondary" type="button" onClick={resetToDefault} disabled={isSaving}>
                ↻ Restaurar
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="admin-content">
          {/* Checklist Section */}
          {activeSection === "checklist" && (
            <section className="admin-panel">
              <h2>Verificación de publicación</h2>
              <p className="admin-panel-desc">Revisa que todos los elementos estén configurados correctamente antes de publicar.</p>
              <div className="admin-checklist">
                {publicationChecks.map((check) => (
                  <div key={check.label} className={`admin-check-item${check.ok ? " is-ok" : " is-warning"}`}>
                    <strong>{check.ok ? "✓" : "⚠"}</strong>
                    <span>{check.label}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SEO Section */}
          {activeSection === "seo" && (
            <section className="admin-panel">
              <h2>SEO y Metadatos</h2>
              <p className="admin-panel-desc">Configura cómo aparece el sitio en buscadores y redes sociales.</p>
              <div className="booking-form-grid">
                <label>
                  Título (Title tag)
                  <input
                    type="text"
                    value={content.seo.title}
                    onChange={(event) =>
                      setContent((current) => ({ ...current, seo: { ...current.seo, title: event.target.value } }))
                    }
                  />
                </label>
                <label>
                  Descripción (Meta description)
                  <textarea
                    rows={3}
                    value={content.seo.description}
                    onChange={(event) =>
                      setContent((current) => ({
                        ...current,
                        seo: { ...current.seo, description: event.target.value },
                      }))
                    }
                  />
                </label>
                <label>
                  Título para redes sociales
                  <input
                    type="text"
                    value={content.seo.ogTitle}
                    onChange={(event) =>
                      setContent((current) => ({ ...current, seo: { ...current.seo, ogTitle: event.target.value } }))
                    }
                  />
                </label>
                <label>
                  Descripción para redes sociales
                  <textarea
                    rows={3}
                    value={content.seo.ogDescription}
                    onChange={(event) =>
                      setContent((current) => ({
                        ...current,
                        seo: { ...current.seo, ogDescription: event.target.value },
                      }))
                    }
                  />
                </label>
              </div>
            </section>
          )}

          {/* Textos Section */}
          {activeSection === "textos" && (
            <section className="admin-panel">
              <h2>Copys y CTAs</h2>
              <p className="admin-panel-desc">Edita los textos principales de cada sección de la landing.</p>
              <div className="booking-form-grid">
                <label>
                  Hero eyebrow
                  <input
                    type="text"
                    value={content.texts.heroEyebrow}
                    onChange={(event) =>
                      setContent((current) => ({
                        ...current,
                        texts: { ...current.texts, heroEyebrow: event.target.value },
                      }))
                    }
                  />
                </label>
                <label>
                  Hero título
                  <input
                    type="text"
                    value={content.texts.heroTitle}
                    onChange={(event) =>
                      setContent((current) => ({
                        ...current,
                        texts: { ...current.texts, heroTitle: event.target.value },
                      }))
                    }
                  />
                </label>
                <label>
                  Hero descripción
                  <textarea
                    rows={3}
                    value={content.texts.heroLead}
                    onChange={(event) =>
                      setContent((current) => ({
                        ...current,
                        texts: { ...current.texts, heroLead: event.target.value },
                      }))
                    }
                  />
                </label>
                <label>
                  CTA primario
                  <input
                    type="text"
                    value={content.texts.heroPrimaryCta}
                    onChange={(event) =>
                      setContent((current) => ({
                        ...current,
                        texts: { ...current.texts, heroPrimaryCta: event.target.value },
                      }))
                    }
                  />
                </label>
                <label>
                  CTA secundario
                  <input
                    type="text"
                    value={content.texts.heroSecondaryCta}
                    onChange={(event) =>
                      setContent((current) => ({
                        ...current,
                        texts: { ...current.texts, heroSecondaryCta: event.target.value },
                      }))
                    }
                  />
                </label>
                <label>
                  Nota de marca
                  <textarea
                    rows={3}
                    value={content.texts.brandNote}
                    onChange={(event) =>
                      setContent((current) => ({
                        ...current,
                        texts: { ...current.texts, brandNote: event.target.value },
                      }))
                    }
                  />
                </label>
                <label>
                  Galería eyebrow
                  <input
                    type="text"
                    value={content.texts.galleryEyebrow}
                    onChange={(event) =>
                      setContent((current) => ({
                        ...current,
                        texts: { ...current.texts, galleryEyebrow: event.target.value },
                      }))
                    }
                  />
                </label>
                <label>
                  Galería título
                  <input
                    type="text"
                    value={content.texts.galleryTitle}
                    onChange={(event) =>
                      setContent((current) => ({
                        ...current,
                        texts: { ...current.texts, galleryTitle: event.target.value },
                      }))
                    }
                  />
                </label>
                <label>
                  CTA final título
                  <input
                    type="text"
                    value={content.texts.finalCtaTitle}
                    onChange={(event) =>
                      setContent((current) => ({
                        ...current,
                        texts: { ...current.texts, finalCtaTitle: event.target.value },
                      }))
                    }
                  />
                </label>
                <label>
                  CTA final descripción
                  <textarea
                    rows={3}
                    value={content.texts.finalCtaBody}
                    onChange={(event) =>
                      setContent((current) => ({
                        ...current,
                        texts: { ...current.texts, finalCtaBody: event.target.value },
                      }))
                    }
                  />
                </label>
                <label>
                  CTA final botón
                  <input
                    type="text"
                    value={content.texts.finalCtaButton}
                    onChange={(event) =>
                      setContent((current) => ({
                        ...current,
                        texts: { ...current.texts, finalCtaButton: event.target.value },
                      }))
                    }
                  />
                </label>
              </div>
            </section>
          )}

          {/* Bloques Section */}
          {activeSection === "bloques" && (
            <section className="admin-panel">
              <h2>Bloques de conversión</h2>
              <p className="admin-panel-desc">Gestiona testimonios, comparativos, preguntas frecuentes y bullets del hero.</p>
              <div className="booking-form-grid">
                <label>
                  Hero bullets (1 por línea)
                  <textarea rows={4} value={heroPointsLines} onChange={(event) => setHeroPointsLines(event.target.value)} />
                </label>
                <label>
                  Testimonios (formato: "cita | autor")
                  <textarea rows={6} value={testimonialLines} onChange={(event) => setTestimonialLines(event.target.value)} />
                </label>
                <label>
                  Comparativo (formato: "factor | Barranquito | Competencia")
                  <textarea rows={6} value={comparisonLines} onChange={(event) => setComparisonLines(event.target.value)} />
                </label>
                <label>
                  FAQs (formato: "pregunta | respuesta")
                  <textarea rows={6} value={faqLines} onChange={(event) => setFaqLines(event.target.value)} />
                </label>
              </div>
            </section>
          )}

          {/* Precios Section */}
          {activeSection === "precios" && (
            <section className="admin-panel">
              <h2>Precios y paquetes</h2>
              <p className="admin-panel-desc">Configura tarifas y paquetes que alimentan el cotizador de la landing.</p>
              <div className="booking-form-grid">
                <label>
                  Tarifa clase grupal (S/.)
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={content.pricing.groupRate}
                    onChange={(event) => {
                      const value = Number.parseInt(event.target.value, 10);
                      setContent((current) => ({
                        ...current,
                        pricing: {
                          ...current.pricing,
                          groupRate: Number.isFinite(value) ? value : current.pricing.groupRate,
                        },
                      }));
                    }}
                  />
                </label>
                <label>
                  Tarifa clase personalizada (S/.)
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={content.pricing.privateRate}
                    onChange={(event) => {
                      const value = Number.parseInt(event.target.value, 10);
                      setContent((current) => ({
                        ...current,
                        pricing: {
                          ...current.pricing,
                          privateRate: Number.isFinite(value) ? value : current.pricing.privateRate,
                        },
                      }));
                    }}
                  />
                </label>
                <label>
                  Paquetes (formato: "clases | descuento decimal")
                  <textarea rows={6} value={pricingLines} onChange={(event) => setPricingLines(event.target.value)} />
                </label>
              </div>
            </section>
          )}

          {/* Playas Section */}
          {activeSection === "playas" && (
            <section className="admin-panel">
              <h2>Playas para modal</h2>
              <p className="admin-panel-desc">Gestiona información detallada de cada playa que aparece en el modal.</p>
              <div style={{ display: "grid", gap: "1.2rem" }}>
                {beachesDraft.map((beach, index) => (
                  <article key={`beach-${index}`} className="admin-beach-card">
                    <div className="admin-beach-header">
                      <strong>{beach.name || "Playa sin nombre"}</strong>
                      <div className="admin-beach-controls">
                        <button type="button" className="admin-beach-btn" onClick={() => moveBeach(index, -1)} title="Subir">↑</button>
                        <button type="button" className="admin-beach-btn" onClick={() => moveBeach(index, 1)} title="Bajar">↓</button>
                        <button type="button" className={`admin-beach-btn${beach.main ? " is-main" : ""}`} onClick={() => setMainBeach(index)} title="Principal">★</button>
                        <button type="button" className="admin-beach-btn admin-beach-btn-danger" onClick={() => removeBeach(index)} title="Eliminar">✕</button>
                      </div>
                    </div>
                    <div className="booking-form-grid">
                      <label>
                        Nombre
                        <input
                          type="text"
                          value={beach.name}
                          onChange={(event) =>
                            updateBeach(index, (current) => ({ ...current, name: event.target.value }))
                          }
                        />
                      </label>
                      <label>
                        Imagen (URL o /media/...)
                        <input
                          type="text"
                          value={beach.image}
                          onChange={(event) =>
                            updateBeach(index, (current) => ({ ...current, image: event.target.value }))
                          }
                        />
                      </label>
                      <label>
                        Alt de imagen
                        <input
                          type="text"
                          value={beach.alt}
                          onChange={(event) =>
                            updateBeach(index, (current) => ({ ...current, alt: event.target.value }))
                          }
                        />
                      </label>
                      <label>
                        Nivel recomendado
                        <input
                          type="text"
                          value={beach.level}
                          onChange={(event) =>
                            updateBeach(index, (current) => ({ ...current, level: event.target.value }))
                          }
                        />
                      </label>
                      <label>
                        Mejor ventana
                        <input
                          type="text"
                          value={beach.bestWindow}
                          onChange={(event) =>
                            updateBeach(index, (current) => ({ ...current, bestWindow: event.target.value }))
                          }
                        />
                      </label>
                      <label>
                        Link Google Maps
                        <input
                          type="text"
                          value={beach.googleMapsUrl}
                          onChange={(event) =>
                            updateBeach(index, (current) => ({ ...current, googleMapsUrl: event.target.value }))
                          }
                        />
                      </label>
                      <label>
                        Descripción
                        <textarea
                          rows={3}
                          value={beach.description}
                          onChange={(event) =>
                            updateBeach(index, (current) => ({ ...current, description: event.target.value }))
                          }
                        />
                      </label>
                      <label>
                        Tips (1 por línea)
                        <textarea
                          rows={4}
                          value={toLines(beach.tips)}
                          onChange={(event) =>
                            updateBeach(index, (current) => ({
                              ...current,
                              tips: parseLines(event.target.value),
                            }))
                          }
                        />
                      </label>
                    </div>
                  </article>
                ))}
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setBeachesDraft((current) => [...current, createEmptyBeach()])}
                >
                  + Agregar playa
                </button>
              </div>
            </section>
          )}

          {/* Media Section */}
          {activeSection === "media" && (
            <section className="admin-panel">
              <h2>Videos y medios</h2>
              <p className="admin-panel-desc">Configura videos de YouTube, Instagram y otros medios para diferentes secciones de la landing.</p>

              {/* Hero Video */}
              <div className="admin-panel-section">
                <h3>🎬 Video Hero (Portada)</h3>
                <div className="booking-form-grid">
                  <label>
                    YouTube URL o ID
                    <input
                      type="text"
                      placeholder="https://youtube.com/watch?v=... o dQw4w9WgXcQ"
                      value={content.media.heroYoutubeUrl}
                      onChange={(event) =>
                        setContent((current) => ({
                          ...current,
                          media: { ...current.media, heroYoutubeUrl: event.target.value },
                        }))
                      }
                    />
                  </label>
                </div>
                {content.media.heroYoutubeUrl && (
                  <div className="admin-video-preview">
                    <div style={{ aspectRatio: "16 / 9", background: "#000" }}>
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${content.media.heroYoutubeUrl.split("v=")[1]?.split("&")[0] || content.media.heroYoutubeUrl}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ borderRadius: "0.6rem" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Story Video */}
              <div className="admin-panel-section">
                <h3>🎥 Video Experiencia</h3>
                <div className="booking-form-grid">
                  <label>
                    YouTube URL o ID
                    <input
                      type="text"
                      placeholder="https://youtube.com/watch?v=... o dQw4w9WgXcQ"
                      value={content.media.storyYoutubeUrl}
                      onChange={(event) =>
                        setContent((current) => ({
                          ...current,
                          media: { ...current.media, storyYoutubeUrl: event.target.value },
                        }))
                      }
                    />
                  </label>
                </div>
                {content.media.storyYoutubeUrl && (
                  <div className="admin-video-preview">
                    <div style={{ aspectRatio: "16 / 9", background: "#000" }}>
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${content.media.storyYoutubeUrl.split("v=")[1]?.split("&")[0] || content.media.storyYoutubeUrl}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ borderRadius: "0.6rem" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Gallery Videos */}
              <div className="admin-panel-section">
                <h3>🖼️ Videos para galería</h3>
                <p style={{ margin: "0 0 0.8rem", opacity: 0.8, fontSize: "0.9rem" }}>
                  URLs o IDs de YouTube (1 por línea). Se mostrarán en la galería de la landing.
                </p>
                <div className="booking-form-grid">
                  <label>
                    Links de YouTube
                    <textarea
                      rows={4}
                      placeholder="https://youtube.com/watch?v=dQw4w9WgXcQ&#10;O solo el ID: dQw4w9WgXcQ&#10;Un link por línea"
                      value={youtubeGalleryLines}
                      onChange={(event) => setYoutubeGalleryLines(event.target.value)}
                    />
                  </label>
                </div>
                {youtubeGalleryLines && (
                  <div className="admin-gallery-preview">
                    {youtubeGalleryLines
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((url, idx) => {
                        const videoId = url.split("v=")[1]?.split("&")[0] || url;
                        return (
                          <div key={idx} className="admin-gallery-item">
                            <iframe
                              width="100%"
                              height="100%"
                              src={`https://www.youtube.com/embed/${videoId}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              style={{ borderRadius: "0.6rem" }}
                            />
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Instagram */}
              <div className="admin-panel-section">
                <h3>📱 Instagram</h3>
                <div className="booking-form-grid">
                  <label>
                    Perfil de Instagram
                    <input
                      type="text"
                      placeholder="@tu_handle o nombre de usuario"
                      value={content.media.instagramProfileUrl}
                      onChange={(event) =>
                        setContent((current) => ({
                          ...current,
                          media: { ...current.media, instagramProfileUrl: event.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Links de posts (1 por línea)
                    <textarea
                      rows={4}
                      placeholder="https://instagram.com/p/...&#10;Un link por línea"
                      value={instagramLines}
                      onChange={(event) => setInstagramLines(event.target.value)}
                    />
                  </label>
                  <label>
                    Videos MP4 (URLs directas, 1 por línea)
                    <textarea
                      rows={4}
                      placeholder="https://ejemplo.com/video.mp4&#10;Archivos de video directos"
                      value={instagramVideoLines}
                      onChange={(event) => setInstagramVideoLines(event.target.value)}
                    />
                  </label>
                  <label>
                    Activar feed automatico de Instagram
                    <select
                      value={content.media.instagramAutoFeedEnabled ? "si" : "no"}
                      onChange={(event) =>
                        setContent((current) => ({
                          ...current,
                          media: {
                            ...current.media,
                            instagramAutoFeedEnabled: event.target.value === "si",
                          },
                        }))
                      }
                    >
                      <option value="no">No</option>
                      <option value="si">Si</option>
                    </select>
                  </label>
                  <label>
                    Cantidad de publicaciones automaticas (1-12)
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={content.media.instagramAutoFeedLimit}
                      onChange={(event) =>
                        setContent((current) => ({
                          ...current,
                          media: {
                            ...current.media,
                            instagramAutoFeedLimit: Math.min(
                              12,
                              Math.max(1, Number.parseInt(event.target.value || "6", 10) || 6)
                            ),
                          },
                        }))
                      }
                    />
                  </label>
                </div>
                <p style={{ margin: "0.8rem 0 0", opacity: 0.8, fontSize: "0.9rem" }}>
                  Para usar el feed automatico, configura la variable de entorno del servidor <code>INSTAGRAM_ACCESS_TOKEN</code>.
                  Si falla la conexion, la web sigue mostrando la galeria manual.
                </p>
              </div>

              {/* Media Library */}
              <div className="admin-panel-section">
                <h3>📚 Biblioteca de medios</h3>
                <p style={{ margin: "0 0 1rem", opacity: 0.85, fontSize: "0.9rem" }}>
                  Sube archivos aquí. Puedes asignarlos como hero, experiencia o agregarlos a galería. Máx 5MB por archivo.
                </p>
                <div className="booking-form-grid">
                  <label>
                    Subir imágenes o videos
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*,video/*" 
                      onChange={(event) => uploadFiles(event.target.files)} 
                      style={{ padding: "0.6rem", cursor: "pointer" }}
                    />
                  </label>
                </div>
                {isUploading && (
                  <p style={{ marginTop: "0.6rem", color: "var(--accent)", fontWeight: 600 }}>⏳ Subiendo archivos...</p>
                )}
                {mediaLibrary.length > 0 && (
                  <p style={{ marginTop: "1rem", opacity: 0.8, fontSize: "0.9rem" }}>
                    {mediaLibrary.length} archivo{mediaLibrary.length !== 1 ? "s" : ""} en biblioteca
                  </p>
                )}
                <div className="admin-media-grid" style={{ marginTop: "1.5rem" }}>
                  {mediaLibrary.map((file) => (
                    <div key={file.name} className="admin-media-card">
                      <MediaPreview file={file} />
                      <div className="admin-media-info">
                        <strong title={file.name}>{file.name.substring(0, 20)}</strong>
                        <small>{(file.size / 1024).toFixed(1)}KB</small>
                      </div>
                      <div className="admin-media-actions">
                        <button 
                          type="button" 
                          className="admin-media-action" 
                          onClick={() => useFileInHero(file)} 
                          title="Usar en hero"
                        >
                          🎬
                        </button>
                        <button 
                          type="button" 
                          className="admin-media-action" 
                          onClick={() => useFileInStory(file)} 
                          title="Usar en experiencia"
                        >
                          🎥
                        </button>
                        <button 
                          type="button" 
                          className="admin-media-action" 
                          onClick={() => addFileToGallery(file)} 
                          title="Agregar a galería"
                        >
                          🖼️
                        </button>
                        <button 
                          type="button" 
                          className="admin-media-action admin-media-action-delete" 
                          onClick={() => deleteFile(file)} 
                          title="Eliminar"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {mediaLibrary.length === 0 && (
                  <p style={{ marginTop: "2rem", opacity: 0.6, textAlign: "center", padding: "2rem 0" }}>
                    📁 Sin archivos aún. Sube imágenes o videos para empezar.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Galeria Section */}
          {activeSection === "galeria" && (
            <section className="admin-panel">
              <h2>Galería de imágenes</h2>
              <p className="admin-panel-desc">Gestiona las imágenes que aparecen en la galería de la landing. Puedes agregar, editar y reordenar.</p>

              {/* Gallery Items */}
              <div className="admin-gallery-editor">
                {content.media.galleryImages.length > 0 ? (
                  <div className="admin-gallery-list">
                    {content.media.galleryImages.map((image, index) => (
                      <div key={index} className="admin-gallery-edit-card">
                        <div className="admin-gallery-edit-preview">
                          {image.src && (
                            <img 
                              src={image.src} 
                              alt={image.alt || "Galería"} 
                              onError={(e) => {
                                e.currentTarget.style.background = "rgba(0, 0, 0, 0.1)";
                              }}
                            />
                          )}
                        </div>
                        <div className="admin-gallery-edit-form">
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.8rem" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(16, 33, 45, 0.6)" }}>
                              #{index + 1}
                            </span>
                            <div style={{ flex: 1 }} />
                            {index > 0 && (
                              <button
                                type="button"
                                className="admin-gallery-reorder-btn"
                                onClick={() =>
                                  setContent((current) => {
                                    const newImages = [...current.media.galleryImages];
                                    [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
                                    return { ...current, media: { ...current.media, galleryImages: newImages } };
                                  })
                                }
                                title="Mover arriba"
                              >
                                ⬆️
                              </button>
                            )}
                            {index < content.media.galleryImages.length - 1 && (
                              <button
                                type="button"
                                className="admin-gallery-reorder-btn"
                                onClick={() =>
                                  setContent((current) => {
                                    const newImages = [...current.media.galleryImages];
                                    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
                                    return { ...current, media: { ...current.media, galleryImages: newImages } };
                                  })
                                }
                                title="Mover abajo"
                              >
                                ⬇️
                              </button>
                            )}
                            <button
                              type="button"
                              className="admin-gallery-delete-btn"
                              onClick={() =>
                                setContent((current) => ({
                                  ...current,
                                  media: {
                                    ...current.media,
                                    galleryImages: current.media.galleryImages.filter((_, i) => i !== index),
                                  },
                                }))
                              }
                              title="Eliminar imagen"
                            >
                              ✕
                            </button>
                          </div>
                          <label className="admin-gallery-field">
                            <span>URL de imagen</span>
                            <input
                              type="text"
                              placeholder="https://ejemplo.com/imagen.jpg"
                              value={image.src}
                              onChange={(event) =>
                                setContent((current) => {
                                  const newImages = [...current.media.galleryImages];
                                  newImages[index] = { ...newImages[index], src: event.target.value };
                                  return { ...current, media: { ...current.media, galleryImages: newImages } };
                                })
                              }
                            />
                          </label>
                          <label className="admin-gallery-field">
                            <span>Texto ALT (descripción)</span>
                            <input
                              type="text"
                              placeholder="Describe la imagen para accesibilidad"
                              value={image.alt}
                              onChange={(event) =>
                                setContent((current) => {
                                  const newImages = [...current.media.galleryImages];
                                  newImages[index] = { ...newImages[index], alt: event.target.value };
                                  return { ...current, media: { ...current.media, galleryImages: newImages } };
                                })
                              }
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "2rem 1rem", opacity: 0.6 }}>
                    <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>🖼️ Sin imágenes aún</p>
                    <p style={{ fontSize: "0.9rem" }}>Agrega imágenes para llenar la galería</p>
                  </div>
                )}

                {/* Add New Image Button */}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setContent((current) => ({
                      ...current,
                      media: {
                        ...current.media,
                        galleryImages: [...current.media.galleryImages, { src: "", alt: "" }],
                      },
                    }))
                  }
                  style={{ width: "100%", marginTop: content.media.galleryImages.length > 0 ? "1.5rem" : "0" }}
                >
                  + Agregar imagen
                </button>
              </div>

              {/* Bulk Import */}
              <div className="admin-panel-section" style={{ marginTop: "2rem" }}>
                <h3>📋 Importar en lote</h3>
                <p style={{ margin: "0 0 0.8rem", opacity: 0.8, fontSize: "0.9rem" }}>
                  Pega múltiples URLs en el formato <code>URL | ALT</code> (una por línea)
                </p>
                <div className="booking-form-grid">
                  <label>
                    Imágenes (una por línea)
                    <textarea
                      rows={6}
                      placeholder="https://ejemplo.com/foto1.jpg | Descripción 1&#10;https://ejemplo.com/foto2.jpg | Descripción 2&#10;https://ejemplo.com/foto3.jpg | Descripción 3"
                      value={imageLines}
                      onChange={(event) => setImageLines(event.target.value)}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    const newImages = parseImageLines(imageLines);
                    setContent((current) => ({
                      ...current,
                      media: {
                        ...current.media,
                        galleryImages: [...current.media.galleryImages, ...newImages],
                      },
                    }));
                    setImageLines("");
                  }}
                  disabled={!imageLines.trim()}
                  style={{ marginTop: "0.8rem", opacity: imageLines.trim() ? 1 : 0.5 }}
                >
                  ✓ Importar {parseImageLines(imageLines).length} imagen{parseImageLines(imageLines).length !== 1 ? "s" : ""}
                </button>
              </div>

              {/* Export */}
              {content.media.galleryImages.length > 0 && (
                <div className="admin-panel-section" style={{ marginTop: "1.5rem" }}>
                  <h3>📤 Exportar</h3>
                  <p style={{ margin: "0 0 0.8rem", opacity: 0.8, fontSize: "0.9rem" }}>
                    Copia todo como texto para respaldar o editar en otro lugar:
                  </p>
                  <textarea
                    readOnly
                    rows={4}
                    value={imageLines}
                    style={{
                      padding: "0.8rem",
                      border: "1px solid rgba(0, 0, 0, 0.12)",
                      borderRadius: "0.6rem",
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      background: "rgba(255, 255, 255, 0.6)",
                      cursor: "text",
                    }}
                  />
                </div>
              )}
            </section>
          )}

          {/* Notice */}
          {notice !== "idle" && (
            <div className={`admin-notice admin-notice-${notice}`}>
              {notice === "saved" && "✓ Cambios guardados"}
              {notice === "reset" && "↻ Configuración restaurada"}
              {notice === "error" && "✕ Error"}
              {noticeMessage && <span>{noticeMessage}</span>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
