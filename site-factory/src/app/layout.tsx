import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/shared/providers/theme-provider";

export const metadata: Metadata = {
  title: "Site Factory",
  description: "Gestion des clients et projets - Site Factory",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
