import { NextResponse } from "next/server"
import { getPayPalAccessToken, getPayPalApiBase } from "@/lib/paypal"

type CreateOrderPayload = {
  planId?: string
}

const plans = {
  lite: { amount: 10, currency: "USD", credits: 100, bonus: 0 },
  value: { amount: 50, currency: "USD", credits: 500, bonus: 25 },
  pro: { amount: 100, currency: "USD", credits: 1000, bonus: 80 },
} as const

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderPayload
    const plan = body.planId ? plans[body.planId as keyof typeof plans] : null

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const amountValue = plan.amount
    const creditsGranted = plan.credits + plan.bonus

    const accessToken = await getPayPalAccessToken()
    const response = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: plan.currency,
              value: amountValue.toFixed(2),
            },
            description: `充值 ${creditsGranted} 积分`,
            custom_id: body.planId,
          },
        ],
        application_context: {
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || "PayPal order create failed", details: data },
        { status: response.status }
      )
    }

    return NextResponse.json({ id: data.id })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Create order failed" },
      { status: 500 }
    )
  }
}
