export const supportedLocales = ["en", "zh-Hans"] as const

export type Locale = (typeof supportedLocales)[number]

export const defaultLocale: Locale = "en"

export const localeLabels: Record<Locale, string> = {
  en: "English",
  "zh-Hans": "简体中文",
}

export function isSupportedLocale(value: string): value is Locale {
  return (supportedLocales as readonly string[]).includes(value)
}

export function formatMessage(
  template: string,
  params?: Record<string, string | number>
) {
  if (!params) return template
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    template
  )
}
