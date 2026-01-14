import { NextRequest, NextResponse } from "next/server"
import { fetchRapidApiCaptions } from "@/lib/rapidapi-transcript"

export async function POST(request: NextRequest) {
  try {
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
