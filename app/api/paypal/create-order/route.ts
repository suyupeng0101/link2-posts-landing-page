import { NextResponse } from "next/server"
import { getPayPalAccessToken, getPayPalApiBase } from "@/lib/paypal"

type CreateOrderPayload = {
  planId?: string
  amount: number | string
  currency: string
  credits?: number
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderPayload
    const amountValue = Number.parseFloat(String(body.amount))

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (!body.currency || typeof body.currency !== "string") {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 })
    }

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
              currency_code: body.currency.toUpperCase(),
              value: amountValue.toFixed(2),
            },
            description: body.credits ? `充值 ${body.credits} 积分` : "积分充值",
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
