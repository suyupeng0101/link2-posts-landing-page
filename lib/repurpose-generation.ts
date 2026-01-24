import "server-only"

import type { CaptionSegment } from "@/lib/youtube-captions"

type SourceSegment = { start: number; end: number }
type ThreadItem = { order: number; text: string; source_segments: SourceSegment[] }
type SingleItem = { angle: string; text: string; source_segments: SourceSegment[] }
type ChapterItem = { timestamp: string; title: string; source_segments: SourceSegment[] }
type SeoBlock = {
  titles: string[]
  description: string
  chapters: ChapterItem[]
  tags: string[]
}

export type GenerationResult = {
  meta: {
    video_id: string
    input_url: string
    transcript_source: string
    requested_transcript_language: string
    detected_language: string
    output_language: string
  }
  x_thread: ThreadItem[]
  x_singles: SingleItem[]
  youtube_seo: SeoBlock
  generation_params: {
    tone: string
    audience: string
    thread_count: number
    singles_count: number
    title_candidates: number
    cta: string
  }
}

type GenerationInput = {
  videoId: string
  youtubeUrl: string
  transcriptLanguage: string
  outputLanguage: string
  tone: string
  audience: string
  threadCount: number
  singlesCount: number
  titleCandidates: number
  cta: string
  captions: CaptionSegment[]
  fullText: string
}

const DEFAULT_MODEL = "openai/gpt-4o-mini"

export async function generateOutputsWithModel(
  input: GenerationInput
): Promise<GenerationResult> {
  const apiKey = process.env.OPENAI_API_KEY
  const baseUrl = process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1"
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY for generation")
  }

  const prompt = buildPrompt(input)
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.5,
      max_tokens: 1600,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You generate high-engagement X threads, singles, and YouTube SEO. Reply with ONLY valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  })

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(
      `Model request failed: ${response.status} ${JSON.stringify(payload)}`
    )
  }

  const content = payload?.choices?.[0]?.message?.content
  if (!content || typeof content !== "string") {
    throw new Error("Model response is empty")
  }

  const parsed = safeJsonParse(content)
  if (!parsed) {
    throw new Error("Model returned invalid JSON")
  }

  return normalizeOutput(parsed, input)
}

function buildPrompt(input: GenerationInput) {
  const segments = input.captions.slice(0, 200).map((segment) => ({
    start: segment.start,
    end: segment.end,
    text: segment.text
  }))
  const transcriptLines = segments.map(
    (segment) => `${formatTimestamp(segment.start)} ${segment.text}`
  )

  const outputLanguageName =
    input.outputLanguage === "zh-Hans" ? "Chinese" : "English"

  return [
    "Generate high-engagement outputs based on the transcript lines.",
    "Each line is formatted as MM:SS <text>.",
    "Important: ignore the timestamp, use only the text after MM:SS to write outputs.",
    "Make the content punchy, clear, and shareable; prioritize strong hooks and actionable takeaways.",
    "Return ONLY valid JSON matching the schema below (no markdown, no extra text).",
    "",
    "Schema:",
    "{",
    '  "meta": {',
    '    "video_id": "string",',
    '    "input_url": "string",',
    '    "transcript_source": "youtube_captions",',
    '    "requested_transcript_language": "string",',
    '    "detected_language": "string",',
    '    "output_language": "string"',
    "  },",
    '  "x_thread": [',
    '    {"order": 1, "text": "string", "source_segments": [{"start": 0, "end": 1}]}',
    "  ],",
    '  "x_singles": [',
    '    {"angle": "summary|insight|list|opinion", "text": "string", "source_segments": [{"start": 0, "end": 1}]}',
    "  ],",
    '  "youtube_seo": {',
    '    "titles": ["string", "string", "string", "string", "string"],',
    '    "description": "string",',
    '    "chapters": [{"timestamp": "MM:SS", "title": "string", "source_segments": [{"start": 0, "end": 1}]}],',
    '    "tags": ["string"]',
    "  },",
    '  "generation_params": {',
    '    "tone": "string",',
    '    "audience": "string",',
    '    "thread_count": number,',
    '    "singles_count": number,',
    '    "title_candidates": number,',
    '    "cta": "string"',
    "  }",
    "}",
    "",
    `Requested transcript language: ${input.transcriptLanguage}`,
    `Output language: ${outputLanguageName} (must write all outputs in this language)`,
    `Tone: ${input.tone}`,
    `Audience: ${input.audience}`,
    `Thread count: ${input.threadCount} (must output between 4 and 8, prefer ${input.threadCount})`,
    `Singles count: ${input.singlesCount} (must output between 2 and 3, prefer ${input.singlesCount})`,
    `Title candidates: ${input.titleCandidates} (must output exactly this many)`,
    `CTA: ${input.cta}`,
    "",
    "Transcript lines:",
    transcriptLines.join("\n"),
    "",
    "Segments JSON:",
    JSON.stringify(segments)
  ].join("\n")
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

function safeJsonParse(content: string) {
  try {
    return JSON.parse(content)
  } catch {
    return null
  }
}

function normalizeOutput(
  data: any,
  input: GenerationInput
): GenerationResult {
  const thread = Array.isArray(data?.x_thread) ? data.x_thread : []
  const singles = Array.isArray(data?.x_singles) ? data.x_singles : []
  const seo = data?.youtube_seo || {}
  const fallback = buildFallback(input)

  return {
    meta: {
      video_id: input.videoId,
      input_url: input.youtubeUrl,
      transcript_source: "youtube_captions",
      requested_transcript_language: input.transcriptLanguage,
      detected_language: input.transcriptLanguage === "auto" ? "unknown" : input.transcriptLanguage,
      output_language: input.outputLanguage
    },
    x_thread: (thread.length ? thread : fallback.x_thread)
      .slice(0, input.threadCount)
      .map((item: any, index: number) => ({
        order: Number(item?.order ?? index + 1),
        text: String(item?.text ?? "").trim(),
        source_segments: normalizeSourceSegments(item?.source_segments)
      })),
    x_singles: (singles.length ? singles : fallback.x_singles)
      .slice(0, input.singlesCount)
      .map((item: any) => ({
        angle: String(item?.angle ?? "summary"),
        text: String(item?.text ?? "").trim(),
        source_segments: normalizeSourceSegments(item?.source_segments)
      })),
    youtube_seo: {
      titles: Array.isArray(seo?.titles) && seo.titles.length
        ? seo.titles.slice(0, input.titleCandidates)
        : fallback.youtube_seo.titles,
      description: String(seo?.description ?? "") || fallback.youtube_seo.description,
      chapters: Array.isArray(seo?.chapters) && seo.chapters.length
        ? seo.chapters.map((chapter: any) => ({
            timestamp: String(chapter?.timestamp ?? ""),
            title: String(chapter?.title ?? "").trim(),
            source_segments: normalizeSourceSegments(chapter?.source_segments)
          }))
        : fallback.youtube_seo.chapters,
      tags: Array.isArray(seo?.tags) && seo.tags.length
        ? seo.tags.slice(0, 10)
        : fallback.youtube_seo.tags
    },
    generation_params: {
      tone: input.tone,
      audience: input.audience,
      thread_count: input.threadCount,
      singles_count: input.singlesCount,
      title_candidates: input.titleCandidates,
      cta: input.cta
    }
  }
}

function normalizeSourceSegments(value: any): SourceSegment[] {
  if (!Array.isArray(value)) return []
  return value
    .map((segment) => ({
      start: Number(segment?.start) || 0,
      end: Number(segment?.end) || 0
    }))
    .filter((segment) => segment.end >= segment.start)
}

function buildFallback(input: GenerationInput): GenerationResult {
  const segments = input.captions.slice(0, Math.max(input.threadCount, 6))
  const thread = segments.slice(0, input.threadCount).map((segment, index) => ({
    order: index + 1,
    text: segment.text,
    source_segments: [{ start: segment.start, end: segment.end }]
  }))
  const singles = segments.slice(0, input.singlesCount).map((segment, index) => ({
    angle: index === 0 ? "summary" : "insight",
    text: segment.text,
    source_segments: [{ start: segment.start, end: segment.end }]
  }))
  const chapters = segments.slice(0, 4).map((segment) => ({
    timestamp: formatTimestamp(segment.start),
    title: segment.text.slice(0, 40),
    source_segments: [{ start: segment.start, end: segment.end }]
  }))

  return {
    meta: {
      video_id: input.videoId,
      input_url: input.youtubeUrl,
      transcript_source: "youtube_captions",
      requested_transcript_language: input.transcriptLanguage,
      detected_language: input.transcriptLanguage === "auto" ? "unknown" : input.transcriptLanguage,
      output_language: input.outputLanguage
    },
    x_thread: thread,
    x_singles: singles,
    youtube_seo: {
      titles: buildFallbackTitles(input),
      description: `${segments[0]?.text || "Video summary."} ${input.cta}.`,
      chapters,
      tags: buildFallbackTags(segments)
    },
    generation_params: {
      tone: input.tone,
      audience: input.audience,
      thread_count: input.threadCount,
      singles_count: input.singlesCount,
      title_candidates: input.titleCandidates,
      cta: input.cta
    }
  }
}

function buildFallbackTitles(input: GenerationInput) {
  const base = input.captions[0]?.text || "Key takeaways"
  return [
    `${base.slice(0, 60)}`,
    `Top takeaways: ${base.slice(0, 50)}`,
    `What you need to know about ${base.slice(0, 40)}`,
    `The simple framework behind ${base.slice(0, 40)}`,
    `Quick guide: ${base.slice(0, 50)}`
  ].slice(0, input.titleCandidates)
}

function buildFallbackTags(segments: CaptionSegment[]) {
  const words = segments
    .map((segment) => segment.text)
    .join(" ")
    .split(/\s+/)
    .filter((word) => word.length > 3)
  const unique = Array.from(new Set(words))
  return unique.slice(0, 8)
}
