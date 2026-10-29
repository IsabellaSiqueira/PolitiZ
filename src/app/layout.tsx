import type { Metadata, Viewport } from "next";
import "@fontsource/archivo/400.css";
import "@fontsource/archivo/600.css";
import "@fontsource/archivo/700.css";
import "@fontsource/archivo/900.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./globals.css";
import { ProgressoProvider } from "@/lib/progresso";

export const metadata: Metadata = {
  title: "politiQ",
  description: "Política brasileira do zero: trilhas, quizzes e o Voto às Cegas.",
};

export const viewport: Viewport = {
  themeColor: "#3346ff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh bg-azul">
        <ProgressoProvider>{children}</ProgressoProvider>
      </body>
    </html>
  );
}
