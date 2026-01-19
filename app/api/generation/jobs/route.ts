import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = Math.min(
    Number.parseInt(searchParams.get("limit") ?? "20", 10),
    50
  )

  const { data, error } = await supabase
    .from("generation_jobs")
    .select("id, status, credits_spent, created_at, finished_at, youtube_url, video_id, output_language")
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("generation jobs error", error)
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    )
  }

  return NextResponse.json({ items: data ?? [] })
}
