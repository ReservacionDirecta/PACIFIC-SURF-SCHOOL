"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultSiteContent, type SiteContent } from "../../lib/siteContent";

type NoticeState = "idle" | "saved" | "reset" | "error";

const toLines = (items: string[]): string => items.join("\n");

const toImageLines = (items: SiteContent["media"]["galleryImages"]): string =>
  items.map((item) => `${item.src} | ${item.alt}`).join("\n");

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

export default function AdminPage() {
  const initial = useMemo(() => defaultSiteContent, []);
  const [content, setContent] = useState<SiteContent>(initial);
  const [adminToken, setAdminToken] = useState<string>("");
  const [instagramLines, setInstagramLines] = useState<string>(toLines(initial.media.instagramLinks));
  const [instagramVideoLines, setInstagramVideoLines] = useState<string>(
    toLines(initial.media.instagramVideoLinks)
  );
  const [youtubeGalleryLines, setYoutubeGalleryLines] = useState<string>(
    toLines(initial.media.youtubeGalleryLinks)
  );
  const [imageLines, setImageLines] = useState<string>(toImageLines(initial.media.galleryImages));
  const [notice, setNotice] = useState<NoticeState>("idle");
  const [noticeMessage, setNoticeMessage] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const syncFromDefault = (source: SiteContent) => {
    setContent(source);
    setInstagramLines(toLines(source.media.instagramLinks));
    setInstagramVideoLines(toLines(source.media.instagramVideoLinks));
    setYoutubeGalleryLines(toLines(source.media.youtubeGalleryLinks));
    setImageLines(toImageLines(source.media.galleryImages));
  };

  useEffect(() => {
    let isMounted = true;

    const loadFromApi = async () => {
      try {
        const response = await fetch("/api/site-content", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { content?: SiteContent };
        if (payload.content && isMounted) syncFromDefault(payload.content);
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
      texts: { ...content.texts },
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
      </div>

      {notice !== "idle" && <p style={{ marginTop: "0.8rem" }}>{noticeMessage}</p>}
    </main>
  );
}
