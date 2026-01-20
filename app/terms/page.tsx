"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">服务条款</h1>
            <p className="text-sm text-muted-foreground">最后更新：2026-01-19</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">服务说明</h2>
            <p className="text-muted-foreground">
              Link2Posts 提供将 YouTube 视频字幕转化为内容资产的工具与服务。使用本服务即表示你已阅读并同意本条款。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">使用规则</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>仅可输入你有合法权利使用的 YouTube 链接与内容。</li>
              <li>不得用于侵犯版权、隐私或其他违法用途。</li>
              <li>请勿尝试绕过系统限制或进行恶意请求。</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">免责声明</h2>
            <p className="text-muted-foreground">
              输出内容由模型生成，仅供参考。我们不对内容的完整性、准确性或适用性作出保证。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">条款变更</h2>
            <p className="text-muted-foreground">
              我们可能会根据产品迭代更新服务条款，并在页面上进行提示。继续使用即视为接受更新后的条款。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">联系我们</h2>
            <p className="text-muted-foreground">
              如对条款有任何疑问，请邮件联系：{" "}
              <a
                className="text-primary hover:underline"
                href="mailto:sujinzhe1992@gmail.com"
              >
                sujinzhe1992@gmail.com
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
