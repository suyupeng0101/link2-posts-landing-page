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
            <h2 className="text-3xl md:text-5xl font-bold text-balance">结果示例</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">一个视频链接可生成的内容资产示例</p>
          </div>

          <Tabs defaultValue="thread" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="thread" className="text-xs sm:text-sm">
                X Thread
              </TabsTrigger>
              <TabsTrigger value="tweets" className="text-xs sm:text-sm">
                单条推文
              </TabsTrigger>
              <TabsTrigger value="seo" className="text-xs sm:text-sm">
                YouTube SEO
              </TabsTrigger>
            </TabsList>

            <TabsContent value="thread" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    X Thread（8-12 条）
                    <Button size="sm" variant="ghost" onClick={() => handleCopy("完整 thread 文本...", "thread")}>
                      {copiedId === "thread" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </CardTitle>
                  <CardDescription>可直接发布的线程内容</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      num: 1,
                      text: "刚试了 30 天，一个简单方法让我的工作流彻底变了。下面是关键结论...",
                    },
                    {
                      num: 2,
                      text: "问题是：我每天花 4+ 小时做重复工作。下面是我把时间压到 30 分钟的方法。",
                    },
                    {
                      num: 3,
                      text: "第 1 步：找瓶颈。我记录了一周的任务，发现 3 个时间黑洞...",
                    },
                    { num: 4, text: "[后续 8-12 条继续展开...]" },
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
                  <CardTitle>单条推文（3-5 条）</CardTitle>
                  <CardDescription>选择你喜欢的角度直接发布</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    "一个小改动，帮我每周省下 20+ 小时，方法很简单。",
                    "大多数人都把任务管理做反了，这才是更顺的系统。",
                    "我用 30 天测试了所有效率工具，最终只留下这 3 个。",
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
                    <CardTitle>标题候选（5 选）</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      "我如何每周省下 20 小时：一套可复用的工作流",
                      "30 天实测：真正有效的效率系统",
                      "只用这 3 个工具，我的工作效率翻倍",
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
                    <CardTitle>描述与章节</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm leading-relaxed bg-muted/50 p-4 rounded-lg">
                      本期分享一套帮我每周省下 20+ 小时的系统，包含 3 个核心工具与可直接套用的流程步骤。
                      最后还整理了行动清单，方便你今天就开始实践。
                    </p>
                    <div className="space-y-1 text-sm font-mono bg-muted/50 p-4 rounded-lg">
                      <div>0:00 - 开场</div>
                      <div>1:23 - 常见误区</div>
                      <div>3:45 - 工具一：任务管理</div>
                      <div>7:12 - 工具二：时间分块</div>
                      <div>11:30 - 工具三：自动化</div>
                      <div>15:20 - 实施步骤</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>标签</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {["效率", "时间管理", "工作流", "AI工具", "生产力", "复盘"].map((tag) => (
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
