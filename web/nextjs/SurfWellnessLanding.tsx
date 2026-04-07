"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRef } from "react";
import { trackEvent } from "./lib/analytics";
import { defaultSiteContent, type SiteContent } from "./lib/siteContent";

const HERO_POSTER = process.env.NEXT_PUBLIC_HERO_POSTER || "/media/hero-poster.svg";
type MediaOrientation = "landscape" | "portrait" | "square";

const scheduleSlots = ["6:00", "8:00", "10:00", "4:00"];
const weekdayOptions = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

type BeachSpot = SiteContent["beaches"][number];

type GalleryItem =
  | {
      type: "image";
      src: string;
      alt: string;
      imageIndex: number;
    }
  | {
      type: "instagramPost";
      src: string;
      alt: string;
      permalink: string;
    }
  | {
      type: "instagramVideo";
      alt: string;
      src: string;
    }
  | {
      type: "youtube";
      alt: string;
      permalink: string;
      embedUrl: string;
    };

const extractYouTubeId = (input: string): string | null => {
  const value = input.trim();
  if (!value) return null;

  const directIdMatch = value.match(/^[A-Za-z0-9_-]{11}$/);
  if (directIdMatch) return value;

  const watchMatch = value.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  const shortMatch = value.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  const embedMatch = value.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  return null;
};

const isDirectVideoUrl = (value: string): boolean => /\.(mp4|webm|mov)(\?|$)/i.test(value.trim());

const isDirectImageUrl = (value: string): boolean => /\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i.test(value.trim());

const toYouTubeEmbedUrl = (url: string, options?: { loop?: boolean; autoplay?: boolean }): string | null => {
  const id = extractYouTubeId(url);
  if (!id) return null;

  const loop = Boolean(options?.loop);
  const autoplay = options?.autoplay ?? true;
  const loopQuery = loop ? `&loop=1&playlist=${id}` : "";
  const controls = autoplay ? 0 : 1;
  const autoplayValue = autoplay ? 1 : 0;
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=${autoplayValue}&mute=1&controls=${controls}${loopQuery}&modestbranding=1&playsinline=1&rel=0&disablekb=1&fs=0&iv_load_policy=3&cc_load_policy=0&enablejsapi=1`;
};

const toPen = (value: number) => `S/.${Math.round(value)}`;

function GalleryVideoCard({ src }: { src: string }) {
  const [orientation, setOrientation] = useState<MediaOrientation>("portrait");

  const updateOrientation = (width: number, height: number) => {
    if (!width || !height) return;
    if (Math.abs(width - height) < 8) {
      setOrientation("square");
      return;
    }

    setOrientation(width > height ? "landscape" : "portrait");
  };

  return (
    <article className="gallery-item gallery-item-video">
      <div className={`gallery-media-wrap gallery-media-wrap-${orientation}`}>
        <video
          className="gallery-native-video"
          src={src}
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
          onLoadedMetadata={(event) =>
            updateOrientation(event.currentTarget.videoWidth, event.currentTarget.videoHeight)
          }
        />
      </div>
    </article>
  );
}

function GalleryImageCard({ src, alt, onOpen, ariaLabel }: { src: string; alt: string; onOpen: () => void; ariaLabel: string }) {
  const [orientation, setOrientation] = useState<MediaOrientation>("landscape");

  const updateOrientation = (width: number, height: number) => {
    if (!width || !height) return;
    if (Math.abs(width - height) < 8) {
      setOrientation("square");
      return;
    }

    setOrientation(width > height ? "landscape" : "portrait");
  };

  return (
    <button type="button" className="gallery-item gallery-item-button" onClick={onOpen} aria-label={ariaLabel}>
      <div className={`gallery-media-wrap gallery-media-wrap-${orientation}`}>
        <img
          className="gallery-media-image"
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={(event) => updateOrientation(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)}
        />
      </div>
    </button>
  );
}

export default function SurfWellnessLanding() {
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [activeBeachName, setActiveBeachName] = useState<string | null>(null);
  const [plannerSyncTick, setPlannerSyncTick] = useState<number>(0);
  const [selectedPackageClasses, setSelectedPackageClasses] = useState<number>(
    defaultSiteContent.pricing.packages.find((plan) => plan.classes === 8)?.classes ||
      defaultSiteContent.pricing.packages[0].classes
  );
  const [selectedClassType, setSelectedClassType] = useState<"grupal" | "personalizada">("grupal");
  const [planCadence, setPlanCadence] = useState<"consecutivas" | "semanales">("consecutivas");
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
  const [firstClassDate, setFirstClassDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>(scheduleSlots[0]);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState<string>("");
  const [instagramLatestPosts, setInstagramLatestPosts] = useState<
    Array<{ id: string; mediaUrl: string; permalink: string; caption: string }>
  >([]);
  const heroFrameRef = useRef<HTMLIFrameElement | null>(null);
  const storyFrameRef = useRef<HTMLIFrameElement | null>(null);
  const firstClassDateInputRef = useRef<HTMLInputElement | null>(null);
  const customerNameInputRef = useRef<HTMLInputElement | null>(null);
  const customerEmailInputRef = useRef<HTMLInputElement | null>(null);
  const customerWhatsappInputRef = useRef<HTMLInputElement | null>(null);

  const heroSource = siteContent.media.heroYoutubeUrl.trim();
  const storySource = siteContent.media.storyYoutubeUrl.trim();
  const heroIsHostedVideo = isDirectVideoUrl(heroSource);
  const storyIsHostedVideo = isDirectVideoUrl(storySource);
  const storyIsHostedImage = isDirectImageUrl(storySource);

  const heroEmbed = useMemo(
    () => (heroIsHostedVideo ? "" : toYouTubeEmbedUrl(heroSource, { loop: true, autoplay: true }) || ""),
    [heroIsHostedVideo, heroSource]
  );

  const storyEmbed = useMemo(
    () =>
      storyIsHostedVideo || storyIsHostedImage
        ? ""
        : toYouTubeEmbedUrl(storySource, { loop: true, autoplay: true }) || "",
    [storyIsHostedImage, storyIsHostedVideo, storySource]
  );

  const todayIso = useMemo(() => {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDate.toISOString().split("T")[0];
  }, []);

  const syncYoutubePlayer = (frame: HTMLIFrameElement | null) => {
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage(
      JSON.stringify({ event: "command", func: "mute", args: [] }),
      "*"
    );
    frame.contentWindow.postMessage(
      JSON.stringify({ event: "command", func: "playVideo", args: [] }),
      "*"
    );
  };

  const trackCta = (placement: string, offer: string) => {
    trackEvent("cta_whatsapp_click", { placement, offer, locale: "es" });
  };

  const closeMobileNav = () => setIsMobileNavOpen(false);
  const syncPlannerFields = () => setPlannerSyncTick((current) => current + 1);

  const packagePlans = useMemo(
    () =>
      [...siteContent.pricing.packages]
        .filter((plan) => plan.classes >= 1)
        .sort((left, right) => left.classes - right.classes),
    [siteContent.pricing.packages]
  );

  useEffect(() => {
    const available = packagePlans.some((plan) => plan.classes === selectedPackageClasses);
    if (!available && packagePlans.length > 0) {
      setSelectedPackageClasses(packagePlans[0].classes);
    }
  }, [packagePlans, selectedPackageClasses]);

  const selectedPlan = useMemo(
    () => packagePlans.find((plan) => plan.classes === selectedPackageClasses) || packagePlans[0],
    [packagePlans, selectedPackageClasses]
  );

  const selectedClassRate =
    selectedClassType === "grupal" ? siteContent.pricing.groupRate : siteContent.pricing.privateRate;
  const planBase = selectedClassRate * selectedPlan.classes;
  const planFinal = planBase * (1 - selectedPlan.discount);
  const planSavings = planBase - planFinal;
  const isIndividualClass = selectedPlan.classes === 1;
  const resolvedCustomerName = customerName.trim() || customerNameInputRef.current?.value.trim() || "";
  const resolvedCustomerEmail = customerEmail.trim() || customerEmailInputRef.current?.value.trim() || "";
  const resolvedCustomerWhatsapp = customerWhatsapp.trim() || customerWhatsappInputRef.current?.value.trim() || "";
  const resolvedFirstClassDate = firstClassDate || firstClassDateInputRef.current?.value || "";
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resolvedCustomerEmail);

  const toggleWeekday = (day: string) => {
    setSelectedWeekdays((current) =>
      current.includes(day) ? current.filter((value) => value !== day) : [...current, day]
    );
  };

  const isPlannerValid =
    resolvedCustomerName.length > 1 &&
    emailLooksValid &&
    resolvedCustomerWhatsapp.length > 7 &&
    resolvedFirstClassDate &&
    selectedSlot &&
    (planCadence === "consecutivas" || selectedWeekdays.length > 0);

  const planningModeDetail =
    planCadence === "consecutivas"
      ? "Tomare las clases de forma consecutiva segun disponibilidad."
      : `Tomare las clases semanalmente en estos dias: ${selectedWeekdays.join(", ")}.`;

  const plannerMessage = [
    "Hola Pacific Surf School, quiero reservar mi plan de clases.",
    `Nombre: ${resolvedCustomerName || "Por confirmar"}`,
    `Correo: ${resolvedCustomerEmail || "Por confirmar"}`,
    `WhatsApp cliente: ${resolvedCustomerWhatsapp || "Por confirmar"}`,
    `${isIndividualClass ? "Clase elegida" : "Paquete elegido"}: ${selectedPlan.classes} ${
      selectedPlan.classes === 1 ? "clase" : "clases"
    }${selectedPlan.discount > 0 ? ` (${Math.round(selectedPlan.discount * 100)}% dscto)` : ""}`,
    `Tipo de clase: ${selectedClassType}`,
    `Primera clase: ${resolvedFirstClassDate || "Por confirmar"}`,
    `Horario preferido: ${selectedSlot || "Por confirmar"}`,
    `Modalidad: ${planCadence}`,
    planningModeDetail,
    `Monto estimado del plan: ${toPen(planFinal)}.`,
    "Confirmen disponibilidad y pasos para pago por Yape/Plin.",
  ].join("\n");

  const plannerHref = `https://wa.me/51915168620?text=${encodeURIComponent(plannerMessage)}`;

  const instagramVideoItems = useMemo<GalleryItem[]>(() => {
    return siteContent.media.instagramVideoLinks
      .map((src) => {
        const cleanSrc = src.trim();
        if (!cleanSrc) return null;
        return {
          type: "instagramVideo",
          alt: "Video de Instagram de Pacific Surf School",
          src: cleanSrc,
        } as GalleryItem;
      })
      .filter((item): item is GalleryItem => item !== null);
  }, [siteContent.media.instagramVideoLinks]);

  const instagramLatestItems = useMemo<GalleryItem[]>(() => {
    return instagramLatestPosts
      .map((post) => {
        const src = post.mediaUrl.trim();
        const permalink = post.permalink.trim();
        if (!src || !permalink) return null;

        return {
          type: "instagramPost",
          src,
          permalink,
          alt: post.caption || "Publicacion de Instagram de Pacific Surf School",
        } as GalleryItem;
      })
      .filter((item): item is GalleryItem => item !== null);
  }, [instagramLatestPosts]);

  const youtubeItems = useMemo<GalleryItem[]>(() => {
    return siteContent.media.youtubeGalleryLinks
      .map((permalink) => {
        const embedUrl = toYouTubeEmbedUrl(permalink, { loop: false, autoplay: false });
        if (!embedUrl) return null;

        return {
          type: "youtube",
          alt: "Video de YouTube de Pacific Surf School",
          permalink,
          embedUrl,
        } as GalleryItem;
      })
      .filter((item): item is GalleryItem => item !== null);
  }, [siteContent.media.youtubeGalleryLinks]);

  const galleryItems = useMemo<GalleryItem[]>(() => {
    const imageItems: GalleryItem[] = siteContent.media.galleryImages.map((image, imageIndex) => ({
      type: "image",
      src: image.src,
      alt: image.alt,
      imageIndex,
    }));

    const autoInstagram =
      siteContent.media.instagramAutoFeedEnabled && instagramLatestItems.length > 0 ? instagramLatestItems : [];

    return [...autoInstagram, ...instagramVideoItems, ...youtubeItems, ...imageItems];
  }, [
    instagramLatestItems,
    instagramVideoItems,
    siteContent.media.galleryImages,
    siteContent.media.instagramAutoFeedEnabled,
    youtubeItems,
  ]);

  const beaches = useMemo(() => siteContent.beaches, [siteContent.beaches]);

  const activeImage = useMemo(() => {
    if (activeImageIndex === null) return null;
    return siteContent.media.galleryImages[activeImageIndex] || null;
  }, [activeImageIndex, siteContent.media.galleryImages]);

  const activeBeach = useMemo(
    () => beaches.find((beach) => beach.name === activeBeachName) || null,
    [activeBeachName, beaches]
  );

  const openImage = (index: number) => {
    setActiveImageIndex(index);
    trackEvent("gallery_image_open", { index, locale: "es" });
  };

  const closeImage = () => setActiveImageIndex(null);

  const openBeachModal = (beach: BeachSpot) => {
    setActiveBeachName(beach.name);
    trackEvent("beach_modal_open", { beach: beach.name, locale: "es" });
  };

  const closeBeachModal = () => setActiveBeachName(null);

  const showPrevImage = () => {
    if (activeImageIndex === null) return;
    const nextIndex =
      (activeImageIndex - 1 + siteContent.media.galleryImages.length) %
      siteContent.media.galleryImages.length;
    setActiveImageIndex(nextIndex);
  };

  const showNextImage = () => {
    if (activeImageIndex === null) return;
    const nextIndex = (activeImageIndex + 1) % siteContent.media.galleryImages.length;
    setActiveImageIndex(nextIndex);
  };

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      try {
        const response = await fetch("/api/site-content", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { content?: SiteContent };
        if (payload.content && isMounted) setSiteContent(payload.content);
      } catch {
        // Keep defaults if API is unavailable.
      }
    };

    loadContent();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadInstagramFeed = async () => {
      if (!siteContent.media.instagramAutoFeedEnabled) {
        if (isMounted) setInstagramLatestPosts([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/instagram-feed?limit=${encodeURIComponent(String(siteContent.media.instagramAutoFeedLimit || 6))}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          if (isMounted) setInstagramLatestPosts([]);
          return;
        }

        const payload = (await response.json()) as {
          posts?: Array<{ id: string; mediaUrl: string; permalink: string; caption: string }>;
        };

        if (isMounted) {
          setInstagramLatestPosts(payload.posts || []);
        }
      } catch {
        if (isMounted) setInstagramLatestPosts([]);
      }
    };

    loadInstagramFeed();

    return () => {
      isMounted = false;
    };
  }, [siteContent.media.instagramAutoFeedEnabled, siteContent.media.instagramAutoFeedLimit]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (activeBeachName !== null) {
          closeBeachModal();
          return;
        }
        if (activeImageIndex !== null) {
          closeImage();
          return;
        }
      }

      if (activeImageIndex === null) return;
      if (event.key === "ArrowLeft") showPrevImage();
      if (event.key === "ArrowRight") showNextImage();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeBeachName, activeImageIndex]);

  useEffect(() => {
    let attempts = 0;

    const interval = window.setInterval(() => {
      attempts += 1;
      [heroFrameRef.current, storyFrameRef.current].forEach((frame) => {
        syncYoutubePlayer(frame);
      });

      if (attempts >= 20) {
        window.clearInterval(interval);
      }
    }, 500);

    return () => window.clearInterval(interval);
  }, [heroEmbed, storyEmbed]);

  useEffect(() => {
    const closeMenuOnDesktop = () => {
      if (window.innerWidth > 860) {
        setIsMobileNavOpen(false);
      }
    };

    window.addEventListener("resize", closeMenuOnDesktop);
    return () => window.removeEventListener("resize", closeMenuOnDesktop);
  }, []);

  useEffect(() => {
    let attempts = 0;

    const interval = window.setInterval(() => {
      attempts += 1;
      const hasAutofilledValue = [
        customerNameInputRef.current?.value,
        customerEmailInputRef.current?.value,
        customerWhatsappInputRef.current?.value,
        firstClassDateInputRef.current?.value,
      ].some((value) => Boolean(value && value.trim().length > 0));

      if (hasAutofilledValue) {
        setPlannerSyncTick((current) => current + 1);
      }

      if (attempts >= 12) {
        window.clearInterval(interval);
      }
    }, 500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <>
      <div className="bg-grain" />
      <header className="hero" id="inicio">
        <div className="hero-media" aria-hidden="true">
          <div className="hero-poster" style={{ backgroundImage: `url(${HERO_POSTER})` }} />
          <div className="hero-media-viewport">
            {heroIsHostedVideo ? (
              <video className="hero-video hero-native-video" src={heroSource} autoPlay muted loop playsInline preload="metadata" />
            ) : heroEmbed ? (
              <iframe
                ref={heroFrameRef}
                className="hero-video"
                src={heroEmbed}
                title="Alumno tomando clase de surf en Barranquito"
                loading="eager"
                onLoad={() => syncYoutubePlayer(heroFrameRef.current)}
                allow="autoplay; encrypted-media; picture-in-picture"
              />
            ) : null}
          </div>
          <div className="hero-overlay" />
        </div>

        <div className="section hero-shell">
          <nav className="topbar">
            <a className="brand-link" href="#inicio" aria-label="Pacific Surf School inicio">
              <img className="brand-logo" src="/logo.png" alt="Pacific Surf School" />
              <span className="brand-text" aria-hidden="true">
                <span className="brand-text-top">PACIFIC</span>
                <span className="brand-text-bottom">Surf School</span>
              </span>
            </a>
            <button
              type="button"
              className={`mobile-nav-toggle${isMobileNavOpen ? " is-open" : ""}`}
              aria-label={isMobileNavOpen ? "Cerrar menu principal" : "Abrir menu principal"}
              aria-expanded={isMobileNavOpen}
              aria-controls="topbar-menu"
              onClick={() => setIsMobileNavOpen((current) => !current)}
            >
              <span className="mobile-nav-toggle-label">Menu</span>
              <span className="mobile-nav-toggle-icon" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
            <div id="topbar-menu" className={`topbar-actions${isMobileNavOpen ? " is-open" : ""}`}>
              <a className="link-chip" href="#inicio" onClick={closeMobileNav}>
                Inicio
              </a>
              <a className="link-chip" href="#experiencia" onClick={closeMobileNav}>
                Experiencia
              </a>
              <a className="link-chip" href="#paquetes" onClick={closeMobileNav}>
                Paquetes
              </a>
              <a className="link-chip" href="#playas" onClick={closeMobileNav}>
                Playas
              </a>
              <a className="link-chip link-chip-cta" href="#planificador" onClick={closeMobileNav}>
                Reservar Ahora
              </a>
            </div>
          </nav>

          <div className="hero-grid">
            <article className="hero-content">
              <p className="eyebrow">{siteContent.texts.heroEyebrow}</p>
              <h1>{siteContent.texts.heroTitle}</h1>
              <p className="lead">{siteContent.texts.heroLead}</p>

              <ul className="hero-points">
                {siteContent.heroPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              <div className="cta-row">
                <a
                  className="btn btn-primary"
                  href="https://wa.me/51915168620?text=Hola%20Pacific%20Surf%20School%2C%20quiero%20mi%20plan%20de%20surf%20en%20Barranquito."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCta("hero", "plan")}
                >
                  {siteContent.texts.heroPrimaryCta}
                </a>
                <a className="btn btn-secondary" href="#paquetes">
                  {siteContent.texts.heroSecondaryCta}
                </a>
              </div>
            </article>

            <aside className="hero-mini" aria-label="Resumen rapido para reservar">
              <p className="hero-mini-eyebrow">Tu plan en 3 pasos</p>
              <h2 className="hero-mini-title">Reserva sin friccion desde el celular</h2>

              <ul className="hero-mini-list">
                <li>Elige modalidad: clase individual, grupal o personalizada.</li>
                <li>Define fecha, horario y ritmo: consecutivas o semanales.</li>
                <li>Confirma por WhatsApp y paga facil con Yape o Plin.</li>
              </ul>

              <div className="hero-mini-metrics" aria-hidden="true">
                <article>
                  <p>Respuesta</p>
                  <strong>menos de 10 min</strong>
                </article>
                <article>
                  <p>Horarios diarios</p>
                  <strong>6:00, 8:00, 10:00, 4:00</strong>
                </article>
              </div>

              <div className="hero-mini-actions">
                <a className="btn btn-secondary hero-mini-btn" href="#planificador">
                  Armar mi plan
                </a>
                <a className="btn btn-primary hero-mini-btn" href="#paquetes">
                  Ver precios
                </a>
              </div>
            </aside>
          </div>
        </div>
      </header>

      <main>
        <section className="section brand-note" id="marca">
          <p>{siteContent.texts.brandNote}</p>
        </section>

        <section className="section media-strip" id="experiencia">
          <div className="section-head">
            <p className="eyebrow">Experiencia real</p>
            <h2>Lo que hace distinta a la escuela se ve y se siente</h2>
          </div>
          <div className="story-grid">
            <article className="story-video-wrap">
              {storyIsHostedVideo ? (
                <video className="story-video story-native-video" src={storySource} autoPlay muted loop playsInline preload="metadata" />
              ) : storyIsHostedImage ? (
                <img className="story-native-image" src={storySource} alt="Media destacada de Pacific Surf School" loading="lazy" />
              ) : storyEmbed ? (
                <iframe
                  ref={storyFrameRef}
                  className="story-video"
                  src={storyEmbed}
                  title="Sesion real de surf en Pacific Surf School"
                  loading="eager"
                  onLoad={() => syncYoutubePlayer(storyFrameRef.current)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
              ) : (
                <img src="/media/hero-poster.svg" alt="Vista de Barranquito para sesiones de surf" loading="lazy" />
              )}
            </article>
            <div className="media-grid">
              <article className="media-card media-image">
                <p className="media-step">Paso 1</p>
                <h3>Briefing en arena</h3>
                <p>Objetivo tecnico claro para cada sesion.</p>
              </article>
              <article className="media-card media-image">
                <p className="media-step">Paso 2</p>
                <h3>Practica guiada</h3>
                <p>Correccion en tiempo real dentro del agua.</p>
              </article>
              <article className="media-card media-image">
                <p className="media-step">Paso 3</p>
                <h3>Feedback accionable</h3>
                <p>Siguiente objetivo definido antes de salir.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section gallery-section" id="galeria">
          <div className="section-head">
            <p className="eyebrow">{siteContent.texts.galleryEyebrow}</p>
            <h2>{siteContent.texts.galleryTitle}</h2>
          </div>
          <p className="gallery-note">
            {siteContent.media.instagramAutoFeedEnabled
              ? "Mostrando ultimas publicaciones de Instagram (si hay conexion), ademas de tu galeria manual."
              : "Videos publicados por Pacific Surf School."}{" "}
            Mira mas contenido en{" "}
            <a href={siteContent.media.instagramProfileUrl} target="_blank" rel="noopener noreferrer">
              @pacific_surfschool
            </a>
            .
          </p>
          <div className="gallery-masonry">
            {galleryItems.map((item, index) => {
              if (item.type === "instagramPost") {
                return (
                  <article key={`${item.permalink}-${index}`} className="gallery-item gallery-item-video">
                    <div className="gallery-media-wrap gallery-media-wrap-square">
                      <img className="gallery-media-image" src={item.src} alt={item.alt} loading="lazy" />
                    </div>
                    <a className="instagram-link" href={item.permalink} target="_blank" rel="noopener noreferrer">
                      Ver post en Instagram
                    </a>
                  </article>
                );
              }

              if (item.type === "instagramVideo") {
                return <GalleryVideoCard key={`${item.src}-${index}`} src={item.src} />;
              }

              if (item.type === "youtube") {
                return (
                  <article key={`${item.permalink}-${index}`} className="gallery-item gallery-item-video">
                    <div className="gallery-media-wrap gallery-media-wrap-landscape">
                      <iframe
                        className="instagram-frame"
                        src={item.embedUrl}
                        title={item.alt}
                        loading="lazy"
                        allow="autoplay; encrypted-media; picture-in-picture; web-share"
                      />
                    </div>
                    <a
                      className="instagram-link"
                      href={item.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver video en YouTube
                    </a>
                  </article>
                );
              }

              return (
                <GalleryImageCard
                  key={`${item.src}-${index}`}
                  src={item.src}
                  alt={item.alt}
                  onOpen={() => openImage(item.imageIndex)}
                  ariaLabel={`Abrir imagen ${item.imageIndex + 1} de la galeria`}
                />
              );
            })}
          </div>
        </section>

        <section className="section card-section" id="prueba-social">
          <div className="section-head">
            <p className="eyebrow">Prueba social</p>
            <h2>Elegido por profesionales que valoran progreso y tiempo</h2>
          </div>
          <div className="testimonial-grid">
            {siteContent.testimonials.map((testimonial) => (
              <article className="card" key={`${testimonial.author}-${testimonial.quote}`}>
                <p>{`"${testimonial.quote}"`}</p>
                <strong>{testimonial.author}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="section compare" id="beneficios">
          <div className="section-head">
            <p className="eyebrow">Comparativo clave</p>
            <h2>Barranquito vs zonas saturadas</h2>
          </div>
          <div className="compare-table" role="table" aria-label="Comparativo de experiencia">
            <div className="row row-head" role="row">
              <div role="columnheader">Factor</div>
              <div role="columnheader">Barranquito</div>
              <div role="columnheader">Zonas mas saturadas</div>
            </div>
            {siteContent.comparisonRows.map((row) => (
              <div className="row" role="row" key={`${row.factor}-${row.barranquito}`}>
                <div role="cell">{row.factor}</div>
                <div role="cell">{row.barranquito}</div>
                <div role="cell">{row.crowded}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="section card-section" id="paquetes">
          <div className="section-head">
            <p className="eyebrow">Paquetes de progresion</p>
            <h2>Motor de reservas: arma tu mejor plan en 1 minuto</h2>
          </div>

          <div className="rates-strip">
            <div className="rate-chip">
              <p>Clase grupal</p>
              <strong>{toPen(siteContent.pricing.groupRate)} / clase</strong>
            </div>
            <div className="rate-chip">
              <p>Clase personalizada</p>
              <strong>{toPen(siteContent.pricing.privateRate)} / clase</strong>
            </div>
            <div className="rate-chip rate-chip-schedule">
              <p>Horarios</p>
              <div className="slot-list">
                {scheduleSlots.map((slot) => (
                  <span key={slot}>{slot}</span>
                ))}
              </div>
            </div>
          </div>

          <article className="booking-engine" id="planificador">
            <div className="booking-main">
              <div className="booking-step">
                <p className="booking-step-label">Paso 1</p>
                <h3>Elige tu paquete</h3>
                <button
                  type="button"
                  className={`individual-option${isIndividualClass ? " selected" : ""}`}
                  onClick={() => setSelectedPackageClasses(1)}
                >
                  <div className="package-option-top">
                    <strong>Clase individual</strong>
                    <span>Tarifa base</span>
                  </div>
                  <p>{toPen(selectedClassRate)}</p>
                  <small>Una clase suelta para probar la experiencia</small>
                </button>
                <p className="package-group-title">Paquetes con descuento</p>
                <div className="package-picker-grid">
                  {packagePlans.filter((plan) => plan.classes > 1).map((plan) => {
                    const packageRate =
                      selectedClassType === "grupal"
                        ? siteContent.pricing.groupRate
                        : siteContent.pricing.privateRate;
                    const packageBase = packageRate * plan.classes;
                    const packageFinal = packageBase * (1 - plan.discount);
                    const packageSave = packageBase - packageFinal;
                    const isSelected = selectedPackageClasses === plan.classes;

                    return (
                      <button
                        key={plan.classes}
                        type="button"
                        className={`package-option${isSelected ? " selected" : ""}`}
                        onClick={() => setSelectedPackageClasses(plan.classes)}
                      >
                        <div className="package-option-top">
                          <strong>{`${plan.classes} clases`}</strong>
                          <span>{`${Math.round(plan.discount * 100)}% dscto`}</span>
                        </div>
                        <p>{toPen(packageFinal)}</p>
                        <small>{`Ahorro: ${toPen(packageSave)}`}</small>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="booking-step">
                <p className="booking-step-label">Paso 2</p>
                <h3>Tipo de clase y horario</h3>
                <div className="booking-toggle-row">
                  <button
                    type="button"
                    className={`toggle-pill${selectedClassType === "grupal" ? " active" : ""}`}
                    onClick={() => setSelectedClassType("grupal")}
                  >
                    Grupal
                  </button>
                  <button
                    type="button"
                    className={`toggle-pill${selectedClassType === "personalizada" ? " active" : ""}`}
                    onClick={() => setSelectedClassType("personalizada")}
                  >
                    Personalizada
                  </button>
                </div>
                <div className="booking-form-grid">
                  <label>
                    Primera clase
                    <input
                      ref={firstClassDateInputRef}
                      type="date"
                      min={todayIso}
                      value={firstClassDate}
                      onChange={(event) => setFirstClassDate(event.target.value)}
                      onInput={syncPlannerFields}
                    />
                  </label>
                </div>
                <div className="slot-chip-list" role="group" aria-label="Horario preferido">
                  {scheduleSlots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        className={`slot-chip${isSelected ? " selected" : ""}`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="booking-step">
                <p className="booking-step-label">Paso 3</p>
                <h3>Frecuencia de clases</h3>
                <div className="booking-toggle-row">
                  <button
                    type="button"
                    className={`toggle-pill${planCadence === "consecutivas" ? " active" : ""}`}
                    onClick={() => setPlanCadence("consecutivas")}
                  >
                    Consecutivas
                  </button>
                  <button
                    type="button"
                    className={`toggle-pill${planCadence === "semanales" ? " active" : ""}`}
                    onClick={() => setPlanCadence("semanales")}
                  >
                    Semanales
                  </button>
                </div>

                {planCadence === "semanales" && (
                  <div className="planner-days">
                    <p>Dias de semana para tomar clases</p>
                    <div className="planner-day-list">
                      {weekdayOptions.map((day) => {
                        const isSelected = selectedWeekdays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            className={`day-chip${isSelected ? " selected" : ""}`}
                            onClick={() => toggleWeekday(day)}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                    {selectedWeekdays.length === 0 && (
                      <small>Selecciona al menos un dia para el plan semanal.</small>
                    )}
                  </div>
                )}
              </div>

              <div className="booking-step">
                <p className="booking-step-label">Paso 4</p>
                <h3>Tus datos de reserva</h3>
                <div className="booking-form-grid">
                  <label>
                    Nombre completo
                    <input
                      ref={customerNameInputRef}
                      type="text"
                      autoComplete="name"
                      placeholder="Ej. Andrea Salazar"
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      onInput={syncPlannerFields}
                    />
                  </label>
                  <label>
                    Correo
                    <input
                      ref={customerEmailInputRef}
                      type="email"
                      autoComplete="email"
                      placeholder="correo@ejemplo.com"
                      value={customerEmail}
                      onChange={(event) => setCustomerEmail(event.target.value)}
                      onInput={syncPlannerFields}
                    />
                  </label>
                  <label>
                    WhatsApp
                    <input
                      ref={customerWhatsappInputRef}
                      type="tel"
                      autoComplete="tel"
                      placeholder="+51 9XX XXX XXX"
                      value={customerWhatsapp}
                      onChange={(event) => setCustomerWhatsapp(event.target.value)}
                      onInput={syncPlannerFields}
                    />
                  </label>
                </div>
              </div>
            </div>

            <aside className="booking-summary" aria-live="polite">
              <p className="booking-step-label">Resumen en vivo</p>
              <h3>
                {isIndividualClass ? "Clase individual" : `${selectedPlan.classes} clases`} {selectedClassType}
              </h3>
              <p className="booking-total">{toPen(planFinal)}</p>
              <ul>
                <li>Tarifa base: {toPen(planBase)}</li>
                <li>Ahorro por paquete: {toPen(planSavings)}</li>
                <li>Horario elegido: {selectedSlot}</li>
                <li>Inicio: {resolvedFirstClassDate || "Por definir"}</li>
                <li>
                  Ritmo: {planCadence === "consecutivas" ? "Consecutivas" : `Semanales (${selectedWeekdays.join(", ") || "por definir"})`}
                </li>
              </ul>

              <a
                className={`btn btn-primary${isPlannerValid ? "" : " is-disabled"}`}
                href={isPlannerValid ? plannerHref : "#planificador"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => {
                  if (!isPlannerValid) {
                    event.preventDefault();
                    return;
                  }
                  trackCta("planner", `package_${selectedPlan.classes}_${selectedClassType}_${planCadence}`);
                }}
              >
                Enviar seleccion por WhatsApp
              </a>

              {!isPlannerValid && (
                <small className="planner-hint">
                  Completa nombre, correo valido, WhatsApp, fecha y dias (solo si es semanal).
                </small>
              )}
            </aside>
          </article>

          <p className="disclaimer">
            {`Tarifario actualizado: grupal ${toPen(siteContent.pricing.groupRate)} y personalizada ${toPen(siteContent.pricing.privateRate)} por clase. Descuentos por paquete ya aplicados automaticamente.`}
          </p>
        </section>

        <section className="section faq" id="faq">
          <div className="section-head">
            <p className="eyebrow">FAQ</p>
            <h2>Resolvemos dudas rapido</h2>
          </div>
          <div className="faq-list">
            {siteContent.faqItems.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="section final-cta" id="cta-final">
          <h2>{siteContent.texts.finalCtaTitle}</h2>
          <p>{siteContent.texts.finalCtaBody}</p>
          <a
            className="btn btn-primary"
            href="https://wa.me/51915168620?text=Hola%20Pacific%20Surf%20School%2C%20quiero%20reservar%20mi%20clase%20en%20Barranquito."
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCta("final_cta", "booking")}
          >
            {siteContent.texts.finalCtaButton}
          </a>
        </section>

        <section className="section beaches-section" id="playas">
          <div className="section-head">
            <p className="eyebrow">Nuestras playas</p>
            <h2>Playas donde dictamos clases</h2>
          </div>

          {beaches
            .filter((beach) => beach.main)
            .map((beach) => (
              <button
                type="button"
                className="beach-main-card beach-card-button"
                key={beach.name}
                onClick={() => openBeachModal(beach)}
                aria-label={`Ver detalles de ${beach.name}`}
              >
                <img src={beach.image} alt={beach.alt} loading="lazy" />
                <div className="beach-main-copy">
                  <p className="beach-tag">Playa principal</p>
                  <h3>{beach.name}</h3>
                  <p>{beach.description}</p>
                </div>
              </button>
            ))}

          <div className="beach-list">
            {beaches
              .filter((beach) => !beach.main)
              .map((beach) => (
                <button
                  type="button"
                  className="beach-item beach-card-button"
                  key={beach.name}
                  onClick={() => openBeachModal(beach)}
                  aria-label={`Ver detalles de ${beach.name}`}
                >
                  <img src={beach.image} alt={beach.alt} loading="lazy" />
                  <p>{beach.name}</p>
                </button>
              ))}
          </div>
        </section>

        <footer className="section site-footer" id="footer">
          <div className="footer-main">
            <div className="footer-brand">
              <a className="brand-link" href="#inicio" aria-label="Pacific Surf School inicio">
                <img className="brand-logo" src="/logo.png" alt="Pacific Surf School" />
                <span className="brand-text" aria-hidden="true">
                  <span className="brand-text-top">PACIFIC</span>
                  <span className="brand-text-bottom">Surf School</span>
                </span>
              </a>
              <p className="footer-claim">Surfea mejor, respira mejor, vive mejor en Barranquito.</p>
              <p className="footer-note">Clases para adultos, niveles inicial e intermedio. Cupos limitados.</p>
            </div>

            <nav className="footer-nav" aria-label="Navegacion de pie de pagina">
              <p>Navegacion</p>
              <a href="#experiencia">Experiencia</a>
              <a href="#galeria">Galeria</a>
              <a href="#paquetes">Paquetes</a>
              <a href="#prueba-social">Testimonios</a>
            </nav>

            <div className="footer-social">
              <p>Siguenos</p>
              <a
                href={siteContent.media.instagramProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCta("footer", "instagram")}
              >
                Instagram
              </a>
              <a
                href="https://wa.me/51915168620?text=Hola%20Pacific%20Surf%20School%2C%20quiero%20informacion%20de%20paquetes%20de%20surf."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCta("footer", "whatsapp")}
              >
                WhatsApp
              </a>
              <a href="#inicio" onClick={() => trackCta("footer", "home")}>Volver arriba</a>
            </div>
          </div>

          <div className="footer-legal">
            <p>© {new Date().getFullYear()} Pacific Surf School. Todos los derechos reservados.</p>
          </div>
        </footer>
      </main>

      <a
        className="sticky-whatsapp"
        href="https://wa.me/51915168620?text=Hola%20Pacific%20Surf%20School%2C%20quiero%20informacion%20de%20paquetes%20de%20surf."
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackCta("sticky", "packages")}
      >
        Reserva tu clase
      </a>

      {activeBeach && (
        <div className="beach-modal" role="dialog" aria-modal="true" aria-label={`Detalles de ${activeBeach.name}`}>
          <button type="button" className="beach-modal-backdrop" onClick={closeBeachModal} aria-label="Cerrar" />
          <article className="beach-modal-card">
            <button type="button" className="beach-modal-close" onClick={closeBeachModal} aria-label="Cerrar detalles">
              ×
            </button>
            <img src={activeBeach.image} alt={activeBeach.alt} loading="lazy" />
            <div className="beach-modal-body">
              <p className="beach-tag">Detalles de spot</p>
              <h3>{activeBeach.name}</h3>
              <p>{activeBeach.description}</p>
              <p>
                <strong>Nivel recomendado:</strong> {activeBeach.level}
              </p>
              <p>
                <strong>Mejor ventana:</strong> {activeBeach.bestWindow}
              </p>

              <h4>Tips de sesion</h4>
              <ul>
                {activeBeach.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>

              <a
                className="btn btn-primary"
                href={activeBeach.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("beach_maps_open", { beach: activeBeach.name, locale: "es" })}
              >
                Ver ubicacion en Google Maps
              </a>
            </div>
          </article>
        </div>
      )}

      {activeImage && (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label="Imagen ampliada">
          <button className="lightbox-backdrop" type="button" onClick={closeImage} aria-label="Cerrar" />
          <div className="lightbox-content">
            <button
              type="button"
              className="lightbox-arrow left"
              onClick={showPrevImage}
              aria-label="Imagen anterior"
            >
              ‹
            </button>
            <figure className="lightbox-figure">
              <img src={activeImage.src} alt={activeImage.alt} />
              <figcaption>{activeImage.alt}</figcaption>
            </figure>
            <button
              type="button"
              className="lightbox-arrow right"
              onClick={showNextImage}
              aria-label="Imagen siguiente"
            >
              ›
            </button>
            <button type="button" className="lightbox-close" onClick={closeImage} aria-label="Cerrar galeria">
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
