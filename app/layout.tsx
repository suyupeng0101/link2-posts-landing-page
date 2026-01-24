import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { I18nProvider } from "@/components/i18n-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

const siteUrl = "https://link2posts.online"
const defaultTitle = "Link2Posts"
const defaultDescription =
  "Turn YouTube links into ready-to-post X threads, single posts, and YouTube SEO assets in minutes."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | Link2Posts",
  },
  description: defaultDescription,
  applicationName: "Link2Posts",
  generator: "Link2Posts",
  keywords: [
    "YouTube",
    "X thread",
    "Twitter thread",
    "social content",
    "YouTube SEO",
    "content repurposing",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: defaultTitle,
    description: defaultDescription,
    siteName: "Link2Posts",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-dark-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-light-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <I18nProvider>{children}</I18nProvider>
        <Analytics />
      </body>
    </html>
  )
}
