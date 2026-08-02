import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { CurrencyProvider } from "@/context/CurrencyContext";
import JsonLd from "@/components/seo/JsonLd";
import QueryProvider from "@/components/providers/QueryProvider";

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

export const viewport: Viewport = {
  themeColor: "#FF6B00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://rentawas.com"),
  title: {
    default: "RentAwas — #1 Property Management Software & Rent Collection App",
    template: "%s | RentAwas",
  },
  description:
    "RentAwas is India's leading property management & 0% fee rent collection software for landlords, PG owners & tenants. Automate rent collection via GPay, PhonePe, Paytm, Razorpay & Stripe, track NOI, manage leases, and connect with certified local maintenance experts.",
  keywords: [
    "RentAwas",
    "Rent Awas",
    "RentAwas app",
    "RentAwas login",
    "RentAwas portal",
    "property management software",
    "property management software India",
    "PG management app",
    "PG owner software",
    "0% fee rent collection app",
    "GPay rent collection for landlords",
    "PhonePe landlord UPI payment",
    "Paytm rent payment app",
    "Razorpay rent payment software",
    "landlord property management software",
    "tenant pay rent portal",
    "rent receipt generator India",
    "rental yield calculator",
    "maintenance request management software",
    "PG tenant management software",
    "commercial property management app",
    "apartment rental software",
    "digital lease agreement India",
    "Regency Property Management RentAwas",
  ],
  authors: [{ name: "ANSH Apps", url: "https://rentawas.com" }],
  creator: "RentAwas Real Estate Technology",
  publisher: "RentAwas Inc.",
  applicationName: "RentAwas",
  category: "Property Management & Real Estate Technology",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/icon.png",
    apple: [
      { url: "/icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "RentAwas — #1 Property Management Software & Rent Collection App",
    description:
      "Automate 0% landlord fee rent collection via GPay, PhonePe, Paytm, Razorpay & Stripe. Manage rental units, track NOI, and connect with certified local maintenance experts.",
    url: "https://rentawas.com",
    siteName: "RentAwas",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/hero-dashboard.png",
        width: 1200,
        height: 630,
        alt: "RentAwas Property Management Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RentAwas — #1 Property Management Software & Rent Collection App",
    description:
      "Automate 0% landlord fee rent collection via GPay, PhonePe, Paytm, Razorpay & Stripe. Manage rental units, track NOI, and connect with certified local maintenance experts.",
    images: ["/hero-dashboard.png"],
    creator: "@rentawas",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${cormorant.variable} ${inter.variable} antialiased`}>
      <head>
        <JsonLd />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-[#F9FAFB] text-slate-950 font-sans selection:bg-orange-100 selection:text-orange-600">
        <ToastProvider>
          <QueryProvider>
            <CurrencyProvider>
              {children}
            </CurrencyProvider>
          </QueryProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
