import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RentAwas - Manage Spaces. Elevate Lives.",
  description:
    "The ultimate mission control for rental ecosystems. Automate rent collection, streamline maintenance, and maximize yield with precision.",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

import { ToastProvider } from "@/components/ui/Toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} antialiased`}>
      <body className="min-h-screen bg-[#F9FAFB] text-slate-950 font-sans selection:bg-orange-100 selection:text-orange-600">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
