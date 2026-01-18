import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

const SIGNUP_BONUS_CREDITS = 12

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const user = data.user

      if (user) {
        try {
          const { data: existingUser } = await supabaseAdmin
            .from("user_profiles")
            .select("user_id, login_count")
            .eq("user_id", user.id)
            .maybeSingle()

          if (existingUser) {
            const loginCount = (existingUser.login_count ?? 0) + 1
            await supabaseAdmin
              .from("user_profiles")
              .update({
                last_login_at: new Date().toISOString(),
                login_count: loginCount,
              })
              .eq("user_id", user.id)
          } else {
            await supabaseAdmin.from("user_profiles").insert({
              user_id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name ?? null,
              avatar_url: user.user_metadata?.avatar_url ?? null,
              provider: user.app_metadata?.provider ?? null,
              created_at: new Date().toISOString(),
              last_login_at: new Date().toISOString(),
              login_count: 1,
              points_balance: 0,
              points_earned_total: 0,
              points_spent_total: 0,
            })

            await supabaseAdmin.from("credits_balance").upsert({
              user_id: user.id,
              balance: SIGNUP_BONUS_CREDITS,
              updated_at: new Date().toISOString(),
            })

            await supabaseAdmin.from("credits_ledger").insert({
              user_id: user.id,
              change_amount: SIGNUP_BONUS_CREDITS,
              reason: "signup",
              note: "signup bonus",
            })
          }
        } catch {
          // Ignore profile sync errors to avoid blocking login
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/?auth=error&message=auth_callback`)
}
