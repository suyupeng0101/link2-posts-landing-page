"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LoginDialog } from "@/components/login-dialog"
import { useI18n } from "@/components/i18n-provider"
import { localeLabels } from "@/lib/i18n"
import { Check, Globe } from "lucide-react"

type AuthUser = {
  id: string
  email?: string | null
  user_metadata?: {
    avatar_url?: string
    full_name?: string
  }
}

export function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { locale, setLocale } = useI18n()

  const copy =
    locale === "zh-Hans"
      ? {
          guest: "访客",
          signedIn: "已登录用户",
          navFeatures: "功能",
          navFaq: "常见问题",
          login: "登录",
          profile: "个人资料",
          signOut: "退出登录",
          cta: "立即开始",
        }
      : {
          guest: "Guest",
          signedIn: "Signed-in user",
          navFeatures: "Features",
          navFaq: "FAQ",
          login: "Log in",
          profile: "Profile",
          signOut: "Sign out",
          cta: "Get started",
        }

  useEffect(() => {
    let isMounted = true

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/user", { cache: "no-store" })
        const data = await response.json()
        if (isMounted) {
          setUser(data.user ?? null)
        }
      } catch {
        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [])

  const displayName = useMemo(() => {
    if (!user) return copy.guest
    return user.user_metadata?.full_name || user.email || copy.signedIn
  }, [user, copy])

  const avatarFallback = useMemo(() => {
    if (!user) return "U"
    const source = user.user_metadata?.full_name || user.email || "U"
    return source.slice(0, 1).toUpperCase()
  }, [user])

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    window.location.href = "/"
  }

  const homeAnchor = (hash: string) => (pathname === "/" ? hash : `/${hash}`)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Link2Posts"
            width={48}
            height={48}
            className="h-12 w-12 rounded-md object-contain"
            priority
          />
          <span className="text-xl font-semibold">Link2Posts</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href={homeAnchor("#features")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {copy.navFeatures}
          </Link>
          <Link
            href={homeAnchor("#faq")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {copy.navFaq}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                <span>{localeLabels[locale]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {(["en", "zh-Hans"] as const).map((value) => (
                <DropdownMenuItem key={value} onClick={() => setLocale(value)}>
                  <span className="flex w-full items-center justify-between">
                    {localeLabels[value]}
                    {locale === value ? <Check className="h-4 w-4" /> : null}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {!isLoading && !user ? (
            <LoginDialog
              trigger={
                <Button variant="ghost" size="sm">
                  {copy.login}
                </Button>
              }
            />
          ) : null}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={displayName} />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{displayName}</span>
                    {user.email ? (
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    ) : null}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">{copy.profile}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>{copy.signOut}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          <Link href={homeAnchor("#hero")}>
            <Button size="sm">{copy.cta}</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
