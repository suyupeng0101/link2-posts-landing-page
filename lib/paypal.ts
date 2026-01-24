import "server-only"

const paypalApiBase =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com"

function getPayPalCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("PayPal env not configured")
  }

  return { clientId, clientSecret }
}

export function getPayPalApiBase() {
  return paypalApiBase
}

export async function getPayPalAccessToken() {
  const { clientId, clientSecret } = getPayPalCredentials()
  const response = await fetch(`${paypalApiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  const data = await response.json()

  if (!response.ok) {
    const message = data?.error_description || data?.message || "PayPal auth failed"
    throw new Error(message)
  }

  return data.access_token as string
}
