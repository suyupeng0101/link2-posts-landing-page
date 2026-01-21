import { NextRequest, NextResponse } from "next/server"
import { fetchYoutubeTranscript } from "@/lib/youtube-transcript"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { ApiError, apiErrorResponse } from "@/lib/api-error"

const CREDITS_PER_GENERATION = 12

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return apiErrorResponse(new ApiError("unauthorized", 401))
    }

    const { youtubeUrl, transcriptLanguage = "auto" } = await request.json()

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

    const result = await fetchYoutubeTranscript({
      youtubeUrl,
      transcriptLanguage,
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ApiError && error.logMessage) {
      console.error("Error fetching captions:", error.logMessage)
    } else {
      console.error("Error fetching captions:", error)
    }
    return apiErrorResponse(error, "captions_fetch_failed", 500)
  }
}
