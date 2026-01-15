import Link from "next/link"
import { Check, Sparkles } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CreemCheckoutButton } from "@/components/creem-checkout-button"

type PlanCta =
  | { type: "link"; label: string; href: string }
  | { type: "creem"; label: string; priceId: string }

type PricingPlan = {
  id: string
  name: string
  price: string
  unit: string
  credits: string
  description: string
  highlight?: boolean
  features: string[]
  cta: PlanCta
}

const plans: PricingPlan[] = [
  {
    id: "free",
    name: "免费试用",
    price: "￥0",
    unit: "一次",
    credits: "20 credits",
    description: "用最小成本体验完整工作流",
    features: [
      "支持 1-2 套内容生成",
      "X 线程 + 单条推文 + SEO",
      "基础格式导出",
      "邮件支持",
      "内容保存 7 天",
    ],
    cta: { type: "link", label: "立即试用", href: "/#hero" },
  },
  {
    id: "starter",
    name: "Starter",
    price: "￥49",
    unit: "一次性",
    credits: "60 credits",
    description: "适合偶尔发布的创作者",
    features: [
      "约 15 分钟视频转写",
      "最多 5 套内容",
      "全部模板输出",
      "优先邮件支持",
      "内容保存 30 天",
    ],
    cta: {
      type: "creem",
      label: "购买 Starter",
      priceId: process.env.NEXT_PUBLIC_CREEM_PRICE_STARTER ?? "",
    },
  },
  {
    id: "creator",
    name: "Creator",
    price: "￥129",
    unit: "一次性",
    credits: "180 credits",
    description: "最受欢迎的创作者组合",
    highlight: true,
    features: [
      "约 45 分钟视频转写",
      "最多 15 套内容",
      "优先支持 + Chat",
      "内容永久保存",
      "团队分享链接",
      "字幕缓存节省额度",
    ],
    cta: {
      type: "creem",
      label: "购买 Creator",
      priceId: process.env.NEXT_PUBLIC_CREEM_PRICE_CREATOR ?? "",
    },
  },
  {
    id: "studio",
    name: "Studio",
    price: "￥299",
    unit: "一次性",
    credits: "420 credits",
    description: "适合团队/工作室",
    features: [
      "约 105 分钟视频转写",
      "最多 35 套内容",
      "专属支持",
      "团队协作与共享",
      "品牌定制输出",
      "API 接入优先支持",
    ],
    cta: {
      type: "creem",
      label: "购买 Studio",
      priceId: process.env.NEXT_PUBLIC_CREEM_PRICE_STUDIO ?? "",
    },
  },
]

const highlights = [
  {
    title: "按量计费",
    description: "只为使用付费，无订阅压力",
  },
  {
    title: "Creem 安全支付",
    description: "支持信用卡与多币种付款",
  },
  {
    title: "即买即用",
    description: "支付完成后额度实时到账",
  },
]

const faqs = [
  {
    question: "Credits 如何计费？",
    answer:
      "转写按 2 credits/分钟，内容生成按 6 credits/套。字幕命中缓存时转写免费。",
  },
  {
    question: "购买后能退款吗？",
    answer: "未使用额度可在 7 天内申请退款，已使用额度按比例结算。",
  },
  {
    question: "可以多人协作吗？",
    answer: "Creator 与 Studio 提供团队共享链接，支持协作与审阅。",
  },
]

export default function PricingPage({
  searchParams,
}: {
  searchParams?: { status?: string }
}) {
  const status = searchParams?.status
  const statusCopy =
    status === "success"
      ? "支付成功！我们已开始为你的账号开通额度。"
      : status === "cancel"
      ? "支付已取消，你可以随时重新发起购买。"
      : ""

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-40 left-[-8%] h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
        </div>

        <section className="container relative pt-16 pb-10">
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              Pricing
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
              把每个视频变成
              <span className="text-primary"> 可发布的内容资产</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              将任意 YouTube 视频在几分钟内转成可发布的 X 线程与 YouTube SEO 文案。
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/#hero">立即开始</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#plans">查看方案</Link>
              </Button>
            </div>
            {statusCopy ? (
              <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
                {statusCopy}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Creem 安全支付
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent" />
                无隐藏费用
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-foreground/40" />
                额度可叠加
              </div>
            </div>
          </div>
        </section>

        <section id="plans" className="container relative py-10">
          <div className="grid gap-6 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex h-full flex-col rounded-3xl border p-6 shadow-sm ${
                  plan.highlight
                    ? "border-primary/60 bg-primary/5 shadow-lg"
                    : "border-border bg-card/80"
                }`}
              >
                {plan.highlight ? (
                  <div className="absolute -top-4 left-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    最受欢迎
                  </div>
                ) : null}
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">{plan.name}</div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-semibold md:text-4xl">{plan.price}</span>
                    <span className="text-xs text-muted-foreground">{plan.unit}</span>
                  </div>
                  <div className="text-sm font-medium text-primary">{plan.credits}</div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mt-6 space-y-3">
                  {plan.cta.type === "link" ? (
                    <Button asChild className="w-full" variant={plan.highlight ? "default" : "outline"}>
                      <Link href={plan.cta.href}>{plan.cta.label}</Link>
                    </Button>
                  ) : (
                    <CreemCheckoutButton
                      planId={plan.id}
                      priceId={plan.cta.priceId}
                      className="w-full"
                      variant={plan.highlight ? "default" : "outline"}
                      disabled={!plan.cta.priceId}
                    >
                      {plan.cta.priceId ? plan.cta.label : "配置中"}
                    </CreemCheckoutButton>
                  )}

                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="container py-10">
          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container py-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl border border-border bg-card/80 p-6">
              <h3 className="text-lg font-semibold">Credits 计费方式</h3>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">转写：</span>
                  2 credits / 分钟
                </p>
                <p>
                  <span className="font-medium text-foreground">内容生成：</span>
                  6 credits / 套（X 线程 + 单条推文 + SEO）
                </p>
                <p>
                  <span className="font-medium text-foreground">字幕缓存：</span>
                  若命中缓存，转写免费
                </p>
                <p className="pt-2 text-xs text-muted-foreground">
                  例：10 分钟视频 = 20 credits（转写） + 6 credits（生成） = 26 credits
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 p-6">
              <h3 className="text-lg font-semibold">方案包含</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-primary" />
                  自动生成 X 线程与单条推文
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-primary" />
                  YouTube SEO 标题与描述建议
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-primary" />
                  多语言与语气模板
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-primary" />
                  一键导出与分享
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="container py-10">
          <div className="rounded-3xl border border-border bg-muted/40 p-8 md:p-10">
            <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
              <div>
                <h2 className="text-2xl font-semibold md:text-3xl">还有疑问？我们帮你算清楚</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  找不到合适的方案？给我们留言，我们会按你的内容产出量推荐最省钱的组合。
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/contact">联系团队</Link>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link href="/">返回首页</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-10 pb-16">
          <div className="grid gap-6 md:grid-cols-3">
            {faqs.map((item) => (
              <div key={item.question} className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-base font-semibold">{item.question}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
