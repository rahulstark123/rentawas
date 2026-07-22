import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${jakarta.variable} antialiased`}>
      <body className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-600">
        {children}
      </body>
    </html>
  );
}
