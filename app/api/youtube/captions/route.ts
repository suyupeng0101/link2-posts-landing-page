import { NextRequest, NextResponse } from "next/server"

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "AIzaSyDktvKtaV1NR6BdKUVRraYMqjetPHUjoYA"

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
        { error: "No captions found for this video. This video may not have captions available." },
        { status: 404 }
      )
    }

    return NextResponse.json({
      videoId,
      captions,
      transcriptLanguage,
      source: "youtube_api_v3"
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
  language: string = "en"
): Promise<Array<{ start: number; end: number; text: string }>> {
  console.log(`Fetching captions for video ${videoId} with language: ${language}`)
  
  const captionTracks = await getCaptionTracks(videoId)
  
  if (!captionTracks || captionTracks.length === 0) {
    throw new Error("No caption tracks found for this video")
  }
  
  console.log(`Found ${captionTracks.length} caption tracks`)
  
  const track = selectCaptionTrack(captionTracks, language)
  
  if (!track) {
    throw new Error(`No caption track found for language: ${language}`)
  }
  
  console.log(`Using caption track: ${track.snippet.language} (${track.snippet.name})`)
  console.log(`Caption ID: ${track.id}`)
  
  const formats = ['srv1', 'srv2', 'srv3', 'json3', 'ttml']
  let captionContent = ''
  
  for (const fmt of formats) {
    try {
      console.log(`Trying format: ${fmt}`)
      captionContent = await downloadCaptionContent(track.id, videoId, fmt)
      
      if (captionContent && captionContent.length > 0) {
        console.log(`Successfully downloaded caption content with format: ${fmt}`)
        console.log(`Content length: ${captionContent.length}`)
        console.log(`First 500 chars: ${captionContent.substring(0, 500)}`)
        break
      }
    } catch (error) {
      console.log(`Format ${fmt} failed: ${error instanceof Error ? error.message : error}`)
      continue
    }
  }
  
  if (!captionContent || captionContent.length === 0) {
    throw new Error("Caption content is empty after trying all formats")
  }
  
  const captions = parseXMLCaptions(captionContent)
  
  console.log(`Parsed ${captions.length} caption segments`)
  
  return captions
}

async function getCaptionTracks(videoId: string): Promise<any[] | null> {
  const url = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${YOUTUBE_API_KEY}`
  
  const response = await fetch(url)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || "Failed to fetch caption tracks")
  }
  
  const data = await response.json()
  
  return data.items || null
}

function selectCaptionTrack(tracks: any[], language: string): any | null {
  const languageLower = language.toLowerCase()
  
  let track = tracks.find(t => 
    t.snippet.language.toLowerCase() === languageLower && 
    t.snippet.trackKind === 'standard'
  )
  
  if (!track) {
    track = tracks.find(t => 
      t.snippet.language.toLowerCase() === languageLower
    )
  }
  
  if (!track) {
    track = tracks.find(t => 
      t.snippet.language.toLowerCase().startsWith(languageLower.substring(0, 2))
    )
  }
  
  if (!track) {
    track = tracks.find(t => t.snippet.trackKind === 'standard')
  }
  
  if (!track) {
    track = tracks[0]
  }
  
  return track || null
}

async function downloadCaptionContent(captionId: string, videoId: string, fmt: string = 'srv1'): Promise<string> {
  const url = `https://www.youtube.com/api/timedtext?v=${videoId}&id=${captionId}&fmt=${fmt}`
  
  console.log(`Downloading from: ${url}`)
  
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to download caption content: ${response.statusText}`)
  }
  
  const text = await response.text()
  
  if (text.includes('Error 404') || text.includes('Error 400')) {
    throw new Error(`Caption content not found (format: ${fmt})`)
  }
  
  return text
}

function parseXMLCaptions(xml: string): Array<{ start: number; end: number; text: string }> {
  const captions: Array<{ start: number; end: number; text: string }> = []
  
  const textRegex = /<text[^>]*start="([^"]+)"[^>]*dur="([^"]+)"[^>]*>(.*?)<\/text>/g
  let match
  
  while ((match = textRegex.exec(xml)) !== null) {
    const start = parseFloat(match[1])
    const duration = parseFloat(match[2])
    const end = start + duration
    const text = match[3]
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/\n/g, ' ')
      .trim()
    
    if (text) {
      captions.push({ start, end, text })
    }
  }
  
  return captions
}

function parseSRT(srt: string): Array<{ start: number; end: number; text: string }> {
  const blocks = srt.trim().split(/\n\n+/)
  const captions: Array<{ start: number; end: number; text: string }> = []
  
  for (const block of blocks) {
    const lines = block.split('\n')
    if (lines.length < 3) continue
    
    const timeLine = lines[1]
    const match = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/)
    
    if (!match) continue
    
    const start = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]) + parseInt(match[4]) / 1000
    const end = parseInt(match[5]) * 3600 + parseInt(match[6]) * 60 + parseInt(match[7]) + parseInt(match[8]) / 1000
    
    const text = lines.slice(2).join('\n').replace(/<[^>]+>/g, '')
    
    captions.push({ start, end, text })
  }
  
  return captions
}