"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Link2, Copy, FileText, SlidersHorizontal } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

export function FeaturesSection() {
  const { locale } = useI18n()
  const copy =
    locale === "zh-Hans"
      ? {
          title: "核心能力",
          subtitle: "聚焦阶段 1 的最小可用能力",
          features: [
            {
              icon: Clock,
              title: "基于时间戳的结构化输出",
              description: "章节与内容引用可追溯，减少胡编风险",
            },
            {
              icon: Copy,
              title: "可直接发布",
              description: "Thread 与单条推文格式化输出，一键复制即可发布",
            },
            {
              icon: SlidersHorizontal,
              title: "输出数量可配置",
              description: "Thread 条数、单条推文数量与标题候选可调整",
            },
            {
              icon: Link2,
              title: "仅 YouTube URL",
              description: "阶段 1 只支持 YouTube 链接输入",
            },
            {
              icon: FileText,
              title: "三类资产包输出",
              description: "X Thread、单条推文、YouTube SEO 元数据",
            },
          ],
        }
      : {
          title: "Core capabilities",
          subtitle: "Focused on the minimum viable set for phase 1",
          features: [
            {
              icon: Clock,
              title: "Timestamp-structured output",
              description: "Chapters and references are traceable to reduce hallucinations",
            },
            {
              icon: Copy,
              title: "Ready to publish",
              description: "Formatted X Threads and singles, one-click to copy",
            },
            {
              icon: SlidersHorizontal,
              title: "Configurable output volume",
              description: "Adjust thread length, singles count, and title candidates",
            },
            {
              icon: Link2,
              title: "YouTube URLs only",
              description: "Phase 1 supports YouTube links only",
            },
            {
              icon: FileText,
              title: "Three output bundles",
              description: "X Threads, single posts, and YouTube SEO metadata",
            },
          ],
        }

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">{copy.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {copy.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {copy.features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-2">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
