import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

type Params = {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: Params) {
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const jobId = Number.parseInt(id, 10)
  if (!Number.isFinite(jobId)) {
    return NextResponse.json({ error: "Invalid job id" }, { status: 400 })
  }

  const { data: job, error: jobError } = await supabaseAdmin
    .from("generation_jobs")
    .select("id, status, credits_spent, created_at, finished_at, youtube_url, video_id, output_language, tone, audience, thread_count, singles_count, title_candidates, cta")
    .eq("user_id", authData.user.id)
    .eq("id", jobId)
    .maybeSingle()

  if (jobError) {
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    )
  }

  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const { data: items, error: itemsError } = await supabaseAdmin
    .from("generation_job_items")
    .select("id, item_type, content, created_at")
    .eq("job_id", jobId)
    .order("id", { ascending: true })

  if (itemsError) {
    return NextResponse.json(
      { error: "Failed to fetch job items" },
      { status: 500 }
    )
  }

  return NextResponse.json({ job, items: items ?? [] })
}
