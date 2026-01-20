"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">隐私政策</h1>
            <p className="text-sm text-muted-foreground">最后更新：2026-01-19</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">我们收集的信息</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>账号登录所需的基础身份信息（如邮箱）。</li>
              <li>你提交的 YouTube 链接与生成请求参数。</li>
              <li>用于产品分析与性能优化的匿名统计信息。</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">信息使用方式</h2>
            <p className="text-muted-foreground">
              我们仅将信息用于提供服务、改进产品与必要的客户支持，不会出售你的个人信息。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">信息共享</h2>
            <p className="text-muted-foreground">
              我们不会与第三方共享可识别个人身份的信息，除非出于合规要求或获得你的明确授权。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">数据保留</h2>
            <p className="text-muted-foreground">
              我们仅在提供服务所需的期间内保留数据，并采取合理的安全措施进行保护。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">联系我们</h2>
            <p className="text-muted-foreground">
              如有隐私相关问题，请邮件联系：{" "}
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
