import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ApiError, apiErrorResponse } from "@/lib/api-error"

export async function GET() {
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData.user) {
    return apiErrorResponse(new ApiError("unauthorized", 401))
  }

  const { data, error } = await supabase
    .from("credits_balance")
    .select("balance, updated_at")
    .eq("user_id", authData.user.id)
    .maybeSingle()

  if (error) {
    console.error("credits balance error", error)
    return apiErrorResponse(new ApiError("credits_balance_failed", 500))
  }

  return NextResponse.json({
    balance: data?.balance ?? 0,
    updatedAt: data?.updated_at ?? null,
  })
}
