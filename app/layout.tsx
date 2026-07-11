import type { Metadata } from "next";
import { Poppins, Space_Grotesk } from "next/font/google";
import { Toaster as Sonner } from "@/components/ui/sonner";
import "./globals.css";
import Providers from "@/hooks/providers";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const space = Space_Grotesk({
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_DOMAIN_URL!),
  title: {
    default: "CSS UNILA 3.0",
    template: "%s | CSS UNILA 3.0",
  },
  description: "CSS UNILA 3.0 adalah event perlombaan teknologi dan olahraga yang diselenggarakan oleh Himakom Jurusan Ilmu Komputer Universitas Lampung.",
  keywords: [
    "CSS UNILA",
    "CSS 3.0",
    "event UNILA",
    "lomba komputer",
    "lomba mahasiswa",
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  authors: [{ name: "CSS UNILA" }],
  openGraph: {
    title: "CSS UNILA 3.0",
    url: process.env.NEXT_PUBLIC_DOMAIN_URL!,
    description: "Ikuti berbagai perlombaan menarik dalam event CSS UNILA 3.0.",
    images: [
      {
        url: `/css-logo.png`,
        width: 1200,
        height: 630,
        alt: "CSS UNILA 3.0",
      },
    ],
    locale: "id_ID",
    type: "website",
    siteName: "CSS UNILA 3.0",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSS UNILA 3.0",
    description:
    "Ikuti berbagai perlombaan dalam event CSS UNILA 3.0.",
    images: ["/css-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${poppins.variable} ${space.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full">
        <Sonner />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
