import { NextResponse } from "next/server"
import { getPayPalAccessToken, getPayPalApiBase } from "@/lib/paypal"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { ApiError, apiErrorResponse } from "@/lib/api-error"

type CaptureOrderPayload = {
  orderId: string
  planId?: string
}

const plans = {
  lite: { amount: 10, currency: "USD", credits: 100, bonus: 0 },
  value: { amount: 50, currency: "USD", credits: 500, bonus: 25 },
  pro: { amount: 100, currency: "USD", credits: 1000, bonus: 80 },
} as const

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CaptureOrderPayload

    if (!body.orderId) {
      return apiErrorResponse(new ApiError("paypal_missing_order", 400))
    }

    const plan = body.planId ? plans[body.planId as keyof typeof plans] : null
    if (!plan) {
      return apiErrorResponse(new ApiError("paypal_invalid_plan", 400))
    }

    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return apiErrorResponse(new ApiError("paypal_unauthorized", 401))
    }

    const { data: existingPayment } = await supabaseAdmin
      .from("payments")
      .select("id, status")
      .eq("provider", "paypal")
      .eq("provider_payment_id", body.orderId)
      .maybeSingle()

    if (existingPayment?.status === "succeeded") {
      return NextResponse.json({ status: "COMPLETED", alreadyGranted: true })
    }

    const accessToken = await getPayPalAccessToken()
    const response = await fetch(
      `${getPayPalApiBase()}/v2/checkout/orders/${body.orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error("paypal capture error", data)
      return apiErrorResponse(
        new ApiError("paypal_capture_failed", response.status),
        "paypal_capture_failed",
        response.status
      )
    }

    if (data.status !== "COMPLETED") {
      return NextResponse.json({ status: data.status, details: data })
    }

    const captureAmount =
      data?.purchase_units?.[0]?.payments?.captures?.[0]?.amount

    if (
      !captureAmount ||
      captureAmount.currency_code !== plan.currency ||
      Number.parseFloat(captureAmount.value) !== plan.amount
    ) {
      return apiErrorResponse(new ApiError("paypal_amount_mismatch", 400))
    }

    const creditsGranted = plan.credits + plan.bonus
    const amountCents = Math.round(plan.amount * 100)

    const { data: paymentRows, error: paymentError } = await supabaseAdmin
      .from("payments")
      .upsert(
        {
          user_id: authData.user.id,
          provider: "paypal",
          provider_payment_id: body.orderId,
          amount_cents: amountCents,
          currency: plan.currency,
          status: "succeeded",
          credits_granted: creditsGranted,
          raw_payload: data,
        },
        { onConflict: "provider,provider_payment_id" }
      )
      .select("id")

    if (paymentError) {
      console.error("paypal capture payment error", paymentError)
      return apiErrorResponse(new ApiError("paypal_record_failed", 500))
    }

    const paymentId = paymentRows?.[0]?.id ?? null

    const { data: balanceRow, error: balanceError } = await supabaseAdmin
      .from("credits_balance")
      .select("balance")
      .eq("user_id", authData.user.id)
      .maybeSingle()

    if (balanceError) {
      return apiErrorResponse(new ApiError("paypal_balance_read_failed", 500))
    }

    const newBalance = (balanceRow?.balance ?? 0) + creditsGranted

    const { error: balanceUpdateError } = await supabaseAdmin
      .from("credits_balance")
      .upsert({
        user_id: authData.user.id,
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })

    if (balanceUpdateError) {
      return apiErrorResponse(new ApiError("paypal_balance_update_failed", 500))
    }

    const { error: ledgerError } = await supabaseAdmin
      .from("credits_ledger")
      .insert({
        user_id: authData.user.id,
        change_amount: creditsGranted,
        reason: "payment",
        related_payment_id: paymentId,
        note: "credit recharge",
      })

    if (ledgerError) {
      return apiErrorResponse(new ApiError("paypal_ledger_failed", 500))
    }

    return NextResponse.json({
      status: data.status,
      creditsGranted,
      balance: newBalance,
    })
  } catch (error) {
    console.error("paypal capture error", error)
    return apiErrorResponse(error, "paypal_capture_failed", 500)
  }
}
