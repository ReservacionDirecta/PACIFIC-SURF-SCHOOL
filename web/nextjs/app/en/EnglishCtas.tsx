"use client";

import { trackEvent } from "../../lib/analytics";

type EnglishCtasProps = {
  primaryHref: string;
};

export default function EnglishCtas({ primaryHref }: EnglishCtasProps) {
  return (
    <div className="cta-row">
      <a
        className="btn btn-primary"
        href={primaryHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          trackEvent("cta_whatsapp_click", {
            placement: "en_hero",
            offer: "package_info",
            locale: "en",
          })
        }
      >
        Book on WhatsApp
      </a>
      <a className="btn btn-secondary" href="/">
        Ver version en Espanol
      </a>
    </div>
  );
}
