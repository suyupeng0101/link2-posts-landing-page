import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container py-10">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-2xl font-semibold">个人资料</h1>
          <p className="text-sm text-muted-foreground">
            个人资料页已预留，可以在这里展示头像、昵称与绑定账号信息。
          </p>
          <Link href="/">
            <Button variant="outline" size="sm">
              返回首页
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
