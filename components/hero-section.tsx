"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GlobeIcon, LinkIcon, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CaptionSegment {
  start: number
  end: number
  text: string
}

interface CaptionsResponse {
  videoId?: string
  captions?: CaptionSegment[]
  transcriptLanguage?: string
  source?: string
  error?: string
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function HeroSection() {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [transcriptLanguage, setTranscriptLanguage] = useState("auto")
  const [outputLanguage, setOutputLanguage] = useState("same_as_transcript")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captions, setCaptions] = useState<CaptionSegment[] | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!youtubeUrl) return

    setIsLoading(true)
    setError(null)
    setCaptions(null)

    try {
      const response = await fetch("/api/youtube/captions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          youtubeUrl,
          transcriptLanguage
        })
      })

      const data: CaptionsResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch captions")
      }

      if (data.captions && data.videoId) {
        setCaptions(data.captions)
        setVideoId(data.videoId)
      }

      const jobResponse = await fetch("/api/jobs/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          youtubeUrl,
          transcriptLanguage,
          outputLanguage
        })
      })

      const jobData = await jobResponse.json()

      if (!jobResponse.ok) {
        throw new Error(jobData.error || "Failed to create job")
      }

      console.log("Job created:", jobData.jobId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="hero" className="relative py-20 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <div className="container relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Text */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
              一键把 YouTube 视频变成 <span className="text-primary">可发布内容资产</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              只需一个链接，生成 X Thread、单条推文和 YouTube SEO 元数据，直接复制发布。
            </p>
          </div>

          {/* Input Section */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg space-y-6 max-w-2xl mx-auto">
            <div className="space-y-4">
              {/* YouTube URL Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  YouTube 链接
                </label>
                <Input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <GlobeIcon className="h-4 w-4" />
                  语言设置
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      字幕语言
                    </label>
                    <Select
                      value={transcriptLanguage}
                      onValueChange={setTranscriptLanguage}
                    >
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="选择字幕语言" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">自动识别</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="zh-Hans">简体中文</SelectItem>
                        <SelectItem value="es">Espanol</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      输出语言
                    </label>
                    <Select
                      value={outputLanguage}
                      onValueChange={setOutputLanguage}
                    >
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="选择输出语言" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="same_as_transcript">
                          与字幕一致
                        </SelectItem>
                        <SelectItem value="en">English (Beta)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  输出语言默认为与字幕一致，英文输出为 Beta 功能。
                </p>
              </div>

            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Captions Preview */}
            {captions && captions.length > 0 && (
              <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">
                    字幕已提取 ({captions.length} 段)
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Video ID: {videoId}
                  </span>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {captions.slice(0, 5).map((caption, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground">
                      <span className="font-mono text-primary">
                        {formatTime(caption.start)}
                      </span>
                      {" "}{caption.text}
                    </div>
                  ))}
                  {captions.length > 5 && (
                    <div className="text-xs text-muted-foreground">
                      ... 还有 {captions.length - 5} 段字幕
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Login Prompt */}
            {showLoginPrompt && (
              <Alert className="bg-accent/10 border-accent">
                <AlertDescription className="flex items-center justify-between">
                  <span className="text-sm">请先登录再开始生成</span>
                  <Button size="sm" asChild>
                    <a href="/login">去登录</a>
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="flex-1 h-12 text-base"
                onClick={handleGenerate}
                disabled={!youtubeUrl || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  "开始生成"
                )}
              </Button>
              <Button size="lg" variant="outline" className="flex-1 h-12 text-base bg-transparent" asChild>
                <a href="#result-preview">查看示例</a>
              </Button>
            </div>
          </div>

          {/* Trust Indicators */}
          <p className="text-sm text-muted-foreground">
            无需绑卡；多数视频处理时间在 2 分钟内
          </p>
        </div>
      </div>
    </section>
  )
}
