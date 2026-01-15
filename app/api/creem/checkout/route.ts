import { NextRequest, NextResponse } from "next/server"

const creemApiBaseUrl = process.env.CREEM_API_BASE_URL ?? "https://api.creem.io"
const creemCheckoutPath = process.env.CREEM_CHECKOUT_PATH ?? "/v1/checkout-sessions"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.CREEM_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Missing CREEM_API_KEY" }, { status: 500 })
    }

    const payload = await request.json().catch(() => ({}))
    const priceId = typeof payload?.priceId === "string" ? payload.priceId : ""
    const planId = typeof payload?.planId === "string" ? payload.planId : ""

    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 })
    }

    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL
    if (!origin) {
      return NextResponse.json({ error: "Missing site URL" }, { status: 500 })
    }

    const checkoutEndpoint = new URL(creemCheckoutPath, creemApiBaseUrl).toString()
    const body = {
      price_id: priceId,
      success_url: `${origin}/pricing?status=success`,
      cancel_url: `${origin}/pricing?status=cancel`,
      metadata: {
        planId,
      },
    }

    const response = await fetch(checkoutEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || data?.message || "Creem request failed" },
        { status: response.status }
      )
    }

    const sessionUrl =
      data?.checkout_url ||
      data?.url ||
      data?.data?.checkout_url ||
      data?.data?.url ||
      ""

    if (!sessionUrl) {
      return NextResponse.json({ error: "Missing checkout url" }, { status: 502 })
    }

    return NextResponse.json({ checkoutUrl: sessionUrl })
  } catch (error) {
    console.error("Creem checkout error:", error)
    return NextResponse.json({ error: "Creem checkout failed" }, { status: 500 })
  }
}
