"use client"

import Link from "next/link"
import Image from "next/image"
import { useI18n } from "@/components/i18n-provider"

export function Footer() {
  const { locale } = useI18n()
  const copy =
    locale === "zh-Hans"
      ? {
          product: "产品",
          company: "公司",
          legal: "法律",
          follow: "关注我们",
          features: "功能",
          faq: "常见问题",
          contact: "联系我们",
          terms: "服务条款",
          privacy: "隐私政策",
          rights: "保留所有权利。",
        }
      : {
          product: "Product",
          company: "Company",
          legal: "Legal",
          follow: "Follow",
          features: "Features",
          faq: "FAQ",
          contact: "Contact",
          terms: "Terms of Service",
          privacy: "Privacy Policy",
          rights: "All rights reserved.",
        }

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4">{copy.product}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  {copy.features}
                </Link>
              </li>
              <li>
                <Link href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  {copy.faq}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{copy.company}</h3>
            <ul className="space-y-2 text-sm">
              {/* <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  关于我们
                </Link>
              </li> */}
              <li>
                <a
                  href="mailto:sujinzhe1992@gmail.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copy.contact}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{copy.legal}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  {copy.terms}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  {copy.privacy}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{copy.follow}</h3>
            {/* <div className="flex gap-3">
              <a
                href="https://twitter.com"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-muted-foreground/10 transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://github.com"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-muted-foreground/10 transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-muted-foreground/10 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-muted-foreground/10 transition-colors"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div> */}
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Link2Posts"
              width={40}
              height={40}
              className="h-10 w-10 rounded-md object-contain"
            />
            <span className="font-semibold">Link2Posts</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Link2Posts. {copy.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}
