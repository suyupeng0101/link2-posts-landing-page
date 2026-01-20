import { NextRequest, NextResponse } from "next/server"
import { fetchYoutubeTranscript, TranscriptError } from "@/lib/youtube-transcript"
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

    const result = await fetchYoutubeTranscript({
      youtubeUrl,
      transcriptLanguage,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching captions:", error)

    let errorMessage = "Failed to fetch captions"
    let status = 500

    if (error instanceof TranscriptError) {
      errorMessage = error.message
      status = error.status
    } else if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { error: errorMessage },
      { status }
    )
  }
}
