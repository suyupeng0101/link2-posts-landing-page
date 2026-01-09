"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const handleSendMagicLink = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setMagicLinkSent(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
          </Link>
        </div>

        <Card className="border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">欢迎使用 Link2Posts</CardTitle>
            <CardDescription>使用邮箱 Magic Link 登录后开始生成</CardDescription>
          </CardHeader>
          <CardContent>
            {magicLinkSent ? (
              <Alert className="bg-primary/10 border-primary">
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">请查收邮件</p>
                    <p className="text-sm">
                      我们已向 <strong>{email}</strong> 发送登录链接，请点击完成登录。
                    </p>
                    <p className="text-xs text-muted-foreground pt-2">
                      如果未收到，请检查垃圾邮件或稍后重试。
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSendMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    邮箱地址
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading || !email}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      正在发送登录链接...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      发送登录链接
                    </>
                  )}
                </Button>

                <div className="text-center space-y-2 pt-4">
                  <p className="text-xs text-muted-foreground">
                    继续即表示你同意我们的服务条款与隐私政策
                  </p>
                  <p className="text-xs text-muted-foreground">由 Supabase Auth 提供支持，无需密码</p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 bg-accent/5">
          <CardContent className="p-4">
            <p className="text-sm text-center text-muted-foreground">
              新用户可获得 <strong className="text-foreground">20 次免费额度</strong> 体验
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
