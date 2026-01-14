import type { CaptionSegment } from "@/lib/youtube-captions"

type RapidApiSegment = {
  text?: unknown
  subtitle?: unknown
  start?: unknown
  offset?: unknown
  end?: unknown
  duration?: unknown
  dur?: unknown
  startTime?: unknown
  endTime?: unknown
}

const DEFAULT_RAPIDAPI_HOST = "youtube-transcriptor.p.rapidapi.com"

export async function fetchRapidApiCaptions(
  videoId: string
): Promise<CaptionSegment[]> {
  const host =
    process.env.RAPIDAPI_YOUTUBE_TRANSCRIPTOR_HOST || DEFAULT_RAPIDAPI_HOST
  const apiKey = process.env.RAPIDAPI_KEY

  if (!apiKey) {
    throw new Error("Missing RAPIDAPI_KEY for RapidAPI transcript requests")
  }

  const url = `https://${host}/transcript?video_id=${encodeURIComponent(videoId)}`

  const response = await fetch(url, {
    headers: {
      "x-rapidapi-host": host,
      "x-rapidapi-key": apiKey
    }
  })

  if (!response.ok) {
    const detail = await readResponseText(response)
    const suffix = detail ? `: ${detail}` : ""
    throw new Error(
      `RapidAPI transcript request failed (${response.status})${suffix}`
    )
  }

  const payload = await response.json()
  return normalizeRapidApiPayload(payload)
}

async function readResponseText(response: Response) {
  try {
    return (await response.text()).slice(0, 300).trim()
  } catch {
    return ""
  }
}

function normalizeRapidApiPayload(payload: unknown): CaptionSegment[] {
  const segments = extractSegments(payload)
  if (!segments.length) return []

  const captions: CaptionSegment[] = []

  for (const raw of segments) {
    const segment = raw as RapidApiSegment
    const text = String(segment.text ?? segment.subtitle ?? "").trim()
    if (!text) continue

    const start = toNumber(
      segment.start ?? segment.offset ?? segment.startTime
    )
    const endValue = segment.end ?? segment.endTime
    const duration = toNumber(segment.duration ?? segment.dur)
    const end = endValue !== undefined ? toNumber(endValue) : start + duration

    captions.push({
      start: Math.max(0, start),
      end: Math.max(start, end),
      text
    })
  }

  return captions
}

function extractSegments(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    const first = payload[0]
    if (first && typeof first === "object") {
      const record = first as Record<string, unknown>
      if (Array.isArray(record.transcription)) {
        return record.transcription
      }
    }
    return payload
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>
    const candidates = [
      record.transcript,
      record.transcription,
      record.segments,
      record.captions,
      record.data,
      record.result
    ]

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate
    }
  }

  return []
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}
