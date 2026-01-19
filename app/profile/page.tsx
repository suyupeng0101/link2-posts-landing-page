import { Header } from "@/components/header"
import ProfileClient from "@/components/profile-client"

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
