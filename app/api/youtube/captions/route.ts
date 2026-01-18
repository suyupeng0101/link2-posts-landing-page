import { NextRequest, NextResponse } from "next/server"
import { fetchRapidApiCaptions } from "@/lib/rapidapi-transcript"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

const CREDITS_PER_GENERATION = 12

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { youtubeUrl, transcriptLanguage = "auto" } = await request.json()

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      )
    }

    const videoId = extractVideoId(youtubeUrl)
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

    const captions = await fetchRapidApiCaptions(videoId)

    if (!captions || captions.length === 0) {
      return NextResponse.json(
        { error: "No transcript found via RapidAPI." },
        { status: 404 }
      )
    }

    return NextResponse.json({
      videoId,
      captions,
      transcriptLanguage,
      source: "rapidapi"
    })
  } catch (error) {
    console.error("Error fetching captions:", error)

    let errorMessage = "Failed to fetch captions"

    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { error: errorMessage },
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
