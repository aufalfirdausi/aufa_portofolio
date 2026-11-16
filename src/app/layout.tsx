import type { Metadata } from "next";
import localFont from "next/font/local";
import { site } from "@/content/cards";
import "./globals.css";

const serif = localFont({
  src: "./fonts/dm-serif-display.woff2",
  variable: "--font-serif",
  weight: "400",
});

const body = localFont({
  src: "./fonts/outfit.woff2",
  variable: "--font-body",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${serif.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
