import type { Metadata } from "next"
import { Header } from "@/components/header"
import ProfileClient from "@/components/profile-client"

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your Link2Posts profile.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container py-10">
        <ProfileClient />
      </main>
    </div>
  )
}
