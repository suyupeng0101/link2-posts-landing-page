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
              Back
            </Button>
          </Link>
        </div>

        <Card className="border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Welcome to Link2Posts</CardTitle>
            <CardDescription>Sign in with your email to start generating content</CardDescription>
          </CardHeader>
          <CardContent>
            {magicLinkSent ? (
              <Alert className="bg-primary/10 border-primary">
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Check your email!</p>
                    <p className="text-sm">
                      We've sent a magic link to <strong>{email}</strong>. Click the link to log in securely.
                    </p>
                    <p className="text-xs text-muted-foreground pt-2">
                      Didn't receive it? Check your spam folder or try again.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSendMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email address
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
                      Sending magic link...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send magic link
                    </>
                  )}
                </Button>

                <div className="text-center space-y-2 pt-4">
                  <p className="text-xs text-muted-foreground">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                  </p>
                  <p className="text-xs text-muted-foreground">🔒 Powered by Supabase Auth - No password required</p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 bg-accent/5">
          <CardContent className="p-4">
            <p className="text-sm text-center text-muted-foreground">
              New users get <strong className="text-foreground">20 free credits</strong> to try Link2Posts
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
