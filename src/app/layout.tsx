import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { RootProviders } from "@/providers/root-providers";
import { BRAND } from "@/lib/constants";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: BRAND.tagline,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  keywords: ["gaming spend", "tracker", "steam", "roblox", "xbox", "budget", "subscriptions"],
  metadataBase: new URL(BRAND.url),
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: "Know exactly how much you've spent across every game, DLC, battle pass and skin.",
    type: "website",
    siteName: BRAND.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: "The home for your gaming spending.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background">
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
