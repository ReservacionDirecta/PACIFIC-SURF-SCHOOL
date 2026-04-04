import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "Escuela de Surf Premium en Barranquito | Paquetes 4 y 8 Clases | Pacific Surf School",
  description:
    "Mejora tu surf en Barranquito sin la saturacion de Makaha. Paquetes de 4 y 8 clases para ejecutivos en Lima. Reserva por WhatsApp y paga con Yape o Plin.",
  alternates: {
    canonical: "/",
    languages: {
      "es-PE": "/",
      "en-US": "/en",
    },
  },
  openGraph: {
    title:
      "Surf premium en Barranquito para ejecutivos de Lima | Pacific Surf School",
    description:
      "Paquetes de progresion 4 y 8 clases con reserva por WhatsApp y pago por Yape/Plin.",
    type: "website",
    locale: "es_PE",
    siteName: "Pacific Surf School",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
