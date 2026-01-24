import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Link2Posts collects and protects your information.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy",
    description: "Learn how Link2Posts collects and protects your information.",
    url: "/privacy",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy",
    description: "Learn how Link2Posts collects and protects your information.",
    images: ["/logo.png"],
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
