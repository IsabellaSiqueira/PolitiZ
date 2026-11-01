import type { MetadataRoute } from "next";

/**
 * PWA (Y13): instalável na tela inicial pelo navegador, sem loja. Sem modo offline: não há
 * service worker, e sem conexão o app avisa (tela "Sem internet" do protótipo).
 * O ícone é provisório (o Q do logo); o definitivo é da Isa.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "politiQ",
    short_name: "politiQ",
    description: "Política brasileira do zero: trilhas, quizzes e o Voto às Cegas.",
    lang: "pt-BR",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icones/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icones/icone-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icones/icone-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
