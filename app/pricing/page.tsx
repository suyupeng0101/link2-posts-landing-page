import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-12">
        <div className="container">
          <div className="max-w-4xl mx-auto mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首页
              </Button>
            </Link>
          </div>
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-8 text-center space-y-4">
            <h1 className="text-2xl md:text-3xl font-semibold">阶段 1 暂无定价</h1>
            <p className="text-muted-foreground">
              当前阶段仅提供免费体验与限流控制，付费方案将在后续阶段公布。
            </p>
            <Button asChild>
              <Link href="/#hero">立即开始</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
