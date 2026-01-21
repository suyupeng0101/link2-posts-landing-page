import { NextResponse } from "next/server"

export const apiErrorCodes = [
  "unauthorized",
  "invalid_input",
  "invalid_youtube_url",
  "credits_insufficient",
  "credits_check_failed",
  "credits_update_failed",
  "credits_record_failed",
  "credits_balance_failed",
  "credits_ledger_failed",
  "captions_fetch_failed",
  "captions_not_found",
  "transcript_missing_key",
  "transcript_quota",
  "transcript_failed",
  "job_create_failed",
  "job_fetch_failed",
  "job_items_fetch_failed",
  "job_invalid_id",
  "job_not_found",
  "job_outputs_failed",
  "generation_failed",
  "paypal_invalid_plan",
  "paypal_missing_order",
  "paypal_unauthorized",
  "paypal_create_failed",
  "paypal_capture_failed",
  "paypal_amount_mismatch",
  "paypal_record_failed",
  "paypal_balance_read_failed",
  "paypal_balance_update_failed",
  "paypal_ledger_failed",
  "unknown_error",
] as const

export type ApiErrorCode = (typeof apiErrorCodes)[number]

export class ApiError extends Error {
  code: ApiErrorCode
  status: number
  logMessage?: string

  constructor(
    code: ApiErrorCode,
    status: number,
    message?: string,
    logMessage?: string
  ) {
    super(message || code)
    this.code = code
    this.status = status
    this.logMessage = logMessage
  }
}

export function isApiErrorCode(value: string): value is ApiErrorCode {
  return (apiErrorCodes as readonly string[]).includes(value)
}

export function parseApiErrorCode(payload: unknown): ApiErrorCode | null {
  if (!payload || typeof payload !== "object") return null
  const record = payload as Record<string, unknown>
  const code = record.code
  if (typeof code === "string" && isApiErrorCode(code)) return code
  return null
}

export function apiErrorResponse(
  error: unknown,
  fallbackCode: ApiErrorCode = "unknown_error",
  fallbackStatus = 500
) {
  const apiError =
    error instanceof ApiError
      ? error
      : new ApiError(fallbackCode, fallbackStatus)

  return NextResponse.json(
    { error: { code: apiError.code } },
    { status: apiError.status }
  )
}
