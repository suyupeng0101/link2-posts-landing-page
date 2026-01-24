import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Review the terms and conditions for using Link2Posts.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service",
    description: "Review the terms and conditions for using Link2Posts.",
    url: "/terms",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary",
    title: "Terms of Service",
    description: "Review the terms and conditions for using Link2Posts.",
    images: ["/logo.png"],
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
