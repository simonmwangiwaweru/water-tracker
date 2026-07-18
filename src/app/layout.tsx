import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Water Debt Tracker",
  description: "Track who owes what for water deliveries.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Water Debts",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#fcf8fa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
      />
      <body className="min-h-full flex flex-col bg-background text-on-background font-sans">
        <AppProviders>
          <Header />
          <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 pb-24 md:pb-4">
            {children}
          </main>
          <BottomNav />
        </AppProviders>
      </body>
    </html>
  );
}
