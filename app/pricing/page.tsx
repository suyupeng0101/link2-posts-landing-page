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
import { useI18n } from "@/components/i18n-provider"
import { getErrorMessage } from "@/lib/i18n-errors"

type RechargePlan = {
  id: string
  title: string
  price: number
  currency: "USD"
  credits: number
  bonus?: number
  tagline: string
}

type PayPalStatus = "idle" | "processing" | "success" | "error"

export default function PricingPage() {
  const { locale } = useI18n()
  const copy = useMemo(
    () =>
      locale === "zh-Hans"
        ? {
          backHome: "返回首页",
          title: "充值获取积分",
          subtitle:
            "选择合适的充值包，通过 PayPal 完成支付后即可获得对应积分，按量包长期有效。",
          planLabel: "充值包",
          creditsLabel: "到账积分",
          amountLabel: "应付金额",
          creditNote: "单次生成：12 credits（含转录与生成）",
          paypalSupport: "支持 PayPal 余额或绑定卡支付",
          orderTitle: "订单概览",
          paypalTitle: "PayPal 支付",
          paypalMissing: "未检测到 PayPal Client ID，请先配置环境变量。",
          paypalProcessing: "支付处理中，请稍候确认结果。",
          paypalSuccess: "支付成功，已充值 {credits} 积分",
          paypalError: "支付异常，请稍后重试",
          paypalConfirmError: "支付确认失败",
          paypalCreateError: "创建订单失败",
          paypalSecure: "支付由 PayPal 安全处理，本站不保存任何卡信息。",
          usd: "USD",
          bonusLabel: "包含 {bonus} 积分赠送",
          creditsUnit: "积分",
          plans: [
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
          ],
        }
        : {
          backHome: "Back to home",
          title: "Top up credits",
          subtitle:
            "Choose a plan and pay with PayPal to receive credits. Top-ups never expire.",
          planLabel: "Plan",
          creditsLabel: "Credits",
          amountLabel: "Amount due",
          creditNote: "Per generation: 12 credits (includes transcription + generation)",
          paypalSupport: "Pay with PayPal balance or linked card",
          orderTitle: "Order summary",
          paypalTitle: "PayPal checkout",
          paypalMissing: "Missing PayPal Client ID. Please configure the environment variable.",
          paypalProcessing: "Processing payment, please wait for confirmation.",
          paypalSuccess: "Payment successful, {credits} credits added",
          paypalError: "Payment error, please try again later.",
          paypalConfirmError: "Payment confirmation failed",
          paypalCreateError: "Failed to create order",
          paypalSecure: "Payments are processed by PayPal. We do not store card details.",
          usd: "USD",
          bonusLabel: "Includes {bonus} bonus credits",
          creditsUnit: "credits",
          plans: [
            {
              id: "lite",
              title: "Lite",
              price: 10,
              currency: "USD",
              credits: 100,
              tagline: "Best for trying it out",
            },
            {
              id: "value",
              title: "Value",
              price: 50,
              currency: "USD",
              credits: 500,
              bonus: 25,
              tagline: "Most popular, includes 5% bonus",
            },
            {
              id: "pro",
              title: "Pro",
              price: 100,
              currency: "USD",
              credits: 1000,
              bonus: 80,
              tagline: "For high-volume workflows, includes 8% bonus",
            },
          ],
        },
    [locale]
  )

  const plans: RechargePlan[] = copy.plans
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  const [selectedId, setSelectedId] = useState(plans[1]?.id ?? plans[0].id)
  const [status, setStatus] = useState<PayPalStatus>("idle")
  const [message, setMessage] = useState<string | null>(null)
  const [sdkReady, setSdkReady] = useState(false)
  const buttonContainerRef = useRef<HTMLDivElement | null>(null)
  const selectedPlanRef = useRef<RechargePlan>(plans[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedId) ?? plans[0],
    [selectedId, plans]
  )

  useEffect(() => {
    selectedPlanRef.current = selectedPlan
    setStatus("idle")
    setMessage(null)
    setIsSubmitting(false)
  }, [selectedPlan])

  useEffect(() => {
    if (!clientId) return
    const paypal = (window as Window & { paypal?: any }).paypal
    if (paypal?.Buttons) {
      setSdkReady(true)
    }
  }, [clientId])

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
          throw new Error(getErrorMessage(data?.error, locale))
        }
        return data.id
      },
      onApprove: async (data: { orderID?: string }) => {
        if (!data.orderID) return
        const plan = selectedPlanRef.current
        setStatus("processing")
        setIsSubmitting(true)
        setMessage(copy.paypalProcessing)
        const response = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId: data.orderID, planId: plan.id }),
        })
        const capture = await response.json()
        if (!response.ok) {
          throw new Error(getErrorMessage(capture?.error, locale))
        }
        setStatus("success")
        setIsSubmitting(false)
        setMessage(
          copy.paypalSuccess.replace(
            "{credits}",
            String(plan.credits + (plan.bonus ?? 0))
          )
        )
      },
      onError: (err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : copy.paypalError
        setStatus("error")
        setIsSubmitting(false)
        setMessage(errorMessage)
      },
    })

    buttons.render(buttonContainerRef.current)

    return () => {
      buttons.close?.()
    }
  }, [sdkReady, clientId, copy, locale])

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
                  {copy.backHome}
                </Link>
              </Button>
            </div>

            <div className="text-center space-y-3">
              <h1 className="text-3xl md:text-4xl font-semibold">{copy.title}</h1>
              <p className="text-muted-foreground text-base md:text-lg">{copy.subtitle}</p>
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
                      onClick={() => {
                        if (!isSubmitting) setSelectedId(plan.id)
                      }}
                      disabled={isSubmitting}
                      className={cn(
                        "text-left rounded-2xl border border-border bg-card p-6 transition hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-60",
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
                        <span className="text-xs text-muted-foreground">{copy.usd}</span>
                      </div>
                      <div className="mt-3 text-sm font-medium text-primary">
                        {totalCredits} {copy.creditsUnit}
                      </div>
                      {plan.bonus && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {copy.bonusLabel.replace("{bonus}", String(plan.bonus))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="space-y-4">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>{copy.orderTitle}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{copy.planLabel}</span>
                      <span className="font-medium">{selectedPlan.title}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{copy.creditsLabel}</span>
                      <span className="font-medium">
                        {selectedPlan.credits + (selectedPlan.bonus ?? 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{copy.amountLabel}</span>
                      <span className="font-semibold">
                        ${selectedPlan.price.toFixed(2)} {copy.usd}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{copy.creditNote}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      {copy.paypalSupport}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>{copy.paypalTitle}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!clientId && (
                      <p className="text-sm text-destructive">{copy.paypalMissing}</p>
                    )}
                    <div className="relative">
                      <div ref={buttonContainerRef} />
                      {isSubmitting && (
                        <div className="absolute inset-0 rounded-md bg-background/70 backdrop-blur-sm" />
                      )}
                    </div>
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
                      {copy.paypalSecure}
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
