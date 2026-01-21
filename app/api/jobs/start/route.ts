import { NextRequest, NextResponse } from "next/server"
import { generateOutputsWithModel } from "@/lib/repurpose-generation"
import type { CaptionSegment } from "@/lib/youtube-captions"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { extractVideoId } from "@/lib/youtube-transcript"
import { ApiError, apiErrorResponse, parseApiErrorCode } from "@/lib/api-error"

const CREDITS_PER_GENERATION = 12

export async function POST(request: NextRequest) {
  let jobId: number | null = null

  try {
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return apiErrorResponse(new ApiError("unauthorized", 401))
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
      return apiErrorResponse(new ApiError("invalid_input", 400))
    }

    const videoId = providedVideoId || extractVideoId(youtubeUrl)
    if (!videoId) {
      return apiErrorResponse(new ApiError("invalid_youtube_url", 400))
    }

    const { data: creditRow, error: creditError } = await supabaseAdmin
      .from("credits_balance")
      .select("balance")
      .eq("user_id", authData.user.id)
      .maybeSingle()

    if (creditError) {
      return apiErrorResponse(new ApiError("credits_check_failed", 500))
    }

    const currentBalance = creditRow?.balance ?? 0
    if (currentBalance < CREDITS_PER_GENERATION) {
      return apiErrorResponse(new ApiError("credits_insufficient", 402))
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
      return apiErrorResponse(new ApiError("job_create_failed", 500))
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
      return apiErrorResponse(new ApiError("credits_update_failed", 500))
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
      return apiErrorResponse(new ApiError("credits_record_failed", 500))
    }

    const captions = await resolveCaptions({
      request,
      youtubeUrl,
      transcriptLanguage,
      providedCaptions
    })

    if (!captions.length) {
      return apiErrorResponse(new ApiError("captions_not_found", 404))
    }

    const fullText = captions.map((segment) => segment.text).join(" ")

    let outputs
    try {
      outputs = await generateOutputsWithModel({
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
    } catch (error) {
      if (error instanceof ApiError && error.logMessage) {
        console.error("Generation error:", error.logMessage)
      } else {
        console.error("Generation error:", error)
      }
      throw new ApiError("generation_failed", 500)
    }

    const itemsToInsert = [
      ...outputs.x_thread.map((item) => ({
        job_id: jobId,
        item_type: "x_thread",
        content: item,
      })),
      ...outputs.x_singles.map((item) => ({
        job_id: jobId,
        item_type: "x_single",
        content: item,
      })),
      {
        job_id: jobId,
        item_type: "youtube_seo",
        content: outputs.youtube_seo,
      },
    ]

    const { error: itemsError } = await supabaseAdmin
      .from("generation_job_items")
      .insert(itemsToInsert)

    if (itemsError) {
      await supabaseAdmin
        .from("generation_jobs")
        .update({ status: "failed" })
        .eq("id", jobId)
      return apiErrorResponse(new ApiError("job_outputs_failed", 500))
    }

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
    if (error instanceof ApiError && error.logMessage) {
      console.error("Error creating job:", error.logMessage)
    } else {
      console.error("Error creating job:", error)
    }
    if (jobId) {
      await supabaseAdmin
        .from("generation_jobs")
        .update({ status: "failed" })
        .eq("id", jobId)
    }
    return apiErrorResponse(error, "job_create_failed", 500)
  }
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
    const code = parseApiErrorCode(data?.error)
    if (code) {
      throw new ApiError(code, response.status)
    }
    throw new ApiError("captions_fetch_failed", response.status)
  }

  return Array.isArray(data?.captions) ? data.captions : []
}
