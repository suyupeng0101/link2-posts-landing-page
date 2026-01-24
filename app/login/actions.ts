"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function signInWithGoogle() {
  const supabase = await createClient()
  const headerStore = await headers()
  const origin =
    headerStore.get("origin") || process.env.SITE_URL || "http://localhost:3000"
  const callbackUrl = new URL("/auth/callback", origin).toString()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
    },
  })

  if (error) {
    redirect(`/?auth=error&message=${encodeURIComponent(error.message)}`)
  }

  if (data?.url) {
    redirect(data.url)
  }

  redirect("/?auth=error&message=missing_oauth_url")
}
