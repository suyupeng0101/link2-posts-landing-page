"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Script from "next/script"
import { ArrowLeft, CheckCircle2, CreditCard, ShieldCheck } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type RechargePlan = {
  id: string
  title: string
  price: number
  currency: "USD"
  credits: number
  bonus?: number
  tagline: string
}

const plans: RechargePlan[] = [
  {
    id: "lite",
    title: "轻量包",
    price: 10,
    currency: "USD",
    credits: 100,
    tagline: "适合体验与低频使用",
  },
  {
    id: "value",
    title: "进阶包",
    price: 50,
    currency: "USD",
    credits: 500,
    bonus: 25,
    tagline: "主力选择，含 5% 赠送",
  },
  {
    id: "pro",
    title: "高频包",
    price: 100,
    currency: "USD",
    credits: 1000,
    bonus: 80,
    tagline: "高频创作场景，含 8% 赠送",
  },
]

type PayPalStatus = "idle" | "processing" | "success" | "error"

export default function PricingPage() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const [selectedId, setSelectedId] = useState(plans[1]?.id ?? plans[0].id)
  const [status, setStatus] = useState<PayPalStatus>("idle")
  const [message, setMessage] = useState<string | null>(null)
  const [sdkReady, setSdkReady] = useState(false)
  const buttonContainerRef = useRef<HTMLDivElement | null>(null)
  const selectedPlanRef = useRef<RechargePlan>(plans[0])

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedId) ?? plans[0],
    [selectedId]
  )

  useEffect(() => {
    selectedPlanRef.current = selectedPlan
    setStatus("idle")
    setMessage(null)
  }, [selectedPlan])

  useEffect(() => {
    if (!sdkReady || !clientId || !buttonContainerRef.current) return
    const paypal = (window as Window & { paypal?: any }).paypal
    if (!paypal?.Buttons) return

    buttonContainerRef.current.innerHTML = ""

    const buttons = paypal.Buttons({
      createOrder: async () => {
        const plan = selectedPlanRef.current
        const response = await fetch("/api/paypal/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId: plan.id,
          }),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.error || "创建订单失败")
        }
        return data.id
      },
      onApprove: async (data: { orderID?: string }) => {
        if (!data.orderID) return
        const plan = selectedPlanRef.current
        setStatus("processing")
        setMessage("支付处理中，请稍候确认结果")
        const response = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId: data.orderID, planId: plan.id }),
        })
        const capture = await response.json()
        if (!response.ok) {
          throw new Error(capture?.error || "支付确认失败")
        }
          setStatus("success")
        setMessage(`支付成功，已充值 ${plan.credits + (plan.bonus ?? 0)} 积分`)
      },
      onError: (err: unknown) => {
        const errorMessage =
          err instanceof Error ? err.message : "支付异常，请稍后重试"
        setStatus("error")
        setMessage(errorMessage)
      },
    })

    buttons.render(buttonContainerRef.current)

    return () => {
      buttons.close?.()
    }
  }, [sdkReady, clientId])

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-12">
        <div className="container">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" className="gap-2" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  返回首页
                </Link>
              </Button>
            </div>

            <div className="text-center space-y-3">
              <h1 className="text-3xl md:text-4xl font-semibold">充值获取积分</h1>
              <p className="text-muted-foreground text-base md:text-lg">
                选择合适的充值包，通过 PayPal 完成支付后即可获得对应积分，按量包长期有效。
              </p>
            </div>

            <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8">
              <div className="grid md:grid-cols-2 gap-4">
                {plans.map((plan) => {
                  const totalCredits = plan.credits + (plan.bonus ?? 0)
                  const isSelected = plan.id === selectedId
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedId(plan.id)}
                      className={cn(
                        "text-left rounded-2xl border border-border bg-card p-6 transition hover:border-primary/60",
                        isSelected && "border-primary ring-1 ring-primary/40"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-lg font-semibold">{plan.title}</div>
                          <div className="text-sm text-muted-foreground">{plan.tagline}</div>
                        </div>
                        {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-xs text-muted-foreground">USD</span>
                      </div>
                      <div className="mt-3 text-sm font-medium text-primary">
                        {totalCredits} 积分
                      </div>
                      {plan.bonus && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          包含 {plan.bonus} 积分赠送
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="space-y-4">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>订单概览</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">充值包</span>
                      <span className="font-medium">{selectedPlan.title}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">到账积分</span>
                      <span className="font-medium">
                        {selectedPlan.credits + (selectedPlan.bonus ?? 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">应付金额</span>
                      <span className="font-semibold">
                        ${selectedPlan.price.toFixed(2)} USD
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      单次生成扣 12 credits（含转录与生成）
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      支持 PayPal 余额或绑定卡支付
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>PayPal 支付</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!clientId && (
                      <p className="text-sm text-destructive">
                        未检测到 PayPal Client ID，请先配置环境变量。
                      </p>
                    )}
                    <div ref={buttonContainerRef} />
                    {status !== "idle" && message && (
                      <div
                        className={cn(
                          "rounded-lg border px-3 py-2 text-sm",
                          status === "success" &&
                            "border-emerald-200 bg-emerald-50 text-emerald-700",
                          status === "error" && "border-red-200 bg-red-50 text-red-700",
                          status === "processing" &&
                            "border-amber-200 bg-amber-50 text-amber-700"
                        )}
                      >
                        {message}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="h-4 w-4" />
                      支付由 PayPal 安全处理，本站不保存任何卡信息。
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {clientId && (
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`}
          strategy="afterInteractive"
          onLoad={() => setSdkReady(true)}
        />
      )}
    </div>
  )
}
