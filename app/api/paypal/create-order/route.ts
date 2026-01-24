import { NextResponse } from "next/server"
import { getPayPalAccessToken, getPayPalApiBase } from "@/lib/paypal"
import { ApiError, apiErrorResponse } from "@/lib/api-error"

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
      return apiErrorResponse(new ApiError("paypal_invalid_plan", 400))
    }

    const origin = new URL(request.url).origin
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
            description: `Top up ${creditsGranted} credits`,
            custom_id: body.planId,
          },
        ],
        application_context: {
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          return_url: `${origin}/pricing?paypal=success&planId=${body.planId}`,
          cancel_url: `${origin}/pricing?paypal=cancel&planId=${body.planId}`,
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("paypal create order error", data)
      return apiErrorResponse(
        new ApiError("paypal_create_failed", response.status),
        "paypal_create_failed",
        response.status
      )
    }

    const approvalUrl =
      data?.links?.find((link: { rel?: string; href?: string }) =>
        ["approve", "payer-action"].includes(link.rel ?? "")
      )?.href ?? null

    if (!approvalUrl) {
      return apiErrorResponse(
        new ApiError("paypal_missing_approval_url", 500),
        "paypal_create_failed",
        500
      )
    }

    return NextResponse.json({ id: data.id, approvalUrl })
  } catch (error) {
    console.error("paypal create order error", error)
    return apiErrorResponse(error, "paypal_create_failed", 500)
  }
}
