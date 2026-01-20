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
import { useI18n } from "@/components/i18n-provider"

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

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleString(locale)
}

function formatReason(reason: string, locale: string) {
  const zh = locale.startsWith("zh")
  switch (reason) {
    case "payment":
      return zh ? "充值" : "Top up"
    case "generation":
      return zh ? "生成" : "Generation"
    case "signup":
      return zh ? "注册赠送" : "Signup bonus"
    case "invite":
      return zh ? "邀请" : "Invite bonus"
    case "admin":
      return zh ? "后台调整" : "Admin adjustment"
    case "refund":
      return zh ? "退款" : "Refund"
    default:
      return reason
  }
}

function formatJobStatus(status: string, locale: string) {
  const zh = locale.startsWith("zh")
  switch (status) {
    case "queued":
      return zh ? "排队中" : "Queued"
    case "running":
      return zh ? "生成中" : "Running"
    case "succeeded":
      return zh ? "已完成" : "Completed"
    case "failed":
      return zh ? "失败" : "Failed"
    default:
      return status
  }
}

function formatOutputLanguage(value: string | null | undefined, locale: string) {
  if (!value) return "-"
  if (value.toLowerCase().startsWith("zh")) return locale.startsWith("zh") ? "简体中文" : "Chinese"
  return "English"
}

export default function ProfileClient() {
  const { locale } = useI18n()
  const copy = useMemo(
    () =>
      locale === "zh-Hans"
        ? {
          title: "个人中心",
          subtitle: "查看积分余额、充值消费记录与生成历史。",
          refresh: "刷新数据",
          refreshing: "加载中...",
          topUp: "充值积分",
          currentCredits: "当前积分",
          fetchBalance: "点击刷新获取",
          tabsLedger: "积分流水",
          tabsJobs: "生成记录",
          ledgerTitle: "充值与消费记录",
          emptyRecords: "暂无记录",
          noNote: "无备注",
          jobsTitle: "生成记录",
          jobFallback: "YouTube 生成",
          creditsSpent: "消耗",
          outputLanguage: "输出",
          detailTitle: "资源包详情",
          selectJob: "选择一条生成记录查看资源包。",
          status: "状态",
          createdAt: "生成时间",
          openSource: "打开原视频链接",
          tabThread: "X Thread",
          tabSingles: "X 单条推文",
          tabSeo: "YouTube SEO",
          emptyContent: "暂无内容",
          seoTitles: "标题候选",
          seoDescription: "描述",
          seoChapters: "章节",
          seoTags: "标签",
          errorBalance: "余额获取失败",
          errorLedger: "流水获取失败",
          errorJobs: "生成记录获取失败",
          errorLoad: "加载失败",
          errorAssets: "获取资源包失败",
          errorCopy: "复制失败，请手动复制",
          creditsUnit: "积分",
        }
        : {
          title: "Profile",
          subtitle: "View credit balance, top-ups, and generation history.",
          refresh: "Refresh",
          refreshing: "Loading...",
          topUp: "Top up credits",
          currentCredits: "Current credits",
          fetchBalance: "Click refresh to fetch",
          tabsLedger: "Credit ledger",
          tabsJobs: "Generation history",
          ledgerTitle: "Top-ups and usage",
          emptyRecords: "No records",
          noNote: "No notes",
          jobsTitle: "Generation history",
          jobFallback: "YouTube generation",
          creditsSpent: "Spent",
          outputLanguage: "Output",
          detailTitle: "Asset details",
          selectJob: "Select a generation to view assets.",
          status: "Status",
          createdAt: "Created at",
          openSource: "Open source video",
          tabThread: "X Thread",
          tabSingles: "X Singles",
          tabSeo: "YouTube SEO",
          emptyContent: "No content yet",
          seoTitles: "Title candidates",
          seoDescription: "Description",
          seoChapters: "Chapters",
          seoTags: "Tags",
          errorBalance: "Failed to fetch balance",
          errorLedger: "Failed to fetch ledger",
          errorJobs: "Failed to fetch jobs",
          errorLoad: "Failed to load",
          errorAssets: "Failed to fetch assets",
          errorCopy: "Copy failed, please copy manually",
          creditsUnit: "credits",
        },
    [locale]
  )

  const [balance, setBalance] = useState<number | null>(null)
  const [ledger, setLedger] = useState<LedgerItem[]>([])
  const [jobs, setJobs] = useState<JobSummary[]>([])
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const localeString = locale === "zh-Hans" ? "zh-CN" : "en-US"

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

      if (!balanceRes.ok) throw new Error(balanceData?.error || copy.errorBalance)
      if (!ledgerRes.ok) throw new Error(ledgerData?.error || copy.errorLedger)
      if (!jobsRes.ok) throw new Error(jobsData?.error || copy.errorJobs)

      setBalance(balanceData.balance ?? 0)
      setLedger(Array.isArray(ledgerData.items) ? ledgerData.items : [])
      setJobs(Array.isArray(jobsData.items) ? jobsData.items : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.errorLoad)
    } finally {
      setLoading(false)
    }
  }, [copy.errorBalance, copy.errorJobs, copy.errorLedger, copy.errorLoad])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const fetchJobDetail = useCallback(
    async (jobId: number) => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/generation/jobs/${jobId}`, {
          cache: "no-store",
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.error || copy.errorAssets)
        }
        setSelectedJob(data as JobDetail)
      } catch (err) {
        setError(err instanceof Error ? err.message : copy.errorAssets)
      } finally {
        setLoading(false)
      }
    },
    [copy.errorAssets]
  )

  const handleCopy = useCallback(
    async (content: string, id: string) => {
      try {
        await navigator.clipboard.writeText(content)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
      } catch {
        setError(copy.errorCopy)
      }
    },
    [copy.errorCopy]
  )

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

    const seoHeadings =
      locale === "zh-Hans"
        ? ["## YouTube SEO", "### 标题候选", "### 描述", "### 章节", "### 标签"]
        : ["## YouTube SEO", "### Title candidates", "### Description", "### Chapters", "### Tags"]

    return [
      seoHeadings[0],
      "",
      seoHeadings[1],
      titles || "-",
      "",
      seoHeadings[2],
      seo.description || "-",
      "",
      seoHeadings[3],
      chapters || "-",
      "",
      seoHeadings[4],
      tags || "-",
      "",
    ].join("\n")
  }, [locale, seo])

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
          <h1 className="text-2xl font-semibold">{copy.title}</h1>
          <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchAll} disabled={loading}>
            {loading ? copy.refreshing : copy.refresh}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/pricing">{copy.topUp}</Link>
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
          <CardTitle>{copy.currentCredits}</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-semibold">
          {balance === null ? copy.fetchBalance : `${balance} ${copy.creditsUnit}`}
        </CardContent>
      </Card>

      <Tabs defaultValue="ledger">
        <TabsList>
          <TabsTrigger value="ledger">{copy.tabsLedger}</TabsTrigger>
          <TabsTrigger value="jobs">{copy.tabsJobs}</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="mt-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>{copy.ledgerTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {ledger.length === 0 ? (
                <div className="text-muted-foreground">{copy.emptyRecords}</div>
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
                          {formatReason(item.reason, localeString)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.note || copy.noNote}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(item.created_at, localeString)}
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
                <CardTitle>{copy.jobsTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {jobs.length === 0 ? (
                  <div className="text-muted-foreground">{copy.emptyRecords}</div>
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
                          {job.video_id || copy.jobFallback}
                        </div>
                        <Badge variant="outline">
                          {formatJobStatus(job.status, localeString)}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>
                          {copy.creditsSpent} {job.credits_spent} {copy.creditsUnit}
                        </span>
                        <span>{formatDate(job.created_at, localeString)}</span>
                        {job.output_language && (
                          <span>
                            {copy.outputLanguage}：{formatOutputLanguage(job.output_language, localeString)}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>{copy.detailTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {!selectedJob ? (
                  <div className="text-muted-foreground">{copy.selectJob}</div>
                ) : (
                  <>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>
                        {copy.status}：{formatJobStatus(selectedJob.job.status, localeString)}
                      </div>
                      <div>
                        {copy.createdAt}：{formatDate(selectedJob.job.created_at, localeString)}
                      </div>
                      {selectedJob.job.youtube_url && (
                        <a
                          href={selectedJob.job.youtube_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          {copy.openSource}
                        </a>
                      )}
                    </div>

                    <Tabs defaultValue="thread">
                      <TabsList className="grid w-full grid-cols-3 h-auto">
                        <TabsTrigger value="thread">{copy.tabThread}</TabsTrigger>
                        <TabsTrigger value="singles">{copy.tabSingles}</TabsTrigger>
                        <TabsTrigger value="seo">{copy.tabSeo}</TabsTrigger>
                      </TabsList>

                      <TabsContent value="thread" className="space-y-4 mt-4">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{copy.tabThread}</div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleCopy(threadText || copy.emptyContent, "thread-copy")
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
                        </div>
                        <div className="space-y-3">
                          {threadItems.length === 0 ? (
                            <div className="text-muted-foreground">{copy.emptyContent}</div>
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
                          <div className="font-medium">{copy.tabSingles}</div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleCopy(singlesText || copy.emptyContent, "singles-copy")
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
                        </div>
                        <div className="space-y-3">
                          {singleItems.length === 0 ? (
                            <div className="text-muted-foreground">{copy.emptyContent}</div>
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
                          <div className="font-medium">{copy.tabSeo}</div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleCopy(seoMarkdown || seoJson || copy.emptyContent, "seo-copy")
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
                        </div>

                        {seo ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="text-xs text-muted-foreground">{copy.seoTitles}</div>
                              <div className="space-y-2">
                                {(seo.titles ?? []).length === 0 ? (
                                  <div className="text-muted-foreground">{copy.emptyContent}</div>
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
                              <div className="text-xs text-muted-foreground">{copy.seoDescription}</div>
                              <p className="text-sm leading-relaxed bg-muted/50 p-4 rounded-lg">
                                {seo.description || copy.emptyContent}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <div className="text-xs text-muted-foreground">{copy.seoChapters}</div>
                              <div className="space-y-1 text-sm font-mono bg-muted/50 p-4 rounded-lg">
                                {(seo.chapters ?? []).length === 0 ? (
                                  <div className="text-muted-foreground">{copy.emptyContent}</div>
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
                              <div className="text-xs text-muted-foreground">{copy.seoTags}</div>
                              <div className="flex flex-wrap gap-2">
                                {(seo.tags ?? []).length === 0 ? (
                                  <div className="text-muted-foreground">{copy.emptyContent}</div>
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
                          <div className="text-muted-foreground">{copy.emptyContent}</div>
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
