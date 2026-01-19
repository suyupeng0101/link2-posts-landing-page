"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Check, Copy, Download } from "lucide-react"

type LedgerItem = {
  id: number
  change_amount: number
  reason: string
  note: string | null
  created_at: string
}

type JobItem = {
  id: number
  item_type: string
  content: unknown
  created_at: string
}

type JobSummary = {
  id: number
  status: string
  credits_spent: number
  created_at: string
  finished_at: string | null
  youtube_url: string | null
  video_id: string | null
  output_language: string | null
}

type JobDetail = {
  job: JobSummary & {
    tone: string | null
    audience: string | null
    thread_count: number | null
    singles_count: number | null
    title_candidates: number | null
    cta: string | null
  }
  items: JobItem[]
}

function formatDate(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleString("zh-CN")
}

function formatReason(reason: string) {
  switch (reason) {
    case "payment":
      return "充值"
    case "generation":
      return "生成"
    case "signup":
      return "注册赠送"
    case "invite":
      return "邀请"
    case "admin":
      return "后台调整"
    case "refund":
      return "退款"
    default:
      return reason
  }
}

function formatJobStatus(status: string) {
  switch (status) {
    case "queued":
      return "排队中"
    case "running":
      return "生成中"
    case "succeeded":
      return "已完成"
    case "failed":
      return "失败"
    default:
      return status
  }
}

export default function ProfileClient() {
  const [balance, setBalance] = useState<number | null>(null)
  const [ledger, setLedger] = useState<LedgerItem[]>([])
  const [jobs, setJobs] = useState<JobSummary[]>([])
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [balanceRes, ledgerRes, jobsRes] = await Promise.all([
        fetch("/api/credits/balance", { cache: "no-store" }),
        fetch("/api/credits/ledger?limit=20", { cache: "no-store" }),
        fetch("/api/generation/jobs?limit=20", { cache: "no-store" }),
      ])

      const balanceData = await balanceRes.json()
      const ledgerData = await ledgerRes.json()
      const jobsData = await jobsRes.json()

      if (!balanceRes.ok) throw new Error(balanceData?.error || "余额获取失败")
      if (!ledgerRes.ok) throw new Error(ledgerData?.error || "流水获取失败")
      if (!jobsRes.ok) throw new Error(jobsData?.error || "生成记录获取失败")

      setBalance(balanceData.balance ?? 0)
      setLedger(Array.isArray(ledgerData.items) ? ledgerData.items : [])
      setJobs(Array.isArray(jobsData.items) ? jobsData.items : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const fetchJobDetail = useCallback(async (jobId: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/generation/jobs/${jobId}`, {
        cache: "no-store",
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || "获取资源包失败")
      }
      setSelectedJob(data as JobDetail)
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取资源包失败")
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCopy = useCallback(async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      setError("复制失败，请手动复制")
    }
  }, [])

  const handleDownload = useCallback((content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }, [])

  const groupedItems = useMemo(() => {
    if (!selectedJob?.items?.length) return {}
    return selectedJob.items.reduce<Record<string, JobItem[]>>((acc, item) => {
      acc[item.item_type] = acc[item.item_type] || []
      acc[item.item_type].push(item)
      return acc
    }, {})
  }, [selectedJob])

  const threadItems = useMemo(() => {
    const items = (groupedItems as Record<string, JobItem[]>)["x_thread"] ?? []
    return items
      .map((item) => item.content as { order?: number; text?: string })
      .filter((item) => item?.text)
  }, [groupedItems])

  const singleItems = useMemo(() => {
    const items = (groupedItems as Record<string, JobItem[]>)["x_single"] ?? []
    return items
      .map((item) => item.content as { angle?: string; text?: string })
      .filter((item) => item?.text)
  }, [groupedItems])

  const seo = useMemo(() => {
    const item = (groupedItems as Record<string, JobItem[]>)["youtube_seo"]?.[0]
    return item?.content as {
      titles?: string[]
      description?: string
      chapters?: Array<{ timestamp: string; title: string }>
      tags?: string[]
    } | null
  }, [groupedItems])

  const threadText = useMemo(
    () => threadItems.map((item) => item.text).join("\n\n"),
    [threadItems]
  )

  const threadMarkdown = useMemo(
    () => threadItems.map((item, index) => `${index + 1}. ${item.text}`).join("\n"),
    [threadItems]
  )

  const singlesText = useMemo(
    () => singleItems.map((item) => item.text).join("\n\n"),
    [singleItems]
  )

  const singlesMarkdown = useMemo(
    () => singleItems.map((item) => `- ${item.text}`).join("\n"),
    [singleItems]
  )

  const seoMarkdown = useMemo(() => {
    if (!seo) return ""
    const titles = seo.titles?.length
      ? seo.titles.map((title) => `- ${title}`).join("\n")
      : ""
    const chapters = seo.chapters?.length
      ? seo.chapters.map((chapter) => `- ${chapter.timestamp} ${chapter.title}`).join("\n")
      : ""
    const tags = seo.tags?.length ? seo.tags.map((tag) => `#${tag}`).join(" ") : ""

    return [
      "## YouTube SEO",
      "",
      "### 标题候选",
      titles || "-",
      "",
      "### 描述",
      seo.description || "-",
      "",
      "### 章节",
      chapters || "-",
      "",
      "### 标签",
      tags || "-",
      "",
    ].join("\n")
  }, [seo])

  const threadJson = useMemo(
    () => JSON.stringify(threadItems, null, 2),
    [threadItems]
  )

  const singlesJson = useMemo(
    () => JSON.stringify(singleItems, null, 2),
    [singleItems]
  )

  const seoJson = useMemo(
    () => JSON.stringify(seo ?? {}, null, 2),
    [seo]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">个人中心</h1>
          <p className="text-sm text-muted-foreground">
            查看积分余额、充值/消费记录与生成历史。
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchAll} disabled={loading}>
            {loading ? "加载中..." : "刷新数据"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/pricing">充值积分</Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-border">
        <CardHeader>
          <CardTitle>当前积分</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-semibold">
          {balance === null ? "点击刷新获取" : `${balance} credits`}
        </CardContent>
      </Card>

      <Tabs defaultValue="ledger">
        <TabsList>
          <TabsTrigger value="ledger">积分流水</TabsTrigger>
          <TabsTrigger value="jobs">生成记录</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="mt-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>充值与消费记录</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {ledger.length === 0 ? (
                <div className="text-muted-foreground">暂无记录</div>
              ) : (
                ledger.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={cn(
                            item.change_amount > 0
                              ? "text-emerald-600"
                              : "text-red-600"
                          )}
                        >
                          {item.change_amount > 0 ? "+" : ""}
                          {item.change_amount}
                        </Badge>
                        <span className="font-medium">
                          {formatReason(item.reason)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.note || "无备注"}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>生成记录</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {jobs.length === 0 ? (
                  <div className="text-muted-foreground">暂无记录</div>
                ) : (
                  jobs.map((job) => (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => fetchJobDetail(job.id)}
                      className={cn(
                        "w-full text-left rounded-lg border border-border/60 p-3 transition hover:border-primary/60",
                        selectedJob?.job?.id === job.id &&
                          "border-primary ring-1 ring-primary/30"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {job.video_id || "YouTube 生成"}
                        </div>
                        <Badge variant="outline">
                          {formatJobStatus(job.status)}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>消耗 {job.credits_spent} credits</span>
                        <span>{formatDate(job.created_at)}</span>
                        {job.output_language && (
                          <span>输出：{job.output_language}</span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>资源包详情</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {!selectedJob ? (
                  <div className="text-muted-foreground">
                    选择一条生成记录查看资源包。
                  </div>
                ) : (
                  <>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>状态：{formatJobStatus(selectedJob.job.status)}</div>
                      <div>生成时间：{formatDate(selectedJob.job.created_at)}</div>
                      {selectedJob.job.youtube_url && (
                        <a
                          href={selectedJob.job.youtube_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          打开原视频链接
                        </a>
                      )}
                    </div>

                    <Tabs defaultValue="thread">
                      <TabsList className="grid w-full grid-cols-3 h-auto">
                        <TabsTrigger value="thread">X Thread</TabsTrigger>
                        <TabsTrigger value="singles">X 单条推文</TabsTrigger>
                        <TabsTrigger value="seo">YouTube SEO</TabsTrigger>
                      </TabsList>

                      <TabsContent value="thread" className="space-y-4 mt-4">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">X Thread</div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleCopy(threadText || "暂无内容", "thread-copy")
                              }
                            >
                              {copiedId === "thread-copy" ? (
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
                                  threadMarkdown || threadText || "暂无内容",
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
                        </div>
                        <div className="space-y-3">
                          {threadItems.length === 0 ? (
                            <div className="text-muted-foreground">暂无内容</div>
                          ) : (
                            threadItems.map((item, index) => (
                              <div
                                key={`${item.order ?? index}-${index}`}
                                className="flex gap-3 p-4 bg-muted/50 rounded-lg border border-border"
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                                  {item.order ?? index + 1}
                                </div>
                                <p className="text-sm leading-relaxed">{item.text}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="singles" className="space-y-4 mt-4">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">X 单条推文</div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleCopy(singlesText || "暂无内容", "singles-copy")
                              }
                            >
                              {copiedId === "singles-copy" ? (
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
                                  singlesMarkdown || singlesText || "暂无内容",
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
                        </div>
                        <div className="space-y-3">
                          {singleItems.length === 0 ? (
                            <div className="text-muted-foreground">暂无内容</div>
                          ) : (
                            singleItems.map((item, index) => (
                              <div
                                key={`${item.text}-${index}`}
                                className="p-4 bg-muted/50 rounded-lg border border-border"
                              >
                                <p className="text-sm leading-relaxed">{item.text}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="seo" className="space-y-4 mt-4">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">YouTube SEO</div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleCopy(seoMarkdown || seoJson || "暂无内容", "seo-copy")
                              }
                            >
                              {copiedId === "seo-copy" ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleDownload(seoMarkdown || "暂无内容", "youtube-seo.md")
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
                        </div>

                        {seo ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="text-xs text-muted-foreground">标题候选</div>
                              <div className="space-y-2">
                                {(seo.titles ?? []).length === 0 ? (
                                  <div className="text-muted-foreground">暂无内容</div>
                                ) : (
                                  seo.titles?.map((title, index) => (
                                    <div
                                      key={`${title}-${index}`}
                                      className="p-3 bg-muted/50 rounded-lg text-sm"
                                    >
                                      {title}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="text-xs text-muted-foreground">描述</div>
                              <p className="text-sm leading-relaxed bg-muted/50 p-4 rounded-lg">
                                {seo.description || "暂无内容"}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <div className="text-xs text-muted-foreground">章节</div>
                              <div className="space-y-1 text-sm font-mono bg-muted/50 p-4 rounded-lg">
                                {(seo.chapters ?? []).length === 0 ? (
                                  <div className="text-muted-foreground">暂无内容</div>
                                ) : (
                                  seo.chapters?.map((chapter, index) => (
                                    <div key={`${chapter.timestamp}-${index}`}>
                                      {chapter.timestamp} - {chapter.title}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="text-xs text-muted-foreground">标签</div>
                              <div className="flex flex-wrap gap-2">
                                {(seo.tags ?? []).length === 0 ? (
                                  <div className="text-muted-foreground">暂无内容</div>
                                ) : (
                                  seo.tags?.map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                                    >
                                      #{tag}
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">暂无内容</div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
