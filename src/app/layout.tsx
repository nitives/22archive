import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { APP, SEO } from "@/conf/constants";
import { serverEnv } from "@/conf/env/server";
import { Titlebar } from "@/components/title-bar";
import "./globals.css";
import { AudioProvider } from "@/features/audio/audio-provider";
import { Controls } from "@/components/controls";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP.NAME,
  description: APP.DESCRIPTION,
  applicationName: APP.NAME,
  authors: [{ name: APP.AUTHOR.NAME, url: APP.AUTHOR.TWITTER }],
  creator: APP.AUTHOR.NAME,
  keywords: SEO.KEYWORDS,
  icons: {
    icon: [
      {
        rel: "icon",
        media: "(prefers-color-scheme: light)",
        url: "/icons/favicon-light.ico",
      },
      {
        rel: "icon",
        media: "(prefers-color-scheme: dark)",
        url: "/icons/favicon-dark.ico",
      },
    ],
    apple: [
      {
        rel: "apple-touch-icon",
        sizes: "500x500",
        url: "/icons/icon-light.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        rel: "apple-touch-icon",
        sizes: "500x500",
        url: "/icons/icon-dark.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistMono.variable} antialiased`}>
        <AudioProvider>
          <Titlebar />
          {children}
          <Controls maintenanceMode={serverEnv.maintenanceMode} />
        </AudioProvider>
      </body>
    </html>
  );
}
