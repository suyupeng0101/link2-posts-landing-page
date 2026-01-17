import { NextResponse } from "next/server"
import { getPayPalAccessToken, getPayPalApiBase } from "@/lib/paypal"

type CaptureOrderPayload = {
  orderId: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CaptureOrderPayload

    if (!body.orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
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
      return NextResponse.json(
        { error: data?.message || "PayPal capture failed", details: data },
        { status: response.status }
      )
    }

    return NextResponse.json({ status: data.status, details: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Capture order failed" },
      { status: 500 }
    )
  }
}
