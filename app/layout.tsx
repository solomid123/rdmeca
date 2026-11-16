import type { Metadata } from "next";
import {headers} from 'next/headers';
import {getSiteOrigin} from '../lib/site-origin';
import "./globals.css";

export function generateMetadata(): Metadata {return {
  title: {default: "R&D MECA — Ingénierie & maintenance industrielle", template: "%s — R&D MECA"},
  description: "R&D MECA au Maroc : conception mécanique, calcul, industrialisation et maintenance industrielle.",
  metadataBase: new URL(getSiteOrigin()),
  icons: {
    icon: "/assets/favicon.png",
    shortcut: "/assets/favicon.png",
  },
};}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang=(await headers()).get('x-rdmeca-lang')==='en'?'en':'fr';
  return (
    <html lang={lang}>
      <head>
        <link rel="preload" href="/assets/fonts/neue-einstellung-regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/assets/fonts/neue-einstellung-extrabold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
