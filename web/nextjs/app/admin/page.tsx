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
    <main className="section" style={{ paddingTop: "3rem", paddingBottom: "4rem" }}>
      <p className="eyebrow">Admin</p>
      <h1>Gestion de contenido de landing</h1>
      <p className="lead" style={{ maxWidth: "70ch" }}>
        Aqui puedes editar textos, videos y galerias. Los cambios se guardan en backend (Next.js) y se
        reflejan en la home para todos los usuarios.
      </p>

      <section className="card-section" style={{ marginTop: "1.5rem" }}>
        <div className="section-head">
          <h2>Acceso admin</h2>
        </div>
        <div className="booking-form-grid">
          <label>
            Token de administrador (Gabriel)
            <input
              type="password"
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              placeholder="Ingresa CMS_ADMIN_TOKEN"
            />
          </label>
        </div>
        <p style={{ marginTop: "0.6rem", opacity: 0.8 }}>
          En Railway, los archivos se guardan en el volumen montado en <strong>/storage/media</strong>.
        </p>
      </section>

      <section className="card-section" style={{ marginTop: "1.5rem" }}>
        <div className="section-head">
          <h2>Checklist de publicacion</h2>
        </div>
        <div className="admin-checklist">
          {publicationChecks.map((check) => (
            <div key={check.label} className={`admin-check-item${check.ok ? " is-ok" : " is-warning"}`}>
              <strong>{check.ok ? "OK" : "Revisar"}</strong>
              <span>{check.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card-section" style={{ marginTop: "1.5rem" }}>
        <div className="section-head">
          <h2>SEO</h2>
        </div>
        <div className="booking-form-grid">
          <label>
            Title
            <input
              type="text"
              value={content.seo.title}
              onChange={(event) =>
                setContent((current) => ({ ...current, seo: { ...current.seo, title: event.target.value } }))
              }
            />
          </label>
          <label>
            Description
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
            OG title
            <input
              type="text"
              value={content.seo.ogTitle}
              onChange={(event) =>
                setContent((current) => ({ ...current, seo: { ...current.seo, ogTitle: event.target.value } }))
              }
            />
          </label>
          <label>
            OG description
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

      <section className="card-section" style={{ marginTop: "1.5rem" }}>
        <div className="section-head">
          <h2>Textos</h2>
        </div>
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
            CTA hero primario
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
            CTA hero secundario
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
            Hero titulo
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
            Hero descripcion
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
            Galeria eyebrow
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
            Galeria titulo
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
            CTA final titulo
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
            CTA final descripcion
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
            CTA final boton
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

      <section className="card-section" style={{ marginTop: "1.5rem" }}>
        <div className="section-head">
          <h2>Bloques de conversion</h2>
        </div>
        <div className="booking-form-grid">
          <label>
            Hero bullets (1 por linea)
            <textarea rows={4} value={heroPointsLines} onChange={(event) => setHeroPointsLines(event.target.value)} />
          </label>
          <label>
            Testimonios (formato: cita | autor)
            <textarea rows={6} value={testimonialLines} onChange={(event) => setTestimonialLines(event.target.value)} />
          </label>
          <label>
            Comparativo (formato: factor | Barranquito | Competencia)
            <textarea rows={6} value={comparisonLines} onChange={(event) => setComparisonLines(event.target.value)} />
          </label>
          <label>
            FAQs (formato: pregunta | respuesta)
            <textarea rows={6} value={faqLines} onChange={(event) => setFaqLines(event.target.value)} />
          </label>
        </div>
      </section>

      <section className="card-section" style={{ marginTop: "1.5rem" }}>
        <div className="section-head">
          <h2>Precios y paquetes</h2>
        </div>
        <p style={{ margin: "0 0 0.6rem", opacity: 0.85 }}>
          Estos valores alimentan todos los calculos y mensajes de WhatsApp del cotizador.
        </p>
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
            Paquetes (formato: clases | descuento)
            <textarea rows={6} value={pricingLines} onChange={(event) => setPricingLines(event.target.value)} />
          </label>
        </div>
      </section>

      <section className="card-section" style={{ marginTop: "1.5rem" }}>
        <div className="section-head">
          <h2>Videos y enlaces</h2>
        </div>
        <div className="booking-form-grid">
          <label>
            YouTube hero (url o id)
            <input
              type="text"
              value={content.media.heroYoutubeUrl}
              onChange={(event) =>
                setContent((current) => ({
                  ...current,
                  media: { ...current.media, heroYoutubeUrl: event.target.value },
                }))
              }
            />
          </label>
          <label>
            YouTube seccion experiencia (url o id)
            <input
              type="text"
              value={content.media.storyYoutubeUrl}
              onChange={(event) =>
                setContent((current) => ({
                  ...current,
                  media: { ...current.media, storyYoutubeUrl: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Perfil de Instagram
            <input
              type="text"
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
            Links de Instagram (1 por linea)
            <textarea rows={6} value={instagramLines} onChange={(event) => setInstagramLines(event.target.value)} />
          </label>
          <label>
            Videos directos de Instagram (mp4, 1 por linea)
            <textarea
              rows={6}
              value={instagramVideoLines}
              onChange={(event) => setInstagramVideoLines(event.target.value)}
            />
          </label>
          <label>
            Links de YouTube para galeria (1 por linea)
            <textarea
              rows={6}
              value={youtubeGalleryLines}
              onChange={(event) => setYoutubeGalleryLines(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="card-section" style={{ marginTop: "1.5rem" }}>
        <div className="section-head">
          <h2>Biblioteca interna de medios</h2>
        </div>
        <div className="booking-form-grid">
          <label>
            Subir imagenes o videos al volumen
            <input type="file" multiple accept="image/*,video/*" onChange={(event) => uploadFiles(event.target.files)} />
          </label>
        </div>
        <p style={{ margin: "0.7rem 0 0.9rem", opacity: 0.82 }}>
          Usa los botones de cada archivo para enviarlo al hero, seccion experiencia o galeria.
        </p>
        <div className="admin-library-grid">
          {mediaLibrary.map((file) => (
            <article key={file.name} className="admin-library-card">
              <MediaPreview file={file} />
              <strong>{file.name}</strong>
              <small>{file.mimeType}</small>
              <div className="admin-library-actions">
                <button type="button" className="btn btn-secondary" onClick={() => useFileInHero(file)}>
                  Usar en hero
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => useFileInStory(file)}>
                  Usar en experiencia
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => addFileToGallery(file)}>
                  Agregar a galeria
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => deleteFile(file)}>
                  Eliminar
                </button>
              </div>
            </article>
          ))}
          {mediaLibrary.length === 0 && <p style={{ opacity: 0.75 }}>No hay archivos en la biblioteca todavia.</p>}
        </div>
      </section>

      <section className="card-section" style={{ marginTop: "1.5rem" }}>
        <div className="section-head">
          <h2>Galeria de imagenes</h2>
        </div>
        <p style={{ margin: "0 0 0.6rem", opacity: 0.85 }}>
          Formato por linea: URL | ALT. Ejemplo: /media/session-a.svg | Alumno entrando al agua
        </p>
        <div className="booking-form-grid">
          <label>
            Imagenes de galeria
            <textarea rows={8} value={imageLines} onChange={(event) => setImageLines(event.target.value)} />
          </label>
        </div>
      </section>

      <div className="cta-row" style={{ marginTop: "1.4rem" }}>
        <button className="btn btn-primary" type="button" onClick={saveChanges} disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
        <button className="btn btn-secondary" type="button" onClick={resetToDefault} disabled={isSaving}>
          Restaurar defaults
        </button>
        <a className="btn btn-secondary" href="/" target="_blank" rel="noopener noreferrer">
          Ver landing
        </a>
        {isUploading && <span style={{ alignSelf: "center" }}>Subiendo archivos...</span>}
      </div>

      {notice !== "idle" && <p style={{ marginTop: "0.8rem" }}>{noticeMessage}</p>}
    </main>
  );
}
