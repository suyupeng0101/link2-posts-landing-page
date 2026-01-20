import type { CaptionSegment } from "@/lib/youtube-captions"
import { fetchRapidApiCaptions } from "@/lib/rapidapi-transcript"

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

export class TranscriptError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function fetchYoutubeTranscript({
  youtubeUrl,
  transcriptLanguage = "auto",
  provider = "rapidapi",
}: TranscriptRequest): Promise<TranscriptResult> {
  if (!youtubeUrl) {
    throw new TranscriptError("YouTube URL is required", 400)
  }

  const videoId = extractVideoId(youtubeUrl)
  if (!videoId) {
    throw new TranscriptError("Invalid YouTube URL", 400)
  }

  let captions: CaptionSegment[] = []

  switch (provider) {
    case "rapidapi":
      captions = await fetchRapidApiCaptions(videoId)
      break
    default:
      throw new TranscriptError("Unsupported transcript provider", 400)
  }

  if (!captions.length) {
    throw new TranscriptError("No transcript found via RapidAPI.", 404)
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
