"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, Check, Download } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

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
  const { locale } = useI18n()
  const copy =
    locale === "zh-Hans"
      ? {
          title: "生成结果预览",
          descriptionReady: "已根据字幕生成结果，可直接复制使用。",
          descriptionEmpty: "生成完成后会在这里展示结果示例。",
          tabThread: "X Thread",
          tabSingles: "X Singles",
          tabSeo: "YouTube SEO",
          threadTitle: "X Thread（8 条）",
          threadDescription: "结构化 thread，方便直接发布。",
          singlesTitle: "X Singles（3 条）",
          singlesDescription: "不同角度的单条推文。",
          seoTitleCandidates: "标题候选（5 选）",
          seoDescriptionAndChapters: "描述与章节",
          seoTags: "标签",
          emptyContent: "暂无内容",
          exampleThread: [
            "示例：如何把一个长视频拆成高互动线程？",
            "示例：先用一句强对比的结论做开头。",
            "示例：再给出 2-3 条核心要点承接。",
          ],
          exampleSingles: [
            "示例：一句话总结视频核心观点。",
            "示例：给出一个反常识观点。",
            "示例：列出 3 个要点。",
          ],
          exampleTitles: [
            "示例：如何把一个视频转成高互动内容？",
            "示例：从 0 到 1 打造内容资产库",
            "示例：一条视频带来 10 条内容",
          ],
          exampleDescription: "示例：用一段简洁描述 + CTA 总结视频重点。",
          exampleChapters: ["00:00 - 开场", "01:20 - 核心观点", "03:45 - 方法步骤", "08:10 - 总结"],
          exampleTags: ["效率", "内容复用", "YouTube", "SEO", "增长", "创作者"],
          seoMarkdownTitle: "## YouTube SEO",
          seoMarkdownTitles: "### 标题候选",
          seoMarkdownDescription: "### 描述",
          seoMarkdownChapters: "### 章节",
          seoMarkdownTags: "### 标签",
        }
      : {
          title: "Result preview",
          descriptionReady: "Generated from captions and ready to copy.",
          descriptionEmpty: "Examples will appear here after generation.",
          tabThread: "X Thread",
          tabSingles: "X Singles",
          tabSeo: "YouTube SEO",
          threadTitle: "X Thread (8 items)",
          threadDescription: "Structured thread, ready to publish.",
          singlesTitle: "X Singles (3 items)",
          singlesDescription: "Single posts from different angles.",
          seoTitleCandidates: "Title candidates (5)",
          seoDescriptionAndChapters: "Description & chapters",
          seoTags: "Tags",
          emptyContent: "No content yet",
          exampleThread: [
            "Example: How to break down a long video into a high-engagement thread?",
            "Example: Start with a strong contrast statement.",
            "Example: Then add 2-3 key points to bridge.",
          ],
          exampleSingles: [
            "Example: One sentence to summarize the core idea.",
            "Example: Share a counterintuitive point.",
            "Example: List 3 key takeaways.",
          ],
          exampleTitles: [
            "Example: Turn a video into high-engagement content",
            "Example: Build a content asset library from 0 to 1",
            "Example: One video yields 10 pieces of content",
          ],
          exampleDescription: "Example: A concise description + CTA summarizing the video.",
          exampleChapters: [
            "00:00 - Intro",
            "01:20 - Key insight",
            "03:45 - Method steps",
            "08:10 - Summary",
          ],
          exampleTags: ["Efficiency", "Repurposing", "YouTube", "SEO", "Growth", "Creators"],
          seoMarkdownTitle: "## YouTube SEO",
          seoMarkdownTitles: "### Title candidates",
          seoMarkdownDescription: "### Description",
          seoMarkdownChapters: "### Chapters",
          seoMarkdownTags: "### Tags",
        }

  const threadItems = outputs?.x_thread || []
  const singleItems = outputs?.x_singles || []
  const seo = outputs?.youtube_seo
  const hasOutputs = !!(threadItems.length || singleItems.length || seo)

  const threadText = threadItems.map((item) => item.text).join("\n\n")
  const threadMarkdown = threadItems
    .map((item, index) => `${index + 1}. ${item.text}`)
    .join("\n")
  const threadJson = JSON.stringify(threadItems, null, 2)

  const singlesText = singleItems.map((item) => item.text).join("\n\n")
  const singlesMarkdown = singleItems.map((item) => `- ${item.text}`).join("\n")
  const singlesJson = JSON.stringify(singleItems, null, 2)

  const seoMarkdown = seo
    ? [
        copy.seoMarkdownTitle,
        "",
        copy.seoMarkdownTitles,
        seo.titles?.length ? seo.titles.map((title) => `- ${title}`).join("\n") : "-",
        "",
        copy.seoMarkdownDescription,
        seo.description || "-",
        "",
        copy.seoMarkdownChapters,
        seo.chapters?.length
          ? seo.chapters
              .map((chapter) => `- ${chapter.timestamp} ${chapter.title}`)
              .join("\n")
          : "-",
        "",
        copy.seoMarkdownTags,
        seo.tags?.length ? seo.tags.map((tag) => `#${tag}`).join(" ") : "-",
        "",
      ].join("\n")
    : ""
  const seoJson = JSON.stringify(seo ?? {}, null, 2)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <section id="result-preview" className="py-20 bg-muted/30">
      <div className="container">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-balance">{copy.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {hasOutputs ? copy.descriptionReady : copy.descriptionEmpty}
            </p>
          </div>

          <Tabs defaultValue="thread" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="thread" className="text-xs sm:text-sm">
                {copy.tabThread}
              </TabsTrigger>
              <TabsTrigger value="tweets" className="text-xs sm:text-sm">
                {copy.tabSingles}
              </TabsTrigger>
              <TabsTrigger value="seo" className="text-xs sm:text-sm">
                {copy.tabSeo}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="thread" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {copy.threadTitle}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(threadText || copy.emptyContent, "thread")}
                      >
                        {copiedId === "thread" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleDownload(
                            threadMarkdown || threadText || copy.emptyContent,
                            "x-thread.md"
                          )
                        }
                      >
                        <Download className="h-4 w-4 mr-1" />
                        MD
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownload(threadJson, "x-thread.json")}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        JSON
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>{copy.threadDescription}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(threadItems.length
                    ? threadItems
                    : copy.exampleThread.map((text, index) => ({
                        order: index + 1,
                        text,
                      }))
                  ).map((item, index) => (
                    <div
                      key={`${item.order}-${index}`}
                      className="flex gap-3 p-4 bg-muted/50 rounded-lg border border-border"
                    >
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
                  <CardTitle className="flex items-center justify-between">
                    {copy.singlesTitle}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(singlesText || copy.emptyContent, "singles")}
                      >
                        {copiedId === "singles" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleDownload(
                            singlesMarkdown || singlesText || copy.emptyContent,
                            "x-singles.md"
                          )
                        }
                      >
                        <Download className="h-4 w-4 mr-1" />
                        MD
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownload(singlesJson, "x-singles.json")}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        JSON
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>{copy.singlesDescription}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(singleItems.length ? singleItems.map((item) => item.text) : copy.exampleSingles).map(
                    (tweet, i) => (
                      <div key={i} className="p-4 bg-muted/50 rounded-lg border border-border">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-sm leading-relaxed">{tweet}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(tweet, `tweet-${i}`)}
                          >
                            {copiedId === `tweet-${i}` ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 mt-6">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {copy.seoTitleCandidates}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(seoMarkdown || seoJson || copy.emptyContent, "seo")}
                        >
                          {copiedId === "seo" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleDownload(seoMarkdown || copy.emptyContent, "youtube-seo.md")
                          }
                        >
                          <Download className="h-4 w-4 mr-1" />
                          MD
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(seoJson, "youtube-seo.json")}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          JSON
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(seo?.titles?.length ? seo.titles : copy.exampleTitles).map((title, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                        <span>{title}</span>
                        <Button size="sm" variant="ghost" onClick={() => handleCopy(title, `title-${i}`)}>
                          {copiedId === `title-${i}` ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{copy.seoDescriptionAndChapters}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm leading-relaxed bg-muted/50 p-4 rounded-lg">
                      {seo?.description || copy.exampleDescription}
                    </p>
                    <div className="space-y-1 text-sm font-mono bg-muted/50 p-4 rounded-lg">
                      {(seo?.chapters?.length
                        ? seo.chapters.map((chapter) => `${chapter.timestamp} - ${chapter.title}`)
                        : copy.exampleChapters
                      ).map((chapter, i) => (
                        <div key={i}>{chapter}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{copy.seoTags}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(seo?.tags?.length ? seo.tags : copy.exampleTags).map((tag) => (
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
