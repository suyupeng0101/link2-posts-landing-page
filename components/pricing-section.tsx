"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { openLoginDialog } from "@/lib/login-dialog"
import { useI18n } from "@/components/i18n-provider"

export function PricingSection() {
  const router = useRouter()
  const { locale } = useI18n()
  const copy =
    locale === "zh-Hans"
      ? {
          title: "按量包定价，清晰透明",
          subtitle: "按使用付费，不订阅、不捆绑，没有隐藏费用。",
          popular: "最受欢迎",
          rulesTitle: "积分扣费规则",
          rules: [
            "每次点击生成：12 credits",
            "1 credit = $0.01",
            "按量包充值后长期有效",
          ],
          rulesExample: "例：充值 $50 可得 525 credits，约可生成 43 次内容。",
          plans: [
            {
              name: "轻量包",
              price: "$10",
              credits: "100 积分",
              description: "适合体验与低频使用",
              features: [
                "约 8 次生成（12 credits/次）",
                "按量包，不限使用周期",
                "包含全部输出格式",
                "基础客服支持",
              ],
              cta: "立即充值",
              popular: false,
            },
            {
              name: "进阶包",
              price: "$50",
              credits: "525 积分",
              description: "最划算的主力选择",
              features: [
                "含 5% 赠送（+25 credits）",
                "约 43 次生成（12 credits/次）",
                "按量包，不限使用周期",
                "优先客服支持",
              ],
              cta: "立即充值",
              popular: true,
            },
            {
              name: "高频包",
              price: "$100",
              credits: "1080 积分",
              description: "高频创作与团队协作",
              features: [
                "含 8% 赠送（+80 credits）",
                "约 90 次生成（12 credits/次）",
                "按量包，不限使用周期",
                "专属客服支持",
              ],
              cta: "立即充值",
              popular: false,
            },
          ],
        }
      : {
          title: "Usage-based pricing, clear and transparent",
          subtitle: "Pay as you go. No subscriptions, no bundles, no hidden fees.",
          popular: "Most popular",
          rulesTitle: "Credit usage rules",
          rules: [
            "Each generation: 12 credits",
            "1 credit = $0.01",
            "Top-ups never expire",
          ],
          rulesExample: "Example: $50 top-up gives 525 credits, about 43 generations.",
          plans: [
            {
              name: "Lite",
              price: "$10",
              credits: "100 credits",
              description: "Great for trials and low-volume use",
              features: [
                "About 8 generations (12 credits each)",
                "Pay-as-you-go, no expiry",
                "All output formats included",
                "Basic support",
              ],
              cta: "Top up now",
              popular: false,
            },
            {
              name: "Value",
              price: "$50",
              credits: "525 credits",
              description: "Best value for regular use",
              features: [
                "Includes 5% bonus (+25 credits)",
                "About 43 generations (12 credits each)",
                "Pay-as-you-go, no expiry",
                "Priority support",
              ],
              cta: "Top up now",
              popular: true,
            },
            {
              name: "Pro",
              price: "$100",
              credits: "1080 credits",
              description: "High-frequency and team workflows",
              features: [
                "Includes 8% bonus (+80 credits)",
                "About 90 generations (12 credits each)",
                "Pay-as-you-go, no expiry",
                "Dedicated support",
              ],
              cta: "Top up now",
              popular: false,
            },
          ],
        }

  const [isRouting, setIsRouting] = useState(false)

  const ensureAuthenticated = useCallback(async () => {
    try {
      const authResponse = await fetch("/api/auth/user", { cache: "no-store" })
      const authData = await authResponse.json()

      if (!authResponse.ok || !authData?.user) {
        return false
      }
    } catch {
      return false
    }

    return true
  }, [])

  const handleRechargeClick = useCallback(async () => {
    if (isRouting) return
    setIsRouting(true)
    const authed = await ensureAuthenticated()
    if (!authed) {
      openLoginDialog()
      setIsRouting(false)
      return
    }
    router.push("/pricing")
  }, [ensureAuthenticated, isRouting, router])

  const plans = copy.plans

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">{copy.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{copy.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative border-2 ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      {copy.popular}
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                  </div>
                  <div className="text-sm font-medium text-primary">{plan.credits}</div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={handleRechargeClick}
                    disabled={isRouting}
                  >
                    {plan.cta}
                  </Button>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-6 max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold mb-3">{copy.rulesTitle}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              {copy.rules.map((rule) => (
                <p key={rule}>- {rule}</p>
              ))}
              <p className="pt-2 text-xs">{copy.rulesExample}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
