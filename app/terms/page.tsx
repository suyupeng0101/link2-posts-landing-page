"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useI18n } from "@/components/i18n-provider"

export default function TermsPage() {
  const { locale } = useI18n()
  const copy =
    locale === "zh-Hans"
      ? {
          title: "服务条款",
          updated: "最后更新：2026-01-19",
          sectionService: "服务说明",
          serviceText: "Link2Posts 提供将 YouTube 视频字幕转化为内容资产的工具与服务。使用本服务即表示你已阅读并同意本条款。",
          sectionRules: "使用规则",
          rules: [
            "仅可输入你有合法权利使用的 YouTube 链接与内容。",
            "不得用于侵犯版权、隐私或其他违法用途。",
            "请勿尝试绕过系统限制或进行恶意请求。",
          ],
          sectionDisclaimer: "免责声明",
          disclaimerText: "输出内容由模型生成，仅供参考。我们不对内容的完整性、准确性或适用性作出保证。",
          sectionChanges: "条款变更",
          changesText: "我们可能会根据产品迭代更新服务条款，并在页面上进行提示。继续使用即视为接受更新后的条款。",
          sectionContact: "联系我们",
          contactText: "如对条款有任何疑问，请邮件联系：",
        }
      : {
          title: "Terms of Service",
          updated: "Last updated: 2026-01-19",
          sectionService: "Service overview",
          serviceText: "Link2Posts provides tools that turn YouTube captions into content assets. By using the service, you agree to these terms.",
          sectionRules: "Usage rules",
          rules: [
            "Only submit YouTube links and content you have legal rights to use.",
            "Do not use the service for copyright, privacy, or other unlawful violations.",
            "Do not attempt to bypass system limits or make malicious requests.",
          ],
          sectionDisclaimer: "Disclaimer",
          disclaimerText: "Outputs are AI-generated and provided for reference only. We make no guarantees about completeness, accuracy, or fitness for purpose.",
          sectionChanges: "Changes to terms",
          changesText: "We may update these terms as the product evolves. Continued use indicates acceptance of the updated terms.",
          sectionContact: "Contact us",
          contactText: "If you have any questions, email:",
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
            <h2 className="text-xl font-semibold">{copy.sectionService}</h2>
            <p className="text-muted-foreground">{copy.serviceText}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">{copy.sectionRules}</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              {copy.rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">{copy.sectionDisclaimer}</h2>
            <p className="text-muted-foreground">{copy.disclaimerText}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">{copy.sectionChanges}</h2>
            <p className="text-muted-foreground">{copy.changesText}</p>
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
