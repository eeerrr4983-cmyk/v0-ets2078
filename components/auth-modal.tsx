"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, User, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"

export function AuthModal({ onClose, onGuestContinue }: { onClose: () => void; onGuestContinue?: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const { login } = useAuth()

  const handleGoogleAuth = async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError("")

    try {
      const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        console.error("[v0] Google OAuth error:", error)
        throw error
      }

      console.log("[v0] Google OAuth initiated successfully")
    } catch (err: any) {
      console.error("[v0] Google auth error:", err)
      setError("Google 로그인을 사용할 수 없습니다. 이메일로 로그인해주세요.")
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    setError("")

    if (!email || !password) {
      setError("아이디와 비밀번호를 입력해주세요.")
      return
    }

    setIsLoading(true)

    try {
      await login(email, password, rememberMe)
      onClose()
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <GlassCard className="p-5 space-y-3 rounded-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">로그인</h2>
            <button
              onClick={onClose}
              className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
            >
              비회원으로 돌아가기
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </motion.div>
          )}

          <div className="space-y-2.5">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">아이디</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="아이디"
                  className="pl-10 h-10 text-sm placeholder:text-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  className="pl-10 h-10 text-sm placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-xs text-gray-700 cursor-pointer">
                로그인 정보 저장
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white h-10 text-sm font-medium shadow-sm transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  처리중...
                </>
              ) : (
                "로그인"
              )}
            </Button>

            <Button
              onClick={handleGoogleAuth}
              variant="outline"
              className="w-full h-10 border-2 border-gray-200 hover:bg-gray-50 bg-transparent text-sm"
              disabled={isLoading}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              구글 계정으로 계속하기
            </Button>

            <p className="text-[10px] text-gray-500 text-center leading-relaxed">
              멘토링 매칭 기능은 회원만 사용할 수 있습니다.
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
