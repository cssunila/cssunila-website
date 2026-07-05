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
  title: "CSS UNILA 3.0",
  description: "CSS UNILA 3.0 adalah event terbesar bagi himakom yang mencakup berbagai sekolah di provinsi lampung.",
  keywords: [
    "CSS UNILA 3.0",
    "CSS UNILA 3.0 Platform",
    "CSS UNILA 3.0 Platform Digital",
    "CSS UNILA 3.0 Event",
    "CSS UNILA 3.0 Event Unila",
    "CSS UNILA 3.0 Platform Digital Unila",
    "CSS UNILA 3.0 Platform Digital Unila Terbesar Himakom",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    }
  },
  authors: [
    {
      name: "M. Rafly Saputra",
      url: "https://github.com/Raflysaputra23",
    },
  ],
  openGraph: {
    title: "CSS UNILA 3.0",
    description: "CSS UNILA 3.0 adalah event terbesar bagi himakom yang mencakup berbagai sekolah di provinsi lampung.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_DOMAIN_URL!}/css-logo.png`,
        width: 800,
        height: 600,
      },
    ],
    siteName: "CSS UNILA 3.0",
  }
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
