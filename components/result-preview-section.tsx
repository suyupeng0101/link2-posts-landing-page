"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

export function ResultPreviewSection() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <section id="result-preview" className="py-20 bg-muted/30">
      <div className="container">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-balance">See What You Get</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Here's a sample of the content distribution assets Link2Posts generates from a single video
            </p>
          </div>

          <Tabs defaultValue="thread" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="thread" className="text-xs sm:text-sm">
                X Thread
              </TabsTrigger>
              <TabsTrigger value="tweets" className="text-xs sm:text-sm">
                Single Tweets
              </TabsTrigger>
              <TabsTrigger value="seo" className="text-xs sm:text-sm">
                YouTube SEO
              </TabsTrigger>
              <TabsTrigger value="highlights" className="text-xs sm:text-sm">
                Highlights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="thread" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    X Thread (8-12 posts)
                    <Button size="sm" variant="ghost" onClick={() => handleCopy("Full thread text...", "thread")}>
                      {copiedId === "thread" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </CardTitle>
                  <CardDescription>Engaging thread ready to post on X</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      num: 1,
                      text: "🚀 Just discovered an amazing productivity hack that changed my workflow completely. Here's what I learned after 30 days...",
                    },
                    {
                      num: 2,
                      text: "The problem: I was spending 4+ hours daily on repetitive tasks. Sound familiar? Here's how I cut that down to 30 minutes.",
                    },
                    {
                      num: 3,
                      text: "Step 1: Identify your bottlenecks. I tracked every task for a week and found 3 major time-wasters...",
                    },
                    { num: 4, text: "[8 more tweets continue the story...]" },
                  ].map((tweet) => (
                    <div key={tweet.num} className="flex gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {tweet.num}
                      </div>
                      <p className="text-sm leading-relaxed">{tweet.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tweets" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Standalone Tweets (3-5 options)</CardTitle>
                  <CardDescription>Pick your favorite or post them all throughout the week</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    "💡 The one productivity tip that saved me 20+ hours per week (and it's not what you think)",
                    "Most people are doing task management wrong. Here's the system that actually works 👇",
                    "Spent 30 days testing every productivity app. Here are the only 3 worth using...",
                  ].map((tweet, i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm leading-relaxed">{tweet}</p>
                        <Button size="sm" variant="ghost" onClick={() => handleCopy(tweet, `tweet-${i}`)}>
                          {copiedId === `tweet-${i}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 mt-6">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Title Options (5 variations)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      "How I Cut 20 Hours of Work Per Week Using This Simple System",
                      "Productivity Hacks That Actually Work (Tested for 30 Days)",
                      "The Only 3 Tools You Need for Maximum Productivity in 2024",
                    ].map((title, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                        <span>{title}</span>
                        <Button size="sm" variant="ghost" onClick={() => handleCopy(title, `title-${i}`)}>
                          {copiedId === `title-${i}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Description & Timestamps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm leading-relaxed bg-muted/50 p-4 rounded-lg">
                      In this video, I share the exact productivity system that helped me reclaim 20+ hours per week.
                      After testing dozens of methods, I've distilled everything down to 3 core tools and a simple
                      workflow anyone can implement...
                    </p>
                    <div className="space-y-1 text-sm font-mono bg-muted/50 p-4 rounded-lg">
                      <div>0:00 - Introduction</div>
                      <div>1:23 - The Problem with Most Systems</div>
                      <div>3:45 - Tool #1: Task Management</div>
                      <div>7:12 - Tool #2: Time Blocking</div>
                      <div>11:30 - Tool #3: Automation</div>
                      <div>15:20 - Putting It All Together</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "productivity",
                        "time management",
                        "productivity tips",
                        "work from home",
                        "productivity tools",
                        "efficiency hacks",
                      ].map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="highlights" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Highlight Clip Suggestions (6 clips)</CardTitle>
                  <CardDescription>Best moments to create short-form content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      time: "3:45 - 4:15",
                      hook: '"This one tool completely transformed how I work"',
                      reason: "Strong emotional hook, demonstrates clear value proposition",
                    },
                    {
                      time: "7:12 - 7:58",
                      hook: '"Most people waste 3 hours daily on this mistake"',
                      reason: "Addresses common pain point, creates curiosity",
                    },
                    {
                      time: "11:30 - 12:10",
                      hook: '"Here\'s the automation that runs my entire business"',
                      reason: "Showcases impressive result, specific and tangible",
                    },
                    {
                      time: "15:20 - 16:05",
                      hook: '"Try this 5-minute exercise tonight"',
                      reason: "Low barrier to entry, actionable call-to-action",
                    },
                  ].map((clip, i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-medium text-primary">{clip.time}</span>
                        <Button size="sm" variant="outline">
                          Create Clip
                        </Button>
                      </div>
                      <p className="text-sm font-medium">{clip.hook}</p>
                      <p className="text-xs text-muted-foreground">{clip.reason}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
