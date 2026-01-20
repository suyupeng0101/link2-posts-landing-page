/*
 * @Description: 
 * @Version: 1.0
 * @Autor: pawn
 * @Date: 2026-01-13 15:57:25
 * @LastEditors: pawn
 * @LastEditTime: 2026-01-20 21:53:09
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Link2, Copy, Share2, FileText, SlidersHorizontal } from "lucide-react"

export function FeaturesSection() {
  const features = [
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
  ]

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">核心能力</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              聚焦阶段 1 的最小可用能力
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
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
