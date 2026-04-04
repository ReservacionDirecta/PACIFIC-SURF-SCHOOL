import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Premium Surf School in Barranquito | 4 and 8 Class Progression Packages | Pacific Surf School",
  description:
    "Progress faster in Barranquito, away from crowded Makaha peaks. 4 and 8 class packages for Lima professionals. Book via WhatsApp and pay with Yape or Plin.",
  alternates: {
    canonical: "/en",
    languages: {
      "es-PE": "/",
      "en-US": "/en",
    },
  },
};

export default function EnglishPage() {
  return (
    <main className="section" style={{ paddingTop: "5rem", paddingBottom: "6rem" }}>
      <p className="eyebrow">Barranquito, Lima</p>
      <h1>Premium Surf in Barranquito, Without Makaha Crowds</h1>
      <p className="lead" style={{ maxWidth: "62ch" }}>
        For Lima professionals who want consistent progression, simple WhatsApp booking, and local payment through Yape or Plin.
      </p>

      <div className="cta-row">
        <a
          className="btn btn-primary"
          href="https://wa.me/51915168620?text=Hi%20Pacific%20Surf%20School%2C%20I%20want%20to%20book%20a%20surf%20plan%20in%20Barranquito."
          target="_blank"
          rel="noopener noreferrer"
        >
          Book on WhatsApp
        </a>
        <a className="btn btn-secondary" href="/">
          Ver version en Espanol
        </a>
      </div>

      <section className="card-section" style={{ marginTop: "2rem" }}>
        <div className="section-head">
          <h2>Progression Packages</h2>
        </div>
        <div className="pricing-grid">
          <article className="price-card">
            <p className="badge">Recommended Start</p>
            <h3>4-Class Package</h3>
            <p className="price">
              S/ 760 <span>(S/ 190 per class)</span>
            </p>
            <ul>
              <li>Build your technical base</li>
              <li>WhatsApp follow-up support</li>
              <li>Estimated savings vs single sessions</li>
            </ul>
          </article>

          <article className="price-card featured">
            <p className="badge">Best Value</p>
            <h3>8-Class Package</h3>
            <p className="price">
              S/ 1,360 <span>(S/ 170 per class)</span>
            </p>
            <ul>
              <li>Accelerated progression and consistency</li>
              <li>Priority scheduling</li>
              <li>Lower cost per class</li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
