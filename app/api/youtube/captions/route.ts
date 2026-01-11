import { NextRequest, NextResponse } from "next/server"
import { YoutubeTranscript } from "youtube-transcript"

export async function POST(request: NextRequest) {
  try {
    const { youtubeUrl, transcriptLanguage } = await request.json()

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

    const captions = await fetchYouTubeCaptions(videoId, transcriptLanguage)

    if (!captions || captions.length === 0) {
      return NextResponse.json(
        { error: "No captions found for this video" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      videoId,
      captions,
      transcriptLanguage,
      source: "youtube_captions"
    })
  } catch (error) {
    console.error("Error fetching captions:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch captions"
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

async function fetchYouTubeCaptions(
  videoId: string,
  language: string = "auto"
): Promise<Array<{ start: number; end: number; text: string }>> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: language === "auto" ? undefined : language
    })

    return transcript.map((item) => ({
      start: item.offset / 1000,
      end: (item.offset + item.duration) / 1000,
      text: item.text
    }))
  } catch (error) {
    console.error("Error fetching captions from YouTube:", error)
    throw new Error(
      error instanceof Error 
        ? error.message 
        : "Failed to fetch captions. The video may not have captions or is not accessible."
    )
  }
}
