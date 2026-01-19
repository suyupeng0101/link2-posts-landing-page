"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { openLoginDialog } from "@/lib/login-dialog"

export function PricingSection() {
  const router = useRouter()
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
    const authed = await ensureAuthenticated()
    if (!authed) {
      openLoginDialog()
      return
    }
    router.push("/pricing")
  }, [ensureAuthenticated, router])
  const plans = [
    {
      name: "轻量包",
      price: "$10",
      credits: "100 credits",
      description: "适合体验与低频使用",
      features: [
        "约 8 次生成（按 12 credits/次）",
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
      credits: "525 credits",
      description: "最划算的主力选择",
      features: [
        "含 5% 赠送（+25 credits）",
        "约 43 次生成（按 12 credits/次）",
        "按量包，不限使用周期",
        "优先客服支持",
      ],
      cta: "立即充值",
      popular: true,
    },
    {
      name: "高频包",
      price: "$100",
      credits: "1080 credits",
      description: "高频创作与团队协作",
      features: [
        "含 8% 赠送（+80 credits）",
        "约 90 次生成（按 12 credits/次）",
        "按量包，不限使用周期",
        "专属客服支持",
      ],
      cta: "立即充值",
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">按量包定价，清晰透明</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              按使用付费，不订阅、不捆绑，没有隐藏费用。
            </p>
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
                      最受欢迎
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
            <h3 className="text-lg font-semibold mb-3">积分扣费规则</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>- 每次点击生成：12 credits</p>
              <p>- 1 credit = $0.01</p>
              <p>- 按量包充值后长期有效</p>
              <p className="pt-2 text-xs">
                例：充值 $50 可得 525 credits，约可生成 43 次内容。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
