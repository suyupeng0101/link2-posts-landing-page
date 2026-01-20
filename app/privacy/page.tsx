"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useI18n } from "@/components/i18n-provider"

export default function PrivacyPage() {
  const { locale } = useI18n()
  const copy =
    locale === "zh-Hans"
      ? {
          title: "隐私政策",
          updated: "最后更新：2026-01-19",
          sectionInfo: "我们收集的信息",
          infoItems: [
            "账号登录所需的基础身份信息（如邮箱）。",
            "你提交的 YouTube 链接与生成请求参数。",
            "用于产品分析与性能优化的匿名统计信息。",
          ],
          sectionUsage: "信息使用方式",
          usageText: "我们仅将信息用于提供服务、改进产品与必要的客户支持，不会出售你的个人信息。",
          sectionSharing: "信息共享",
          sharingText: "我们不会与第三方共享可识别个人身份的信息，除非出于合规要求或获得你的明确授权。",
          sectionRetention: "数据保留",
          retentionText: "我们仅在提供服务所需的期间内保留数据，并采取合理的安全措施进行保护。",
          sectionContact: "联系我们",
          contactText: "如有隐私相关问题，请邮件联系：",
        }
      : {
          title: "Privacy Policy",
          updated: "Last updated: 2026-01-19",
          sectionInfo: "Information we collect",
          infoItems: [
            "Basic identity info required for login (e.g., email).",
            "YouTube links and generation parameters you submit.",
            "Anonymous analytics for product and performance improvements.",
          ],
          sectionUsage: "How we use information",
          usageText: "We use information only to provide services, improve the product, and offer support. We do not sell your personal information.",
          sectionSharing: "Information sharing",
          sharingText: "We do not share personally identifiable information with third parties unless required by law or with your explicit consent.",
          sectionRetention: "Data retention",
          retentionText: "We retain data only as long as needed to provide the service and apply reasonable security measures.",
          sectionContact: "Contact us",
          contactText: "For privacy questions, email:",
        }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">{copy.title}</h1>
            <p className="text-sm text-muted-foreground">{copy.updated}</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">{copy.sectionInfo}</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              {copy.infoItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">{copy.sectionUsage}</h2>
            <p className="text-muted-foreground">{copy.usageText}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">{copy.sectionSharing}</h2>
            <p className="text-muted-foreground">{copy.sharingText}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">{copy.sectionRetention}</h2>
            <p className="text-muted-foreground">{copy.retentionText}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">{copy.sectionContact}</h2>
            <p className="text-muted-foreground">
              {copy.contactText}{" "}
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
