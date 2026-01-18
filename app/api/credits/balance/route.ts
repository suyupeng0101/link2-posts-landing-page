import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from("credits_balance")
    .select("balance, updated_at")
    .eq("user_id", authData.user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch balance" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    balance: data?.balance ?? 0,
    updatedAt: data?.updated_at ?? null,
  })
}
