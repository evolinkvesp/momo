import type { Metadata, Viewport } from "next";
import { Outfit, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "Momo",
    template: "%s · Momo",
  },
  description:
    "Acompanhe suas doses, peso, dieta e estoque de Mounjaro em um só lugar.",
  manifest: "/manifest.json",
  applicationName: "Momo",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${syne.variable}`}>
      <body className={`${outfit.className} font-sans bg-[#0d0d0d]`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
