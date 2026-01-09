import { Card, CardContent } from "@/components/ui/card"
import { Upload, Sparkles, Share2 } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      icon: Upload,
      title: "粘贴 YouTube 链接",
      description: "仅支持 YouTube URL 输入，快速开始生成",
    },
    {
      icon: Sparkles,
      title: "AI 生成内容资产",
      description: "生成 X Thread、单条推文和 YouTube SEO 元数据",
    },
    {
      icon: Share2,
      title: "复制与导出",
      description: "一键复制或导出 JSON/Markdown，直接发布",
    },
  ]

  return (
    <section className="py-20">
      <div className="container">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">如何工作</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              三步把长视频转成可发布内容
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="h-full border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <step.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
