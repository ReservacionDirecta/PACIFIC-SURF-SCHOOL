import type { Metadata } from "next";
import EnglishCtas from "./EnglishCtas";

const EN_WA_HREF =
  "https://wa.me/51915168620?text=Hi%20Pacific%20Surf%20School%2C%20I%20want%20to%20book%20a%20surf%20plan%20in%20Barranquito.";

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

      <EnglishCtas primaryHref={EN_WA_HREF} />

      <section className="card-section" style={{ marginTop: "2rem" }}>
        <div className="section-head">
          <h2>Progression Packages</h2>
        </div>
        <div className="pricing-grid">
          <article className="price-card">
            <p className="badge">Recommended Start</p>
            <h3>4-Class Package</h3>
            <p className="price">
              S/ 418 <span>(Group base S/ 110 per class)</span>
            </p>
            <ul>
              <li>Build your technical base</li>
              <li>5% package discount already applied</li>
              <li>WhatsApp follow-up support</li>
              <li>Yape/Plin payment support</li>
            </ul>
          </article>

          <article className="price-card featured">
            <p className="badge">Best Value</p>
            <h3>8-Class Package</h3>
            <p className="price">
              S/ 792 <span>(Group base S/ 110 per class)</span>
            </p>
            <ul>
              <li>10% package discount already applied</li>
              <li>Accelerated progression and consistency</li>
              <li>Priority scheduling</li>
              <li>Fast coordination on WhatsApp</li>
            </ul>
          </article>
        </div>
        <p style={{ marginTop: "0.8rem", opacity: 0.86 }}>
          Also available: private classes at S/ 150 per class and extended plans (12/16 classes).
        </p>
      </section>
    </main>
  );
}
