"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

type ResultPreviewProps = {
  outputs?: {
    x_thread: Array<{ order: number; text: string }>
    x_singles: Array<{ angle: string; text: string }>
    youtube_seo: {
      titles: string[]
      description: string
      chapters: Array<{ timestamp: string; title: string }>
      tags: string[]
    }
  }
}

export function ResultPreviewSection({ outputs }: ResultPreviewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const threadItems = outputs?.x_thread || []
  const singleItems = outputs?.x_singles || []
  const seo = outputs?.youtube_seo
  const hasOutputs = !!(threadItems.length || singleItems.length || seo)

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
            <h2 className="text-3xl md:text-5xl font-bold text-balance">生成结果预览</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {hasOutputs ? "已根据字幕生成结果，可直接复制使用。" : "生成完成后会在这里展示结果示例。"}
            </p>
          </div>

          <Tabs defaultValue="thread" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="thread" className="text-xs sm:text-sm">
                X Thread
              </TabsTrigger>
              <TabsTrigger value="tweets" className="text-xs sm:text-sm">
                X Singles
              </TabsTrigger>
              <TabsTrigger value="seo" className="text-xs sm:text-sm">
                YouTube SEO
              </TabsTrigger>
            </TabsList>

            <TabsContent value="thread" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    X Thread（4-8 条）
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleCopy(
                          threadItems.map((item) => item.text).join("\n\n") || "暂无内容",
                          "thread"
                        )
                      }
                    >
                      {copiedId === "thread" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </CardTitle>
                  <CardDescription>结构化 thread，方便直接发布。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(threadItems.length
                    ? threadItems
                    : [
                        { order: 1, text: "示例：如何把一个长视频拆成高互动线程？" },
                        { order: 2, text: "示例：先用一句强对比的结论做开头。" },
                        { order: 3, text: "示例：再用 2-3 条核心要点承接。" }
                      ]
                  ).map((item, index) => (
                    <div key={`${item.order}-${index}`} className="flex gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {item.order || index + 1}
                      </div>
                      <p className="text-sm leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tweets" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>X Singles（2-3 条）</CardTitle>
                  <CardDescription>不同角度的单条推文。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(singleItems.length
                    ? singleItems.map((item) => item.text)
                    : [
                        "示例：一句话总结视频核心观点。",
                        "示例：给出一个反常识观点。",
                        "示例：列出 3 个要点。"
                      ]
                  ).map((tweet, i) => (
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
                    <CardTitle>标题候选（5 选）</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(seo?.titles?.length
                      ? seo.titles
                      : [
                          "示例：如何把一个视频转成高互动内容？",
                          "示例：从 0 到 1 打造内容资产库",
                          "示例：一条视频带来 10 条内容"
                        ]
                    ).map((title, i) => (
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
                    <CardTitle>描述与章节</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm leading-relaxed bg-muted/50 p-4 rounded-lg">
                      {seo?.description || "示例：用一段简洁描述 + CTA 总结视频重点。"}
                    </p>
                    <div className="space-y-1 text-sm font-mono bg-muted/50 p-4 rounded-lg">
                      {(seo?.chapters?.length
                        ? seo.chapters.map((chapter) => `${chapter.timestamp} - ${chapter.title}`)
                        : ["00:00 - 开场", "01:20 - 核心观点", "03:45 - 方法步骤", "08:10 - 总结"]
                      ).map((chapter, i) => (
                        <div key={i}>{chapter}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>标签</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(seo?.tags?.length
                        ? seo.tags
                        : ["效率", "内容复用", "YouTube", "SEO", "增长", "创作者"]
                      ).map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
