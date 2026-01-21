"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { openLoginDialog } from "@/lib/login-dialog"
import { useI18n } from "@/components/i18n-provider"
import { formatMessage } from "@/lib/i18n"
import { getErrorMessage } from "@/lib/i18n-errors"

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
  error?: { code?: string } | string
}

interface GenerationOutputs {
  x_thread: Array<{ order: number; text: string }>
  x_singles: Array<{ angle: string; text: string }>
  youtube_seo: {
    titles: string[]
    description: string
    chapters: Array<{ timestamp: string; title: string }>
    tags: string[]
  }
}

interface JobResponse {
  jobId?: string
  status?: string
  outputs?: GenerationOutputs
  error?: { code?: string } | string
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function HeroSection({
  onGenerated,
}: {
  onGenerated?: (outputs: GenerationOutputs) => void
}) {
  const router = useRouter()
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [transcriptLanguage] = useState("auto")
  const [outputLanguage, setOutputLanguage] = useState("en")
  const [isLoading, setIsLoading] = useState(false)
  const [isRouting, setIsRouting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captions, setCaptions] = useState<CaptionSegment[] | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [showAllCaptions, setShowAllCaptions] = useState(false)
  const { locale } = useI18n()

  const copy =
    locale === "zh-Hans"
      ? {
          titleLead: "一键把 YouTube 视频变成",
          titleHighlight: "可发布内容资产",
          description:
            "只需一个链接，生成 X Thread、单条推文和 YouTube SEO 元数据，直接复制发布。目前仅支持带字幕的 YouTube 视频链接，且视频时长不超过 30 分钟。后续版本会持续迭代。",
          youtubeLink: "YouTube 链接",
          languageSettings: "语言设置",
          transcriptLanguage: "字幕语言",
          autoDetect: "自动识别",
          outputLanguage: "输出语言",
          outputLanguagePlaceholder: "选择输出语言",
          outputHint: "输出语言默认 English，可切换为简体中文。",
          captionsExtracted: "字幕已提取（{count} 段）",
          videoId: "Video ID: {id}",
          collapseCaptions: "收起字幕",
          expandCaptions: "... 还有 {count} 段字幕，点击查看全部",
          loginPrompt: "请先进行登录",
          generateLoading: "生成中...",
          generateCta: "开始生成",
          viewExample: "查看示例",
          recharge: "充值积分",
          processingHint: "无需绑卡；多数视频处理时间在 2 分钟内。",
        }
      : {
          titleLead: "Turn any YouTube video into",
          titleHighlight: "publishable assets",
          description:
            "Paste a link to generate X Threads, single posts, and YouTube SEO metadata, ready to copy. Currently supports only YouTube videos with captions and up to 30 minutes. We will keep iterating in future releases.",
          youtubeLink: "YouTube link",
          languageSettings: "Language settings",
          transcriptLanguage: "Caption language",
          autoDetect: "Auto detect",
          outputLanguage: "Output language",
          outputLanguagePlaceholder: "Select output language",
          outputHint: "Default output language is English; you can switch to Simplified Chinese.",
          captionsExtracted: "Captions extracted ({count} segments)",
          videoId: "Video ID: {id}",
          collapseCaptions: "Collapse captions",
          expandCaptions: "... {count} more segments, click to view all",
          loginPrompt: "Please sign in first",
          generateLoading: "Generating...",
          generateCta: "Generate",
          viewExample: "View example",
          recharge: "Top up credits",
          processingHint: "No card required; most videos finish within 2 minutes.",
        }

  const ensureAuthenticated = async () => {
    try {
      const authResponse = await fetch("/api/auth/user", { cache: "no-store" })
      const authData = await authResponse.json()

      if (!authResponse.ok || !authData?.user) {
        return false
      }
    } catch {
      return false
    }

    return true
  }

  const handleGenerate = async () => {
    if (!youtubeUrl || isLoading) return

    const authed = await ensureAuthenticated()
    if (!authed) {
      setShowLoginPrompt(true)
      openLoginDialog()
      return
    }

    setShowLoginPrompt(false)

    setIsLoading(true)
    setError(null)
    setCaptions(null)
    setShowAllCaptions(false)

    try {
      const response = await fetch("/api/youtube/captions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          youtubeUrl,
          transcriptLanguage,
        }),
      })

      const data: CaptionsResponse = await response.json()

      if (!response.ok) {
        throw new Error(getErrorMessage(data?.error, locale))
      }

      if (data.captions && data.videoId) {
        setCaptions(data.captions)
        setVideoId(data.videoId)
      }

      const jobResponse = await fetch("/api/jobs/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          youtubeUrl,
          transcriptLanguage,
          outputLanguage,
          captions: data.captions,
          videoId: data.videoId,
        }),
      })

      const jobData: JobResponse = await jobResponse.json()

      if (!jobResponse.ok) {
        throw new Error(getErrorMessage(jobData?.error, locale))
      }

      if (jobData.outputs && onGenerated) {
        onGenerated(jobData.outputs)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRechargeClick = async () => {
    if (isRouting) return
    setIsRouting(true)
    const authed = await ensureAuthenticated()
    if (!authed) {
      setShowLoginPrompt(true)
      openLoginDialog()
      setIsRouting(false)
      return
    }
    setShowLoginPrompt(false)
    router.push("/pricing")
  }

  return (
    <section id="hero" className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <div className="container relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
              {copy.titleLead} <span className="text-primary">{copy.titleHighlight}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              {copy.description}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg space-y-6 max-w-2xl mx-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  {copy.youtubeLink}
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
                  {copy.languageSettings}
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      {copy.transcriptLanguage}
                    </label>
                    <Select value={transcriptLanguage} onValueChange={() => {}} disabled>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder={copy.autoDetect} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">{copy.autoDetect}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      {copy.outputLanguage}
                    </label>
                    <Select value={outputLanguage} onValueChange={setOutputLanguage}>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder={copy.outputLanguagePlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="zh-Hans">简体中文</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {copy.outputHint}
                </p>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {captions && captions.length > 0 && (
              <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">
                    {formatMessage(copy.captionsExtracted, { count: captions.length })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatMessage(copy.videoId, { id: videoId ?? "" })}
                  </span>
                </div>
                <div
                  className={`space-y-2 ${
                    showAllCaptions
                      ? "max-h-72 overflow-y-auto"
                      : "max-h-40 overflow-y-auto"
                  }`}
                >
                  {(showAllCaptions ? captions : captions.slice(0, 6)).map(
                    (caption, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground">
                        <span className="font-mono text-primary">
                          {formatTime(caption.start)}
                        </span>{" "}
                        {caption.text}
                      </div>
                    )
                  )}
                </div>
                {captions.length > 6 && (
                  <button
                    type="button"
                    className="mt-3 w-full text-center text-xs text-primary hover:underline"
                    onClick={() => setShowAllCaptions((prev) => !prev)}
                  >
                    {showAllCaptions
                      ? copy.collapseCaptions
                      : formatMessage(copy.expandCaptions, { count: captions.length - 6 })}
                  </button>
                )}
              </div>
            )}

            {showLoginPrompt && (
              <Alert className="bg-accent/10 border-accent">
                <AlertDescription className="flex items-center justify-between">
                  <span className="text-sm">{copy.loginPrompt}</span>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="flex-1 h-12 text-base bg-sky-600 text-white shadow-sm hover:bg-sky-500 disabled:bg-sky-300 disabled:text-white"
                onClick={handleGenerate}
                disabled={!youtubeUrl || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {copy.generateLoading}
                  </>
                ) : (
                  copy.generateCta
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 h-12 text-base border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900"
                asChild
              >
                <a href="#result-preview">{copy.viewExample}</a>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="flex-1 h-12 text-base bg-emerald-600 text-white hover:bg-emerald-500"
                onClick={handleRechargeClick}
                disabled={isRouting}
              >
                {copy.recharge}
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {copy.processingHint}
          </p>
        </div>
      </div>
    </section>
  )
}
