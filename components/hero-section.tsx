"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LinkIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function HeroSection() {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const handleGenerate = () => {
    setShowLoginPrompt(true)
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

            </div>

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
                disabled={!youtubeUrl}
              >
                开始生成
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
