import type { Metadata, Viewport } from "next";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "@fontsource/plus-jakarta-sans/800-italic.css";
import "./globals.css";
import { ProgressoProvider } from "@/lib/progresso";
import { GlossarioProvider } from "@/components/glossario";
import { ContaProvider } from "@/lib/conta";

export const metadata: Metadata = {
  title: "politiQ",
  description: "Política brasileira do zero: trilhas, quizzes e o Voto às Cegas.",
  icons: { apple: "/icones/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "politiQ", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh bg-branco">
        <ContaProvider>
          <ProgressoProvider>
            <GlossarioProvider>{children}</GlossarioProvider>
          </ProgressoProvider>
        </ContaProvider>
      </body>
    </html>
  );
}
