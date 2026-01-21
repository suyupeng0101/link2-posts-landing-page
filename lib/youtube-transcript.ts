import type { CaptionSegment } from "@/lib/youtube-captions"
import { fetchRapidApiCaptions } from "@/lib/rapidapi-transcript"
import { ApiError } from "@/lib/api-error"

export type TranscriptProvider = "rapidapi"

export type TranscriptRequest = {
  youtubeUrl: string
  transcriptLanguage?: string
  provider?: TranscriptProvider
}

export type TranscriptResult = {
  videoId: string
  captions: CaptionSegment[]
  transcriptLanguage: string
  source: TranscriptProvider
}

export async function fetchYoutubeTranscript({
  youtubeUrl,
  transcriptLanguage = "auto",
  provider = "rapidapi",
}: TranscriptRequest): Promise<TranscriptResult> {
  if (!youtubeUrl) {
    throw new ApiError("invalid_input", 400, "YouTube URL is required")
  }

  const videoId = extractVideoId(youtubeUrl)
  if (!videoId) {
    throw new ApiError("invalid_youtube_url", 400, "Invalid YouTube URL")
  }

  let captions: CaptionSegment[] = []

  switch (provider) {
    case "rapidapi":
      captions = await fetchRapidApiCaptions(videoId)
      break
    default:
      throw new ApiError("invalid_input", 400, "Unsupported transcript provider")
  }

  if (!captions.length) {
    throw new ApiError("captions_not_found", 404, "No transcript found")
  }

  return {
    videoId,
    captions,
    transcriptLanguage,
    source: provider,
  }
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}
