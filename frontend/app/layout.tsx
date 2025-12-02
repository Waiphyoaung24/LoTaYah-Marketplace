import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import { Navigation } from "@/components/Navigation";
import { CartDrawer } from "@/components/CartDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LoTaYah - Everything You Desire",
  description: "Welcome to LoTaYah. Whether you're setting up a digital storefront or looking for unique treasures, we connect you directly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          <div className="min-h-screen bg-gradient-to-b from-[#fdfbf7] via-[#f8f2e7] to-[#f4e5c7]">
            <Navigation />
            <main className="min-h-screen text-stone-900">
              {children}
            </main>
            <CartDrawer />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
