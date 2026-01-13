export type CaptionSegment = { start: number; end: number; text: string }

export function parseCaptionPayload(payload: string): CaptionSegment[] {
  const trimmed = payload.trim()
  if (!trimmed) return []

  if (trimmed.startsWith("WEBVTT")) {
    return parseVtt(trimmed)
  }

  if (trimmed.startsWith("{")) {
    return parseJson3(trimmed)
  }

  if (trimmed.startsWith("<")) {
    return parseTimedtextXml(trimmed)
  }

  return []
}

function parseVtt(vtt: string): CaptionSegment[] {
  const blocks = vtt.replace(/\r/g, "").split(/\n\n+/)
  const captions: CaptionSegment[] = []

  for (const block of blocks) {
    const lines = block.split("\n").filter((line) => line.trim().length > 0)
    if (lines.length === 0) continue
    if (lines[0].startsWith("WEBVTT")) continue
    if (lines[0].startsWith("NOTE")) continue

    const timeLineIndex = lines.findIndex((line) => line.includes("-->"))
    if (timeLineIndex === -1) continue

    const timeLine = lines[timeLineIndex]
    const match = timeLine.match(
      /(\d{1,2}:\d{2}:\d{2}[.,]\d{3}|\d{1,2}:\d{2}[.,]\d{3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[.,]\d{3}|\d{1,2}:\d{2}[.,]\d{3})/
    )
    if (!match) continue

    const start = parseTimecode(match[1])
    const end = parseTimecode(match[2])
    const textLines = lines.slice(timeLineIndex + 1)
    const text = decodeHtmlEntities(
      textLines.join(" ").replace(/<[^>]+>/g, "").trim()
    )

    if (text) {
      captions.push({ start, end, text })
    }
  }

  return captions
}

function parseTimedtextXml(xml: string): CaptionSegment[] {
  const captions: CaptionSegment[] = []
  const textRegex =
    /<text[^>]*start="([^"]+)"[^>]*dur="([^"]+)"[^>]*>([\s\S]*?)<\/text>/g
  let match

  while ((match = textRegex.exec(xml)) !== null) {
    const start = parseFloat(match[1])
    const duration = parseFloat(match[2])
    const end = start + duration
    const text = decodeHtmlEntities(
      match[3].replace(/\n/g, " ").trim()
    )

    if (text) {
      captions.push({ start, end, text })
    }
  }

  return captions
}

function parseJson3(json: string): CaptionSegment[] {
  try {
    const data = JSON.parse(json)
    const events = Array.isArray(data?.events) ? data.events : []
    const captions: CaptionSegment[] = []

    for (const event of events) {
      if (!event || !Array.isArray(event.segs)) continue
      const start = Number(event.tStartMs ?? 0) / 1000
      const duration = Number(event.dDurationMs ?? 0) / 1000
      const end = start + duration
      const text = decodeHtmlEntities(
        event.segs.map((seg: any) => seg?.utf8 || "").join("").trim()
      )
      if (text) {
        captions.push({ start, end, text })
      }
    }

    return captions
  } catch {
    return []
  }
}

function parseTimecode(timecode: string): number {
  const match = timecode.match(
    /(?:(\d{1,2}):)?(\d{2}):(\d{2})[.,](\d{3})/
  )
  if (!match) return 0
  const hours = match[1] ? parseInt(match[1], 10) : 0
  const minutes = parseInt(match[2], 10)
  const seconds = parseInt(match[3], 10)
  const ms = parseInt(match[4], 10)
  return hours * 3600 + minutes * 60 + seconds + ms / 1000
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
}
