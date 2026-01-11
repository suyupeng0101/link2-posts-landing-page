import { NextRequest, NextResponse } from "next/server"
import { YoutubeTranscript } from "youtube-transcript"

export async function POST(request: NextRequest) {
  try {
    const {
      youtubeUrl,
      transcriptLanguage = "auto",
      outputLanguage = "same_as_transcript",
      tone = "default",
      audience = "general",
      threadCount = 10,
      singlesCount = 3,
      titleCandidates = 5,
      cta = "Watch full video"
    } = await request.json()

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

    const jobId = generateJobId()

    const job = {
      id: jobId,
      youtubeUrl,
      videoId,
      transcriptLanguage,
      outputLanguage,
      tone,
      audience,
      threadCount,
      singlesCount,
      titleCandidates,
      cta,
      status: "queued",
      createdAt: new Date().toISOString()
    }

    processJob(jobId, job)

    return NextResponse.json({
      jobId,
      status: "queued",
      message: "Job created successfully"
    })
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json(
      { error: "Failed to create job" },
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

function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

async function processJob(jobId: string, job: any) {
  try {
    console.log(`[Job ${jobId}] Processing started`)

    const captions = await fetchCaptions(job.videoId, job.transcriptLanguage)

    if (!captions || captions.length === 0) {
      console.log(`[Job ${jobId}] No captions found`)
      return
    }

    const fullText = captions.map((c: any) => c.text).join(" ")

    const outputs = generateOutputs(fullText, captions, job)

    console.log(`[Job ${jobId}] Processing completed`)
  } catch (error) {
    console.error(`[Job ${jobId}] Processing failed:`, error)
  }
}

async function fetchCaptions(
  videoId: string,
  language: string
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
    console.error("Error fetching captions:", error)
    return []
  }
}

function generateOutputs(
  fullText: string,
  captions: Array<{ start: number; end: number; text: string }>,
  job: any
) {
  const thread = generateThread(fullText, captions, job.threadCount)
  const singles = generateSingles(fullText, captions, job.singlesCount)
  const seo = generateSEO(fullText, captions, job)

  return {
    thread,
    singles,
    seo
  }
}

function generateThread(
  text: string,
  captions: Array<{ start: number; end: number; text: string }>,
  count: number
) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10)
  const thread: Array<{ order: number; text: string; sourceSegments: Array<{ start: number; end: number }> }> = []

  for (let i = 0; i < Math.min(count, sentences.length); i++) {
    const segment = captions[i % captions.length]
    thread.push({
      order: i + 1,
      text: sentences[i].trim(),
      sourceSegments: segment ? [{ start: segment.start, end: segment.end }] : []
    })
  }

  return thread
}

function generateSingles(
  text: string,
  captions: Array<{ start: number; end: number; text: string }>,
  count: number
) {
  const angles = ["summary", "insight", "list"]
  const singles: Array<{ angle: string; text: string; sourceSegments: Array<{ start: number; end: number }> }> = []

  for (let i = 0; i < Math.min(count, angles.length); i++) {
    const segment = captions[i % captions.length]
    singles.push({
      angle: angles[i],
      text: `${angles[i].charAt(0).toUpperCase() + angles[i].slice(1)}: ${text.substring(0, 200)}...`,
      sourceSegments: segment ? [{ start: segment.start, end: segment.end }] : []
    })
  }

  return singles
}

function generateSEO(
  text: string,
  captions: Array<{ start: number; end: number; text: string }>,
  job: any
) {
  const words = text.split(/\s+/).filter(w => w.length > 3)
  const uniqueWords = [...new Set(words)].slice(0, 10)

  return {
    titles: [
      `How to ${uniqueWords[0] || "Master"} This Topic`,
      `The Ultimate Guide to ${uniqueWords[1] || "Success"}`,
      `5 Tips for ${uniqueWords[2] || "Growth"}`,
      `Everything You Need to Know About ${uniqueWords[3] || "This"}`,
      `${uniqueWords[4] || "Amazing"}: A Complete Overview`
    ],
    description: `Learn about ${uniqueWords.slice(0, 5).join(", ")}. ${job.cta}.`,
    chapters: captions.slice(0, 5).map((cap, idx) => ({
      timestamp: formatTimestamp(cap.start),
      title: cap.text.substring(0, 50),
      sourceSegments: [{ start: cap.start, end: cap.end }]
    })),
    tags: uniqueWords.slice(0, 10)
  }
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}
