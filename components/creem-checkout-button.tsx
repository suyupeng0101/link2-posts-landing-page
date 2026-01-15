"use client"

import { useState } from "react"
import type { ComponentProps, ReactNode } from "react"
import { Button } from "@/components/ui/button"

type CreemCheckoutButtonProps = {
  priceId: string
  planId: string
  children: ReactNode
  disabled?: boolean
} & Omit<ComponentProps<typeof Button>, "onClick" | "disabled" | "children">

export function CreemCheckoutButton({
  priceId,
  planId,
  children,
  disabled,
  ...props
}: CreemCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (!priceId) {
      window.alert("该方案尚未配置价格，请稍后再试")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/creem/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId, planId }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || "支付创建失败")
      }

      if (!data?.checkoutUrl) {
        throw new Error("缺少支付地址")
      }

      window.location.href = data.checkoutUrl
    } catch (error) {
      console.error(error)
      window.alert("支付跳转失败，请稍后重试")
      setIsLoading(false)
    }
  }

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? "跳转中..." : children}
    </Button>
  )
}
