import { NextResponse } from "next/server"
import { getPayPalAccessToken, getPayPalApiBase } from "@/lib/paypal"
import { supabaseAdmin } from "@/lib/supabase/admin"

type PayPalWebhookEvent = {
  event_type?: string
  resource?: {
    id?: string
    status?: string
    custom_id?: string
    supplementary_data?: {
      related_ids?: {
        order_id?: string
      }
    }
  }
}

type PayPalVerifyResponse = {
  verification_status?: "SUCCESS" | "FAILURE"
}

async function verifyWebhookSignature(
  rawBody: string,
  headers: Headers
): Promise<boolean> {
  const allowSimulator = process.env.PAYPAL_WEBHOOK_ALLOW_SIMULATOR === "true"
  const simulatorEventId = headers.get("paypal-event-id")

  if (allowSimulator && simulatorEventId) {
    return true
  }

  const transmissionId = headers.get("paypal-transmission-id")
  const transmissionTime = headers.get("paypal-transmission-time")
  const certUrl = headers.get("paypal-cert-url")
  const authAlgo = headers.get("paypal-auth-algo")
  const transmissionSig = headers.get("paypal-transmission-sig")
  const webhookId = process.env.PAYPAL_WEBHOOK_ID

  if (
    !transmissionId ||
    !transmissionTime ||
    !certUrl ||
    !authAlgo ||
    !transmissionSig ||
    !webhookId
  ) {
    return false
  }

  let webhookEvent: unknown
  try {
    webhookEvent = JSON.parse(rawBody)
  } catch {
    return false
  }

  const accessToken = await getPayPalAccessToken()
  let response: Response
  try {
    response = await fetch(
      `${getPayPalApiBase()}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth_algo: authAlgo,
          cert_url: certUrl,
          transmission_id: transmissionId,
          transmission_sig: transmissionSig,
          transmission_time: transmissionTime,
          webhook_id: webhookId,
          webhook_event: webhookEvent,
        }),
      }
    )
  } catch {
    return false
  }

  if (!response.ok) {
    return false
  }

  const data = (await response.json()) as PayPalVerifyResponse
  return data.verification_status === "SUCCESS"
}

async function updatePaymentStatus(
  orderId: string,
  status: "succeeded" | "failed" | "refunded",
  payload: PayPalWebhookEvent
) {
  await supabaseAdmin
    .from("payments")
    .update({
      status,
      raw_payload: payload,
    })
    .eq("provider", "paypal")
    .eq("provider_payment_id", orderId)
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const isValid = await verifyWebhookSignature(rawBody, request.headers)

  if (!isValid) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  let event: PayPalWebhookEvent
  try {
    event = JSON.parse(rawBody) as PayPalWebhookEvent
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const eventType = event.event_type || ""
  const orderId = event.resource?.supplementary_data?.related_ids?.order_id

  if (orderId) {
    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      await updatePaymentStatus(orderId, "succeeded", event)
    } else if (eventType === "PAYMENT.CAPTURE.DENIED") {
      await updatePaymentStatus(orderId, "failed", event)
    } else if (eventType === "PAYMENT.CAPTURE.REFUNDED") {
      await updatePaymentStatus(orderId, "refunded", event)
    }
  }

  return NextResponse.json({ ok: true })
}
