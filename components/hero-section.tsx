"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, LinkIcon, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function HeroSection() {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [xUrl, setXUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
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
              Turn YouTube Videos into <span className="text-primary">Social Content</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Generate ready-to-publish X threads, tweets, YouTube SEO metadata, and highlight clips from any video or
              live replay in minutes.
            </p>
          </div>

          {/* Input Section */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg space-y-6 max-w-2xl mx-auto">
            <div className="space-y-4">
              {/* YouTube URL Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  YouTube URL
                </label>
                <Input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="h-12"
                />
              </div>

              {/* X Video URL Input (Beta) */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />X Video Link{" "}
                  <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded">Beta</span>
                </label>
                <Input
                  type="url"
                  placeholder="https://x.com/username/status/..."
                  value={xUrl}
                  onChange={(e) => setXUrl(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Upload Button */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload File</label>
                <Button
                  variant="outline"
                  className="w-full h-20 border-dashed hover:border-primary hover:bg-primary/5 bg-transparent"
                  disabled={isUploading}
                  onClick={() => setIsUploading(true)}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Click to upload MP4, MOV, or MP3
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">Max file size: 500MB</p>
              </div>
            </div>

            {/* Login Prompt */}
            {showLoginPrompt && (
              <Alert className="bg-accent/10 border-accent">
                <AlertDescription className="flex items-center justify-between">
                  <span className="text-sm">Please log in to start generating content</span>
                  <Button size="sm" asChild>
                    <a href="/login">Log in</a>
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
                disabled={!youtubeUrl && !xUrl && !isUploading}
              >
                Start Generating
              </Button>
              <Button size="lg" variant="outline" className="flex-1 h-12 text-base bg-transparent" asChild>
                <a href="#result-preview">View Sample Output</a>
              </Button>
            </div>
          </div>

          {/* Trust Indicators */}
          <p className="text-sm text-muted-foreground">
            ✓ No credit card required for free tier • ✓ 2 minutes average processing time
          </p>
        </div>
      </div>
    </section>
  )
}
