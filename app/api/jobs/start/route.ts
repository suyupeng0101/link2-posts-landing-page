import { NextRequest, NextResponse } from "next/server"
import { generateOutputsWithModel } from "@/lib/repurpose-generation"
import type { CaptionSegment } from "@/lib/youtube-captions"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

const CREDITS_PER_GENERATION = 12

export async function POST(request: NextRequest) {
  let jobId: number | null = null

  try {
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      youtubeUrl,
      transcriptLanguage = "auto",
      outputLanguage = "en",
      tone = "default",
      audience = "general",
      threadCount = 6,
      singlesCount = 2,
      titleCandidates = 5,
      cta = "Watch full video",
      captions: providedCaptions,
      videoId: providedVideoId
    } = await request.json()

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      )
    }

    const videoId = providedVideoId || extractVideoId(youtubeUrl)
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      )
    }

    const { data: creditRow, error: creditError } = await supabaseAdmin
      .from("credits_balance")
      .select("balance")
      .eq("user_id", authData.user.id)
      .maybeSingle()

    if (creditError) {
      return NextResponse.json(
        { error: "Failed to check credits" },
        { status: 500 }
      )
    }

    const currentBalance = creditRow?.balance ?? 0
    if (currentBalance < CREDITS_PER_GENERATION) {
      return NextResponse.json(
        { error: "积分不足，请先充值积分" },
        { status: 402 }
      )
    }

    const { data: jobRow, error: jobError } = await supabaseAdmin
      .from("generation_jobs")
      .insert({
        user_id: authData.user.id,
        status: "running",
        youtube_url: youtubeUrl,
        video_id: videoId,
        output_language: outputLanguage,
        tone,
        audience,
        thread_count: threadCount,
        singles_count: singlesCount,
        title_candidates: titleCandidates,
        cta,
        credits_spent: CREDITS_PER_GENERATION,
      })
      .select("id")
      .single()

    if (jobError) {
      return NextResponse.json(
        { error: "Failed to create job" },
        { status: 500 }
      )
    }

    jobId = jobRow.id

    const newBalance = currentBalance - CREDITS_PER_GENERATION

    const { error: balanceError } = await supabaseAdmin
      .from("credits_balance")
      .upsert({
        user_id: authData.user.id,
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })

    if (balanceError) {
      await supabaseAdmin
        .from("generation_jobs")
        .update({ status: "failed" })
        .eq("id", jobId)
      return NextResponse.json(
        { error: "Failed to update credits" },
        { status: 500 }
      )
    }

    const { error: ledgerError } = await supabaseAdmin
      .from("credits_ledger")
      .insert({
        user_id: authData.user.id,
        change_amount: -CREDITS_PER_GENERATION,
        reason: "generation",
        related_job_id: jobRow.id,
        note: "content generation",
      })

    if (ledgerError) {
      await supabaseAdmin
        .from("generation_jobs")
        .update({ status: "failed" })
        .eq("id", jobId)
      return NextResponse.json(
        { error: "Failed to record credits" },
        { status: 500 }
      )
    }

    const captions = await resolveCaptions({
      request,
      youtubeUrl,
      transcriptLanguage,
      providedCaptions
    })

    if (!captions.length) {
      return NextResponse.json(
        { error: "No captions found for this video. This video may not have captions available." },
        { status: 404 }
      )
    }

    const fullText = captions.map((segment) => segment.text).join(" ")

    const outputs = await generateOutputsWithModel({
      videoId,
      youtubeUrl,
      transcriptLanguage,
      outputLanguage,
      tone,
      audience,
      threadCount,
      singlesCount,
      titleCandidates,
      cta,
      captions,
      fullText
    })

    await supabaseAdmin
      .from("generation_jobs")
      .update({ status: "succeeded", finished_at: new Date().toISOString() })
      .eq("id", jobId)

    return NextResponse.json({
      jobId: String(jobId),
      status: "succeeded",
      outputs
    })
  } catch (error) {
    console.error("Error creating job:", error)
    if (jobId) {
      await supabaseAdmin
        .from("generation_jobs")
        .update({ status: "failed" })
        .eq("id", jobId)
    }
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    )
  }
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

async function resolveCaptions({
  request,
  youtubeUrl,
  transcriptLanguage,
  providedCaptions
}: {
  request: NextRequest
  youtubeUrl: string
  transcriptLanguage: string
  providedCaptions?: CaptionSegment[]
}): Promise<CaptionSegment[]> {
  if (Array.isArray(providedCaptions) && providedCaptions.length > 0) {
    return providedCaptions
  }

  const origin = new URL(request.url).origin
  const response = await fetch(`${origin}/api/youtube/captions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      youtubeUrl,
      transcriptLanguage
    })
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data?.error || "Failed to fetch captions")
  }

  return Array.isArray(data?.captions) ? data.captions : []
}
