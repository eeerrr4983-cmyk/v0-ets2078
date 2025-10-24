"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, Copy, CheckCircle2, Sparkles } from "lucide-react"

interface TeacherCommunicationHelperProps {
  error: {
    type: string
    content: string
    reason: string
    page: number
  }
  onClose: () => void
}

export function TeacherCommunicationHelper({ error, onClose }: TeacherCommunicationHelperProps) {
  const [copied, setCopied] = useState(false)

  const generateSuggestion = () => {
    const suggestions = {
      금지: `선생님, ${error.page}페이지 "${error.content}" 부분이 ${error.reason}에 해당하여 수정이 필요합니다. 확인 부탁드립니다.`,
      주의: `선생님, ${error.page}페이지 "${error.content}" 부분을 ${error.reason}로 더 구체적으로 수정 가능할까요?`,
    }

    return suggestions[error.type as keyof typeof suggestions] || suggestions["주의"]
  }

  const suggestion = generateSuggestion()

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestion)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-black">선생님께 요청</h3>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-900 font-medium mb-1">발견된 오류</p>
              <p className="text-xs text-blue-800">"{error.content}"</p>
              <p className="text-[10px] text-blue-600 mt-1">{error.reason}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">추천 메시지</label>
              <Textarea value={suggestion} readOnly className="min-h-[100px] text-sm resize-none bg-white" />
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-900 leading-relaxed">💡 복사하여 선생님께 전달하세요</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-full border-2 border-gray-200 hover:bg-gray-50 h-11 text-sm font-medium bg-transparent"
            >
              닫기
            </Button>
            <Button
              onClick={handleCopy}
              className="flex-1 rounded-full bg-black hover:bg-gray-900 text-white h-11 text-sm font-medium"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  복사됨!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1.5" />
                  복사하기
                </>
              )}
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
