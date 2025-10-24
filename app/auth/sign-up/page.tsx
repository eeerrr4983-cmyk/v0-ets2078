"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Flame } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleGoogleSignUp = async () => {
    if (!agreedToTerms) {
      setError("서비스 이용약관 및 개인정보 처리방침에 동의해주세요")
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

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
    } catch (error: unknown) {
      console.error("[v0] Google sign-up error:", error)
      setError("Google 회원가입을 사용할 수 없습니다. 이메일로 회원가입해주세요.")
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (!agreedToTerms) {
      setError("서비스 이용약관 및 개인정보 처리방침에 동의해주세요")
      setIsLoading(false)
      return
    }

    if (password !== repeatPassword) {
      setError("비밀번호가 일치하지 않습니다")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}`,
          data: {
            full_name: fullName,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "회원가입 중 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-white to-red-50 overflow-y-auto">
      <div className="w-full max-w-md my-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Flame className="h-7 w-7 text-orange-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Huntfire
            </h1>
          </div>
          <Card className="border-orange-100">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-lg">회원가입</CardTitle>
              <CardDescription className="text-xs">새로운 계정을 만들어 생기부 분석을 시작하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <form onSubmit={handleSignUp} className="space-y-3">
                <Button
                  type="button"
                  onClick={handleGoogleSignUp}
                  variant="outline"
                  className="w-full h-9 border-2 border-gray-200 hover:bg-gray-50 bg-transparent text-sm"
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

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-gray-500">또는</span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="fullName" className="text-xs">
                    이름
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="이름"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-9 placeholder:text-gray-300 text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-xs">
                    이메일
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="이메일"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 placeholder:text-gray-300 text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-xs">
                    비밀번호
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="비밀번호"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-9 placeholder:text-gray-300 text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password" className="text-xs">
                    비밀번호 확인
                  </Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    placeholder="비밀번호 확인"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="h-9 placeholder:text-gray-300 text-sm"
                  />
                </div>

                <div className="flex items-start space-x-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    className="mt-0.5"
                  />
                  <div className="grid gap-1 leading-none">
                    <label
                      htmlFor="terms"
                      className="text-xs font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      서비스 이용약관 및 개인정보 처리방침에 동의합니다.
                    </label>
                    <p className="text-[10px] text-gray-600">학생의 정보는 암호화되어 안전하게 보관됩니다.</p>
                  </div>
                </div>

                {error && <div className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{error}</div>}
                <Button
                  type="submit"
                  className="w-full h-9 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? "가입 중..." : "회원가입"}
                </Button>
              </form>
              <div className="mt-2 text-center text-xs">
                이미 계정이 있으신가요?{" "}
                <Link href="/auth/login" className="text-orange-500 hover:text-orange-600 underline underline-offset-4">
                  로그인
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
