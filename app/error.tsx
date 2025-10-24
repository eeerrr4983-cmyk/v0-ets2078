"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { AlertTriangle } from "lucide-react"
import { ErrorLogger } from "@/lib/error-logger"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error tracking service
    ErrorLogger.log(error, {
      component: "GlobalErrorBoundary",
      action: "page_error",
    })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <GlassCard className="max-w-md w-full p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">문제가 발생했습니다</h2>
          <p className="text-sm text-gray-600">일시적인 오류가 발생했습니다. 다시 시도해주세요.</p>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={reset}
            className="w-full rounded-full bg-black hover:bg-gray-800 text-white h-11 font-medium"
          >
            다시 시도
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="w-full rounded-full border-2 border-gray-200 hover:bg-gray-50 h-11 font-medium"
          >
            홈으로 돌아가기
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="text-left mt-4">
            <summary className="text-xs text-gray-500 cursor-pointer">개발자 정보</summary>
            <pre className="mt-2 text-xs text-gray-600 overflow-auto p-2 bg-gray-100 rounded">{error.message}</pre>
          </details>
        )}
      </GlassCard>
    </div>
  )
}
