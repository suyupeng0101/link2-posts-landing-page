/*
 * @Description: 
 * @Version: 1.0
 * @Autor: pawn
 * @Date: 2026-01-15 14:20:39
 * @LastEditors: pawn
 * @LastEditTime: 2026-01-15 15:11:34
 */
"use client"

import type { ReactNode } from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { signInWithGoogle } from "@/app/login/actions"

type LoginDialogProps = {
  trigger: ReactNode
}

export function LoginDialog({ trigger }: LoginDialogProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleOpen = () => setOpen(true)
    window.addEventListener("login-dialog:open", handleOpen)
    return () => window.removeEventListener("login-dialog:open", handleOpen)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md rounded-3xl border border-border/60 bg-white/95 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.6)] backdrop-blur">
        <DialogTitle className="text-lg font-semibold text-foreground">登录</DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          选择一个账号快速开始
        </DialogDescription>
        <div className="space-y-4">
          <form action={signInWithGoogle} className="w-full">
            <Button
              type="submit"
              className="h-12 w-full justify-between gap-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 px-4 text-sm font-semibold text-white shadow-[0_12px_30px_-18px_rgba(67,56,202,0.9)] transition hover:from-indigo-600 hover:via-violet-600 hover:to-blue-600"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                    <path
                      d="M21.805 10.023h-9.18v3.955h5.305c-.23 1.173-.9 2.166-1.92 2.84v2.35h3.11c1.82-1.676 2.885-4.142 2.885-7.145 0-.667-.06-1.316-.2-1.955Z"
                      fill="#4285F4"
                    />
                  <path
                    d="M12.625 21c2.615 0 4.81-.86 6.41-2.332l-3.11-2.35c-.86.58-1.96.92-3.3.92-2.54 0-4.69-1.715-5.46-4.015H3.92v2.42C5.51 18.955 8.83 21 12.625 21Z"
                    fill="#34A853"
                  />
                  <path
                    d="M7.165 13.223a5.39 5.39 0 0 1-.28-1.725c0-.6.1-1.185.28-1.725v-2.42H3.92A9.356 9.356 0 0 0 2.625 11.5c0 1.51.36 2.94.995 4.223l3.545-2.5Z"
                    fill="#FBBC05"
                  />
                    <path
                      d="M12.625 5.76c1.42 0 2.69.49 3.69 1.45l2.76-2.76C17.43 2.94 15.24 2 12.625 2 8.83 2 5.51 4.045 3.92 7.353l3.245 2.42c.77-2.3 2.92-4.013 5.46-4.013Z"
                      fill="#EA4335"
                    />
                  </svg>
                </span>
                Continue with Google
              </span>
              <span className="text-xs font-medium text-white/80">Google</span>
            </Button>
          </form>
          <p className="text-[11px] text-muted-foreground">
            登录即表示你同意服务条款与隐私政策
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
