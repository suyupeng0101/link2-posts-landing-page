import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose a top-up plan to get credits for Link2Posts.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing",
    description: "Choose a top-up plan to get credits for Link2Posts.",
    url: "/pricing",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary",
    title: "Pricing",
    description: "Choose a top-up plan to get credits for Link2Posts.",
    images: ["/logo.png"],
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
