"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRef } from "react";
import { trackEvent } from "./lib/analytics";

const HERO_VIDEO_ID = (process.env.NEXT_PUBLIC_HERO_VIDEO_ID || "7gWl1-k6QpE").trim();
const HERO_POSTER = process.env.NEXT_PUBLIC_HERO_POSTER || "/media/hero-poster.svg";
const HERO_EMBED = HERO_VIDEO_ID
  ? `https://www.youtube-nocookie.com/embed/${HERO_VIDEO_ID}?autoplay=1&mute=1&controls=0&loop=1&playlist=${HERO_VIDEO_ID}&modestbranding=1&playsinline=1&rel=0&disablekb=1&fs=0&iv_load_policy=3&cc_load_policy=0&enablejsapi=1`
  : "";
const STORY_VIDEO_ID = (process.env.NEXT_PUBLIC_STORY_VIDEO_ID || HERO_VIDEO_ID).trim();
const STORY_EMBED = STORY_VIDEO_ID
  ? `https://www.youtube-nocookie.com/embed/${STORY_VIDEO_ID}?autoplay=1&mute=1&controls=0&loop=1&playlist=${STORY_VIDEO_ID}&modestbranding=1&playsinline=1&rel=0&disablekb=1&fs=0&iv_load_policy=3&cc_load_policy=0&enablejsapi=1`
  : "";

const GROUP_RATE = 110;
const PRIVATE_RATE = 150;
const scheduleSlots = ["6:00", "8:00", "10:00", "4:00"];
const packagePlans = [
  { classes: 1, discount: 0 },
  { classes: 4, discount: 0.05 },
  { classes: 8, discount: 0.1 },
  { classes: 12, discount: 0.15 },
  { classes: 16, discount: 0.2 },
];
const weekdayOptions = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

const galleryImages = [
  {
    src: "/media/session-a.svg",
    alt: "Alumno practicando take off en Barranquito",
  },
  {
    src: "/media/session-b.svg",
    alt: "Vista abierta del mar en Costa Verde durante clase",
  },
  {
    src: "/media/session-c.svg",
    alt: "Instructor corrigiendo postura antes de entrar al agua",
  },
  {
    src: "/media/session-a.svg",
    alt: "Alumno sonriendo despues de una buena ola",
  },
  {
    src: "/media/session-b.svg",
    alt: "Sesion de surf al atardecer en Barranquito",
  },
  {
    src: "/media/session-c.svg",
    alt: "Momento de remada y enfoque tecnico en clase",
  },
];

const beaches = [
  {
    name: "Barranquito",
    image: "/media/session-a.svg",
    alt: "Olas en Barranquito para clase de surf",
    main: true,
    description:
      "Nuestro punto base en Lima por su entorno mas ordenado para aprendizaje, sesiones progresivas y experiencia premium para alumnos locales y corporativos.",
  },
  {
    name: "La Pampilla",
    image: "/media/session-b.svg",
    alt: "Vista de La Pampilla en la Costa Verde",
  },
  {
    name: "Redondo",
    image: "/media/session-c.svg",
    alt: "Playa Redondo en Lima para sesiones de surf",
  },
  {
    name: "Punta Roquitas",
    image: "/media/session-a.svg",
    alt: "Zona de Punta Roquitas para practica de surf",
  },
  {
    name: "Triangulo",
    image: "/media/session-b.svg",
    alt: "Spot Triangulo con olas en Costa Verde",
  },
  {
    name: "San Bartolo",
    image: "/media/session-c.svg",
    alt: "Mar en San Bartolo para clases avanzadas",
  },
];

const toPen = (value: number) => `S/.${Math.round(value)}`;

export default function SurfWellnessLanding() {
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [selectedPackageClasses, setSelectedPackageClasses] = useState<number>(8);
  const [selectedClassType, setSelectedClassType] = useState<"grupal" | "personalizada">("grupal");
  const [planCadence, setPlanCadence] = useState<"consecutivas" | "semanales">("consecutivas");
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
  const [firstClassDate, setFirstClassDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>(scheduleSlots[0]);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState<string>("");
  const heroFrameRef = useRef<HTMLIFrameElement | null>(null);
  const storyFrameRef = useRef<HTMLIFrameElement | null>(null);

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

  const selectedPlan = useMemo(
    () => packagePlans.find((plan) => plan.classes === selectedPackageClasses) || packagePlans[0],
    [selectedPackageClasses]
  );

  const selectedClassRate = selectedClassType === "grupal" ? GROUP_RATE : PRIVATE_RATE;
  const planBase = selectedClassRate * selectedPlan.classes;
  const planFinal = planBase * (1 - selectedPlan.discount);
  const planSavings = planBase - planFinal;
  const isIndividualClass = selectedPlan.classes === 1;
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim());

  const toggleWeekday = (day: string) => {
    setSelectedWeekdays((current) =>
      current.includes(day) ? current.filter((value) => value !== day) : [...current, day]
    );
  };

  const isPlannerValid =
    customerName.trim().length > 1 &&
    emailLooksValid &&
    customerWhatsapp.trim().length > 7 &&
    firstClassDate &&
    selectedSlot &&
    (planCadence === "consecutivas" || selectedWeekdays.length > 0);

  const planningModeDetail =
    planCadence === "consecutivas"
      ? "Tomare las clases de forma consecutiva segun disponibilidad."
      : `Tomare las clases semanalmente en estos dias: ${selectedWeekdays.join(", ")}.`;

  const plannerMessage = [
    "Hola Pacific Surf School, quiero reservar mi plan de clases.",
    `Nombre: ${customerName.trim() || "Por confirmar"}`,
    `Correo: ${customerEmail.trim() || "Por confirmar"}`,
    `WhatsApp cliente: ${customerWhatsapp.trim() || "Por confirmar"}`,
    `${isIndividualClass ? "Clase elegida" : "Paquete elegido"}: ${selectedPlan.classes} ${
      selectedPlan.classes === 1 ? "clase" : "clases"
    }${selectedPlan.discount > 0 ? ` (${Math.round(selectedPlan.discount * 100)}% dscto)` : ""}`,
    `Tipo de clase: ${selectedClassType}`,
    `Primera clase: ${firstClassDate || "Por confirmar"}`,
    `Horario preferido: ${selectedSlot || "Por confirmar"}`,
    `Modalidad: ${planCadence}`,
    planningModeDetail,
    `Monto estimado del plan: ${toPen(planFinal)}.`,
    "Confirmen disponibilidad y pasos para pago por Yape/Plin.",
  ].join("\n");

  const plannerHref = `https://wa.me/51915168620?text=${encodeURIComponent(plannerMessage)}`;

  const activeImage = useMemo(() => {
    if (activeImageIndex === null) return null;
    return galleryImages[activeImageIndex] || null;
  }, [activeImageIndex]);

  const openImage = (index: number) => {
    setActiveImageIndex(index);
    trackEvent("gallery_image_open", { index, locale: "es" });
  };

  const closeImage = () => setActiveImageIndex(null);

  const showPrevImage = () => {
    if (activeImageIndex === null) return;
    const nextIndex = (activeImageIndex - 1 + galleryImages.length) % galleryImages.length;
    setActiveImageIndex(nextIndex);
  };

  const showNextImage = () => {
    if (activeImageIndex === null) return;
    const nextIndex = (activeImageIndex + 1) % galleryImages.length;
    setActiveImageIndex(nextIndex);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (activeImageIndex === null) return;
      if (event.key === "Escape") closeImage();
      if (event.key === "ArrowLeft") showPrevImage();
      if (event.key === "ArrowRight") showNextImage();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeImageIndex]);

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
  }, []);

  return (
    <>
      <div className="bg-grain" />
      <header className="hero" id="inicio">
        <div className="hero-media" aria-hidden="true">
          <div className="hero-poster" style={{ backgroundImage: `url(${HERO_POSTER})` }} />
          {HERO_EMBED ? (
            <iframe
              ref={heroFrameRef}
              className="hero-video"
              src={HERO_EMBED}
              title="Alumno tomando clase de surf en Barranquito"
              loading="eager"
              onLoad={() => syncYoutubePlayer(heroFrameRef.current)}
              allow="autoplay; encrypted-media; picture-in-picture"
            />
          ) : null}
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
            <div className="topbar-actions">
              <a className="link-chip" href="#experiencia">Experiencia</a>
              <a className="link-chip" href="#paquetes">Paquetes</a>
              <a className="link-chip link-chip-cta" href="#playas">Playas</a>
            </div>
          </nav>

          <div className="hero-grid">
            <article className="hero-content">
              <p className="eyebrow">Barranquito, Lima</p>
              <h1>Surf en Lima, bien hecho y sin el caos de spots saturados</h1>
              <p className="lead">
                Somos Pacific Surf School. Clases claras, progreso real y buena vibra en Barranquito para gente que quiere aprender de verdad.
              </p>

              <ul className="hero-points">
                <li>Horarios que si calzan con tu semana: 6:00, 8:00, 10:00 y 4:00</li>
                <li>Paquetes con descuento y coordinacion rapida por WhatsApp</li>
              </ul>

              <div className="cta-row">
                <a
                  className="btn btn-primary"
                  href="https://wa.me/51915168620?text=Hola%20Pacific%20Surf%20School%2C%20quiero%20mi%20plan%20de%20surf%20en%20Barranquito."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCta("hero", "plan")}
                >
                  Quiero mi plan por WhatsApp
                </a>
                <a className="btn btn-secondary" href="#paquetes">
                  Ver tarifas y paquetes
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
          <p>
            No vendemos una clase suelta. Disenamos una experiencia de progreso para que vuelvas al trabajo con energia, foco y la sensacion real de haber avanzado.
          </p>
        </section>

        <section className="section media-strip" id="experiencia">
          <div className="section-head">
            <p className="eyebrow">Experiencia real</p>
            <h2>Lo que hace distinta a la escuela se ve y se siente</h2>
          </div>
          <div className="story-grid">
            <article className="story-video-wrap">
              {STORY_EMBED ? (
                <iframe
                  ref={storyFrameRef}
                  className="story-video"
                  src={STORY_EMBED}
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
            <p className="eyebrow">Galeria</p>
            <h2>La energia real de cada sesion, en imagenes</h2>
          </div>
          <div className="gallery-masonry">
            {galleryImages.map((image, index) => (
              <button
                key={image.src}
                type="button"
                className="gallery-item"
                onClick={() => openImage(index)}
                aria-label={`Abrir imagen ${index + 1} de la galeria`}
              >
                <img src={image.src} alt={image.alt} loading="lazy" />
              </button>
            ))}
          </div>
        </section>

        <section className="section card-section" id="prueba-social">
          <div className="section-head">
            <p className="eyebrow">Prueba social</p>
            <h2>Elegido por profesionales que valoran progreso y tiempo</h2>
          </div>
          <div className="testimonial-grid">
            <article className="card">
              <p>
                "La coordinacion por WhatsApp me ahorro tiempo. En pocas sesiones ya senti progreso real."
              </p>
              <strong>Profesional de tecnologia, 34</strong>
            </article>
            <article className="card">
              <p>
                "Buscaba desconectar sin caos en el agua. Barranquito fue justo lo que necesitaba."
              </p>
              <strong>Consultora, 29</strong>
            </article>
            <article className="card">
              <p>
                "El plan de 8 clases me dio continuidad. No perdi ritmo entre semana y semana."
              </p>
              <strong>Gerente comercial, 41</strong>
            </article>
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
            <div className="row" role="row">
              <div role="cell">Flujo de sesion</div>
              <div role="cell">Mas ordenado para practicar tecnica</div>
              <div role="cell">Mayor congestion en horas pico</div>
            </div>
            <div className="row" role="row">
              <div role="cell">Experiencia para ejecutivos</div>
              <div role="cell">Ambiente premium y enfocado</div>
              <div role="cell">Mayor ruido y friccion</div>
            </div>
            <div className="row" role="row">
              <div role="cell">Continuidad</div>
              <div role="cell">Mejor para rutas de 4 y 8 clases</div>
              <div role="cell">Mas interrupciones en sesion</div>
            </div>
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
              <strong>{toPen(GROUP_RATE)} / clase</strong>
            </div>
            <div className="rate-chip">
              <p>Clase personalizada</p>
              <strong>{toPen(PRIVATE_RATE)} / clase</strong>
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
                    const packageRate = selectedClassType === "grupal" ? GROUP_RATE : PRIVATE_RATE;
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
                      type="date"
                      min={todayIso}
                      value={firstClassDate}
                      onChange={(event) => setFirstClassDate(event.target.value)}
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
                      type="text"
                      placeholder="Ej. Andrea Salazar"
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                    />
                  </label>
                  <label>
                    Correo
                    <input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={customerEmail}
                      onChange={(event) => setCustomerEmail(event.target.value)}
                    />
                  </label>
                  <label>
                    WhatsApp
                    <input
                      type="tel"
                      placeholder="+51 9XX XXX XXX"
                      value={customerWhatsapp}
                      onChange={(event) => setCustomerWhatsapp(event.target.value)}
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
                <li>Inicio: {firstClassDate || "Por definir"}</li>
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
            Tarifario actualizado: grupal S/.110 y personalizada S/.150 por clase. Descuentos por paquete ya aplicados automaticamente.
          </p>
        </section>

        <section className="section faq" id="faq">
          <div className="section-head">
            <p className="eyebrow">FAQ</p>
            <h2>Resolvemos dudas rapido</h2>
          </div>
          <div className="faq-list">
            <details>
              <summary>Nunca hice surf. Puedo empezar?</summary>
              <p>Si. El plan esta pensado para iniciar desde cero y progresar por etapas.</p>
            </details>
            <details>
              <summary>Como pago y confirmo mi cupo?</summary>
              <p>
                Se coordina por WhatsApp y la confirmacion se realiza con pago por Yape o Plin.
              </p>
            </details>
            <details>
              <summary>Cuanto tardan en responder?</summary>
              <p>Objetivo operativo: menos de 10 minutos en horario de atencion.</p>
            </details>
          </div>
        </section>

        <section className="section final-cta" id="cta-final">
          <h2>Reserva hoy y convierte el mar en tu mejor rutina de bienestar</h2>
          <p>
            Escribenos por WhatsApp, recibe recomendacion en minutos y asegura tu horario en Barranquito.
          </p>
          <a
            className="btn btn-primary"
            href="https://wa.me/51915168620?text=Hola%20Pacific%20Surf%20School%2C%20quiero%20reservar%20mi%20clase%20en%20Barranquito."
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCta("final_cta", "booking")}
          >
            Reservar por WhatsApp ahora
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
              <article className="beach-main-card" key={beach.name}>
                <img src={beach.image} alt={beach.alt} loading="lazy" />
                <div className="beach-main-copy">
                  <p className="beach-tag">Playa principal</p>
                  <h3>{beach.name}</h3>
                  <p>{beach.description}</p>
                </div>
              </article>
            ))}

          <div className="beach-list">
            {beaches
              .filter((beach) => !beach.main)
              .map((beach) => (
                <article className="beach-item" key={beach.name}>
                  <img src={beach.image} alt={beach.alt} loading="lazy" />
                  <p>{beach.name}</p>
                </article>
              ))}
          </div>
        </section>

        <footer className="section site-footer" id="footer">
          <div className="footer-brand">
            <a className="brand-link" href="#inicio" aria-label="Pacific Surf School inicio">
              <img className="brand-logo" src="/logo.png" alt="Pacific Surf School" />
              <span className="brand-text" aria-hidden="true">
                <span className="brand-text-top">PACIFIC</span>
                <span className="brand-text-bottom">Surf School</span>
              </span>
            </a>
            <p>Escuela de surf premium e independiente en Barranquito, Lima.</p>
          </div>
          <div className="footer-links">
            <a href="#experiencia">Experiencia</a>
            <a href="#galeria">Galeria</a>
            <a href="#paquetes">Paquetes</a>
            <a
              href="https://wa.me/51915168620?text=Hola%20Pacific%20Surf%20School%2C%20quiero%20informacion%20de%20paquetes%20de%20surf."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCta("footer", "packages")}
            >
              WhatsApp
            </a>
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
