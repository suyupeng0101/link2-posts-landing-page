"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Radio, Mic, User } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

export function UseCasesSection() {
  const { locale } = useI18n()
  const copy =
    locale === "zh-Hans"
      ? {
          title: "适合人群",
          subtitle: "面向 YouTuber、播客与直播回放创作者",
          useCases: [
            {
              icon: GraduationCap,
              title: "教程类 YouTuber",
              description: "把教程视频转成线程与 SEO 描述，提升可发现性",
              examples: ["拆解关键要点为推文", "自动生成章节时间戳", "生成宣传预告内容"],
            },
            {
              icon: Radio,
              title: "直播回放型创作者",
              description: "把回放内容转换为可复制发布的文字资产",
              examples: ["提炼关键观点", "生成 Thread 结构", "为下次直播做预热"],
            },
            {
              icon: Mic,
              title: "访谈/播客频道",
              description: "从长对话中提炼金句与内容摘要",
              examples: ["提取嘉宾观点", "生成节目摘要", "整理可发布要点"],
            },
            {
              icon: User,
              title: "X 平台创作者",
              description: "把视频内容转成线程与单条推文，提升互动",
              examples: ["分发到多个平台", "建立专业认知", "引流回 YouTube"],
            },
          ],
        }
      : {
          title: "Who it's for",
          subtitle: "Built for YouTubers, podcasters, and livestream replays",
          useCases: [
            {
              icon: GraduationCap,
              title: "Tutorial YouTubers",
              description: "Turn tutorials into threads and SEO descriptions for discoverability",
              examples: ["Break down key points into posts", "Auto-generate chapter timestamps", "Create teaser content"],
            },
            {
              icon: Radio,
              title: "Livestream replay creators",
              description: "Convert replays into reusable text assets",
              examples: ["Extract key viewpoints", "Generate a thread structure", "Warm up the next stream"],
            },
            {
              icon: Mic,
              title: "Interview & podcast channels",
              description: "Pull highlights and summaries from long conversations",
              examples: ["Capture guest insights", "Generate episode summaries", "Organize publishable bullets"],
            },
            {
              icon: User,
              title: "X creators",
              description: "Turn videos into threads and singles to boost engagement",
              examples: ["Distribute across platforms", "Build authority", "Drive traffic back to YouTube"],
            },
          ],
        }

  return (
    <section className="py-20">
      <div className="container">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">{copy.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {copy.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {copy.useCases.map((useCase, index) => (
              <Card key={index} className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <useCase.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{useCase.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">{useCase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {useCase.examples.map((example, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
