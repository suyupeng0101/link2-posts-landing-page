import { NextRequest, NextResponse } from "next/server"
import { generateOutputsWithModel } from "@/lib/repurpose-generation"
import type { CaptionSegment } from "@/lib/youtube-captions"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
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

    const jobId = generateJobId()

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

    return NextResponse.json({
      jobId,
      status: "succeeded",
      outputs
    })
  } catch (error) {
    console.error("Error creating job:", error)
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
