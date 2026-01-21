import type { Locale } from "@/lib/i18n"
import { isApiErrorCode, type ApiErrorCode } from "@/lib/api-error"

const messages: Record<Locale, Record<ApiErrorCode, string>> = {
  en: {
    unauthorized: "Please sign in to continue.",
    invalid_input: "Please check your input and try again.",
    invalid_youtube_url: "Invalid YouTube URL.",
    credits_insufficient: "Insufficient credits. Please top up first.",
    credits_check_failed: "Failed to check credits. Please try again.",
    credits_update_failed: "Failed to update credits. Please try again.",
    credits_record_failed: "Failed to record credits. Please try again.",
    credits_balance_failed: "Failed to fetch balance. Please try again.",
    credits_ledger_failed: "Failed to fetch ledger. Please try again.",
    captions_fetch_failed: "Failed to fetch captions. Please try again.",
    captions_not_found: "No captions found for this video.",
    transcript_missing_key: "Transcript service is not configured.",
    transcript_quota: "Transcript quota exceeded. Please try later.",
    transcript_failed: "Transcript request failed. Please try again.",
    job_create_failed: "Failed to create job. Please try again.",
    job_fetch_failed: "Failed to fetch job. Please try again.",
    job_items_fetch_failed: "Failed to fetch job items. Please try again.",
    job_invalid_id: "Invalid job id.",
    job_not_found: "Job not found.",
    job_outputs_failed: "Failed to save outputs. Please try again.",
    generation_failed: "Generation failed. Please try again.",
    paypal_invalid_plan: "Invalid plan.",
    paypal_missing_order: "Missing order id.",
    paypal_unauthorized: "Please sign in to complete payment.",
    paypal_create_failed: "Failed to create PayPal order.",
    paypal_capture_failed: "Failed to capture PayPal payment.",
    paypal_amount_mismatch: "Payment amount mismatch.",
    paypal_record_failed: "Failed to record payment.",
    paypal_balance_read_failed: "Failed to read balance.",
    paypal_balance_update_failed: "Failed to update balance.",
    paypal_ledger_failed: "Failed to record ledger.",
    unknown_error: "Something went wrong. Please try again.",
  },
  "zh-Hans": {
    unauthorized: "请先登录再继续。",
    invalid_input: "请检查输入后重试。",
    invalid_youtube_url: "YouTube 链接无效。",
    credits_insufficient: "积分不足，请先充值。",
    credits_check_failed: "检查积分失败，请稍后重试。",
    credits_update_failed: "更新积分失败，请稍后重试。",
    credits_record_failed: "记录积分失败，请稍后重试。",
    credits_balance_failed: "获取余额失败，请稍后重试。",
    credits_ledger_failed: "获取流水失败，请稍后重试。",
    captions_fetch_failed: "获取字幕失败，请稍后重试。",
    captions_not_found: "该视频未找到字幕。",
    transcript_missing_key: "转录服务未配置。",
    transcript_quota: "转录配额已用尽，请稍后再试。",
    transcript_failed: "转录请求失败，请稍后重试。",
    job_create_failed: "创建任务失败，请稍后重试。",
    job_fetch_failed: "获取任务失败，请稍后重试。",
    job_items_fetch_failed: "获取任务内容失败，请稍后重试。",
    job_invalid_id: "任务 ID 无效。",
    job_not_found: "未找到对应任务。",
    job_outputs_failed: "保存生成结果失败，请稍后重试。",
    generation_failed: "生成失败，请稍后重试。",
    paypal_invalid_plan: "充值方案无效。",
    paypal_missing_order: "缺少订单号。",
    paypal_unauthorized: "请先登录再完成支付。",
    paypal_create_failed: "创建 PayPal 订单失败。",
    paypal_capture_failed: "PayPal 支付确认失败。",
    paypal_amount_mismatch: "支付金额不匹配。",
    paypal_record_failed: "记录支付失败。",
    paypal_balance_read_failed: "读取余额失败。",
    paypal_balance_update_failed: "更新余额失败。",
    paypal_ledger_failed: "记录流水失败。",
    unknown_error: "发生错误，请稍后重试。",
  },
}

export function getErrorMessage(
  error: unknown,
  locale: Locale,
  fallbackCode: ApiErrorCode = "unknown_error"
) {
  if (typeof error === "string" && error.trim()) return error
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>
    const codeValue = record.code
    if (typeof codeValue === "string" && isApiErrorCode(codeValue)) {
      return messages[locale][codeValue]
    }
  }
  return messages[locale][fallbackCode]
}
