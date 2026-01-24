import type { Metadata } from "next"
import { HomeClient } from "@/components/home-client"

export const metadata: Metadata = {
  title: "YouTube to X Threads, Posts, and SEO Assets",
  description:
    "Convert a YouTube link into X threads, single posts, and YouTube SEO assets in minutes. Fast, editable, and ready to publish.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "YouTube to X Threads, Posts, and SEO Assets",
    description:
      "Convert a YouTube link into X threads, single posts, and YouTube SEO assets in minutes. Fast, editable, and ready to publish.",
    url: "/",
    type: "website",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary",
    title: "YouTube to X Threads, Posts, and SEO Assets",
    description:
      "Convert a YouTube link into X threads, single posts, and YouTube SEO assets in minutes. Fast, editable, and ready to publish.",
    images: ["/logo.png"],
  },
}

export default function HomePage() {
  return <HomeClient />
}
