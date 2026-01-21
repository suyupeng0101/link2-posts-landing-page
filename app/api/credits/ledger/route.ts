import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ApiError, apiErrorResponse } from "@/lib/api-error"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData.user) {
    return apiErrorResponse(new ApiError("unauthorized", 401))
  }

  const { searchParams } = new URL(request.url)
  const limit = Math.min(
    Number.parseInt(searchParams.get("limit") ?? "20", 10),
    50
  )

  const { data, error } = await supabase
    .from("credits_ledger")
    .select("id, change_amount, reason, note, created_at")
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("credits ledger error", error)
    return apiErrorResponse(new ApiError("credits_ledger_failed", 500))
  }

  return NextResponse.json({ items: data ?? [] })
}
