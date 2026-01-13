import { NextRequest, NextResponse } from "next/server"
import { YoutubeTranscript } from "youtube-transcript"
import { getSubtitles } from "youtube-captions-scraper"
import { parseCaptionPayload, type CaptionSegment } from "@/lib/youtube-captions"

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

    const result = await fetchYouTubeCaptions(videoId, transcriptLanguage)
    const captions = result.captions

    if (!captions || captions.length === 0) {
      return NextResponse.json(
        { error: buildNoCaptionsMessage() },
        { status: 404 }
      )
    }

    return NextResponse.json({
      videoId,
      captions,
      transcriptLanguage,
      source: result.source
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

async function fetchYouTubeCaptions(
  videoId: string,
  language: string
): Promise<{ captions: CaptionSegment[]; source: string }> {
  const normalizedLanguage = normalizeLanguage(language)
  const results: Array<{ captions: CaptionSegment[]; source: string }> = []

  try {
    const captions = await fetchCaptionsFromYoutubePage(
      videoId,
      normalizedLanguage
    )
    results.push({ captions, source: "youtube-page" })
  } catch (error) {
    console.error("Youtube page captions failed:", error)
  }

  try {
    const captions = await fetchTimedTextFallback(videoId, normalizedLanguage)
    results.push({ captions, source: "youtube-timedtext" })
  } catch (error) {
    console.error("Timedtext fallback failed:", error)
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(
      videoId,
      normalizedLanguage ? { lang: normalizedLanguage } : undefined
    )
    results.push({
      captions: transcript.map((item) => ({
        start: item.offset / 1000,
        end: (item.offset + item.duration) / 1000,
        text: item.text
      })),
      source: "youtube-transcript"
    })
  } catch (error) {
    console.error("YoutubeTranscript failed:", error)
  }

  if (normalizedLanguage) {
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId)
      results.push({
        captions: transcript.map((item) => ({
          start: item.offset / 1000,
          end: (item.offset + item.duration) / 1000,
          text: item.text
        })),
        source: "youtube-transcript:auto"
      })
    } catch (error) {
      console.error("YoutubeTranscript auto failed:", error)
    }
  }

  try {
    const subtitles = await getSubtitles({
      videoID: videoId,
      lang: normalizedLanguage || "en"
    })
    results.push({
      captions: subtitles.map((item: any) => ({
        start: Number(item.start) || 0,
        end: (Number(item.start) || 0) + (Number(item.dur) || 0),
        text: String(item.text || "").trim()
      })).filter((item: CaptionSegment) => item.text.length > 0),
      source: "youtube-captions-scraper"
    })
  } catch (error) {
    console.error("youtube-captions-scraper failed:", error)
  }

  if (normalizedLanguage && normalizedLanguage !== "en") {
    try {
      const subtitles = await getSubtitles({
        videoID: videoId,
        lang: "en"
      })
      results.push({
        captions: subtitles.map((item: any) => ({
          start: Number(item.start) || 0,
          end: (Number(item.start) || 0) + (Number(item.dur) || 0),
          text: String(item.text || "").trim()
        })).filter((item: CaptionSegment) => item.text.length > 0),
        source: "youtube-captions-scraper:en"
      })
    } catch (error) {
      console.error("youtube-captions-scraper en failed:", error)
    }
  }

  const best = results.find((result) => result.captions.length > 0)
  if (!best) {
    return { captions: [], source: "none" }
  }

  return best
}

function normalizeLanguage(language: string | undefined) {
  if (!language) return null
  if (language === "auto") return null
  return language.toLowerCase()
}

async function fetchCaptionsFromYoutubePage(
  videoId: string,
  language: string | null
): Promise<CaptionSegment[]> {
  const tracks = await fetchCaptionTracks(videoId)
  if (!tracks.length) {
    return []
  }

  const track = selectCaptionTrack(tracks, language)
  if (!track?.baseUrl) {
    return []
  }

  const urls = buildCaptionUrls(track.baseUrl)
  for (const url of urls) {
    try {
      const response = await fetch(url)
      if (!response.ok) continue
      const content = await response.text()
      const captions = parseCaptionPayload(content)
      if (captions.length > 0) {
        return captions
      }
    } catch (error) {
      console.error("Caption download failed:", error)
    }
  }

  return []
}

async function fetchCaptionTracks(videoId: string): Promise<any[]> {
  const urls = [
    `https://www.youtube.com/watch?v=${videoId}&hl=en&gl=US&persist_hl=1&persist_gl=1`,
    `https://www.youtube.com/watch?v=${videoId}&hl=en&gl=US&persist_hl=1&persist_gl=1&has_verified=1&bpctr=9999999999`
  ]

  for (const url of urls) {
    const response = await fetch(url, {
      headers: buildYoutubeHeaders()
    })

    if (!response.ok) {
      continue
    }

    const html = await response.text()
    const playerResponse = extractPlayerResponse(html)
    const tracks =
      playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks

    if (Array.isArray(tracks) && tracks.length > 0) {
      return tracks
    }
  }

  return []
}

function extractPlayerResponse(html: string) {
  const marker = "ytInitialPlayerResponse"
  const index = html.indexOf(marker)
  if (index === -1) return null

  const start = html.indexOf("{", index)
  if (start === -1) return null

  const json = sliceJsonObject(html, start)
  if (!json) return null

  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

function sliceJsonObject(text: string, startIndex: number) {
  let depth = 0
  let inString = false
  let isEscaped = false

  for (let i = startIndex; i < text.length; i++) {
    const char = text[i]

    if (inString) {
      if (isEscaped) {
        isEscaped = false
      } else if (char === "\\") {
        isEscaped = true
      } else if (char === "\"") {
        inString = false
      }
      continue
    }

    if (char === "\"") {
      inString = true
      continue
    }

    if (char === "{") depth += 1
    if (char === "}") depth -= 1
    if (depth === 0) {
      return text.slice(startIndex, i + 1)
    }
  }

  return null
}

function selectCaptionTrack(tracks: any[], language: string | null) {
  if (!tracks.length) return null
  if (!language) {
    return tracks.find((track) => track.kind !== "asr") || tracks[0]
  }

  const languageLower = language.toLowerCase()
  let track = tracks.find(
    (t) =>
      t.languageCode?.toLowerCase() === languageLower && t.kind !== "asr"
  )

  if (!track) {
    track = tracks.find(
      (t) => t.languageCode?.toLowerCase() === languageLower
    )
  }

  if (!track) {
    track = tracks.find((t) =>
      t.languageCode?.toLowerCase().startsWith(languageLower.substring(0, 2))
    )
  }

  return track || tracks[0]
}

function buildCaptionUrls(baseUrl: string) {
  const urls: string[] = []
  const hasFmt = baseUrl.includes("fmt=")

  if (hasFmt) {
    urls.push(baseUrl)
  } else {
    urls.push(`${baseUrl}&fmt=vtt`)
    urls.push(`${baseUrl}&fmt=srv3`)
    urls.push(`${baseUrl}&fmt=json3`)
    urls.push(baseUrl)
  }

  return urls
}

function buildNoCaptionsMessage() {
  if (!process.env.YOUTUBE_COOKIE) {
    return "No captions found. Configure YOUTUBE_COOKIE on the server to reduce captcha/410."
  }

  return "No captions found for this video. This video may not have captions available."
}

async function fetchTimedTextFallback(
  videoId: string,
  language: string | null
): Promise<CaptionSegment[]> {
  const listTracks = await fetchTimedTextTrackList(videoId)
  if (listTracks.length > 0) {
    const track = selectTimedTextTrack(listTracks, language)
    if (track) {
      const captions = await fetchTimedTextTrackCaptions(videoId, track)
      if (captions.length > 0) {
        return captions
      }
    }
  }

  const lang = language || "en"
  const candidates = [
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=vtt`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=json3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=srv3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&kind=asr&fmt=vtt`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&kind=asr&fmt=json3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&kind=asr`
  ]

  for (const url of candidates) {
    const response = await fetch(url, {
      headers: buildYoutubeHeaders()
    })
    if (!response.ok) continue
    const content = await response.text()
    const captions = parseCaptionPayload(content)
    if (captions.length > 0) {
      return captions
    }
  }

  return []
}

function buildYoutubeHeaders() {
  const headers: Record<string, string> = {
    "accept-language": "en-US,en;q=0.9",
    "user-agent":
      process.env.YOUTUBE_USER_AGENT ||
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    cookie: "CONSENT=YES+1; PREF=hl=en&gl=US"
  }

  if (process.env.YOUTUBE_COOKIE) {
    headers.cookie = process.env.YOUTUBE_COOKIE
  }

  return headers
}

async function fetchTimedTextTrackList(videoId: string) {
  const url = `https://www.youtube.com/api/timedtext?type=list&v=${videoId}`
  const response = await fetch(url, {
    headers: buildYoutubeHeaders()
  })
  if (!response.ok) {
    return []
  }

  const xml = await response.text()
  return parseTimedTextTrackList(xml)
}

type TimedTextTrack = {
  lang_code: string
  name?: string
  kind?: string
}

function parseTimedTextTrackList(xml: string): TimedTextTrack[] {
  const tracks: TimedTextTrack[] = []
  const trackRegex = /<track\b([^/>]+?)\/?>/g
  let match

  while ((match = trackRegex.exec(xml)) !== null) {
    const attrs = parseXmlAttributes(match[1])
    const lang = attrs.lang_code
    if (!lang) continue
    tracks.push({
      lang_code: lang,
      name: attrs.name,
      kind: attrs.kind
    })
  }

  return tracks
}

function parseXmlAttributes(raw: string) {
  const attrs: Record<string, string> = {}
  const attrRegex = /(\w+)="([^"]*)"/g
  let match

  while ((match = attrRegex.exec(raw)) !== null) {
    attrs[match[1]] = match[2]
  }

  return attrs
}

function selectTimedTextTrack(
  tracks: TimedTextTrack[],
  language: string | null
) {
  if (!tracks.length) return null
  if (!language) {
    return tracks.find((track) => track.kind !== "asr") || tracks[0]
  }

  const languageLower = language.toLowerCase()
  let track = tracks.find(
    (t) => t.lang_code.toLowerCase() === languageLower && t.kind !== "asr"
  )

  if (!track) {
    track = tracks.find((t) => t.lang_code.toLowerCase() === languageLower)
  }

  if (!track) {
    track = tracks.find((t) =>
      t.lang_code.toLowerCase().startsWith(languageLower.substring(0, 2))
    )
  }

  return track || tracks[0]
}

async function fetchTimedTextTrackCaptions(
  videoId: string,
  track: TimedTextTrack
): Promise<CaptionSegment[]> {
  const baseUrl = buildTimedTextTrackBaseUrl(videoId, track)
  const urls = buildCaptionUrls(baseUrl)

  for (const url of urls) {
    const response = await fetch(url, {
      headers: buildYoutubeHeaders()
    })
    if (!response.ok) continue
    const content = await response.text()
    const captions = parseCaptionPayload(content)
    if (captions.length > 0) {
      return captions
    }
  }

  return []
}

function buildTimedTextTrackBaseUrl(
  videoId: string,
  track: TimedTextTrack
) {
  const params = new URLSearchParams({
    v: videoId,
    lang: track.lang_code
  })

  if (track.kind) {
    params.set("kind", track.kind)
  }

  if (track.name) {
    params.set("name", track.name)
  }

  return `https://www.youtube.com/api/timedtext?${params.toString()}`
}
