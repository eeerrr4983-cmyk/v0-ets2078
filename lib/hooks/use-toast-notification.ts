"use client"

import { useState, useCallback } from "react"
import type { ToastType } from "@/components/ui/toast-notification"

interface ToastState {
  message: string
  type: ToastType
  id: number
}

export function useToastNotification() {
  const [toasts, setToasts] = useState<ToastState[]>([])

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now()
    setToasts((prev) => [...prev, { message, type, id }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback((message: string) => showToast(message, "success"), [showToast])
  const error = useCallback((message: string) => showToast(message, "error"), [showToast])
  const info = useCallback((message: string) => showToast(message, "info"), [showToast])

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
  }
}
