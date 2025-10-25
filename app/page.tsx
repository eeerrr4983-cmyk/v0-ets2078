"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { LiquidBackground } from "@/components/liquid-background"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  Loader2,
  Share2,
  Eye,
  AlertCircle,
  X,
  MessageSquare,
  Download,
  Shield,
  TrendingUp,
  Compass,
  Lightbulb,
  User,
  History,
  ChevronRight,
} from "lucide-react"
import { StorageManager } from "@/components/storage-manager"
import type { AnalysisResult } from "@/lib/types"
import { extractTextFromImage } from "@/lib/ocr"
import { TeacherCommunicationHelper } from "@/components/teacher-communication-helper"
import { AIKillerDetector } from "@/components/ai-killer-detector"
import { UniversityPredictor } from "@/components/university-predictor"
import { ProjectRecommender } from "@/components/project-recommender"
import { useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import { NotificationCenter } from "@/components/notification-center"

type Phase = "idle" | "uploading" | "ocr" | "analyzing" | "analysisComplete" | "complete"
type ResultTab = "strengths" | "improvements"

const PROGRESS_TIPS = [
  "구체적 활동 내용이 생기부의 핵심이에요.",
  "진로 연계성이 대학 평가의 중요 요소예요.",
  "수상은 의미있는 것만 선별하세요.",
  "지속적인 봉사가 진정성을 보여줘요.",
  "전공 관련 독서가 학업 열정을 드러내요.",
]

const PROGRESS_MESSAGES = {
  uploading: ["파일을 업로드하는 중이에요."],
  ocr: [
    "AI가 생기부를 읽어보고 있어요.",
    "텍스트를 정밀하게 추출하는 중이에요.",
    "생기부 내용을 분석하고 있어요.",
    "문서 구조를 파악하는 중이에요.",
  ],
  analyzing: [
    "AI가 정밀하게 탐지하는 중이에요.",
    "오류를 검사하고 있어요.",
    "강점과 보완점을 찾고 있어요.",
    "종합 평가를 계산하는 중이에요.",
  ],
}

// Helper function to generate AI-based titles for analysis history
const generateAnalysisTitle = (analysis: AnalysisResult, index: number): string => {
  if (analysis.studentName && analysis.studentName.trim()) {
    return `${analysis.studentName}의 생기부`
  }
  // For anonymous users, generate unique student numbers
  return `학생${index + 1}`
}

// Helper function for smart time display
const getSmartTimeDisplay = (uploadDate: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - uploadDate.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffMinutes < 60) {
    return "오늘"
  } else if (diffHours < 24) {
    return "오늘"
  } else if (diffDays === 1) {
    return "어제"
  } else if (diffDays === 2) {
    return "2일전"
  } else if (diffDays === 3) {
    return "3일전"
  } else if (diffDays < 7) {
    return `${diffDays}일전`
  } else if (diffWeeks === 1) {
    return "일주일전"
  } else if (diffWeeks === 2) {
    return "2주전"
  } else if (diffMonths === 1) {
    return "한달전"
  } else if (diffMonths === 2) {
    return "두달전"
  } else if (diffMonths < 12) {
    return `${diffMonths}달전`
  } else {
    return `${uploadDate.getMonth() + 1}/${uploadDate.getDate()}`
  }
}

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()

  const [phase, setPhase] = useState<Phase>("idle")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const [careerDirection, setCareerDirection] = useState("")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareData, setShareData] = useState({ studentId: "", name: "", agreedToTerms: false, isPrivate: false })
  const [ocrProgress, setOcrProgress] = useState(0)
  const [showTeacherHelper, setShowTeacherHelper] = useState(false)
  const [selectedError, setSelectedError] = useState<any>(null)
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([])
  const [showAIKiller, setShowAIKiller] = useState(false)
  const [showUniversityPredictor, setShowUniversityPredictor] = useState(false)
  const [showProjectRecommender, setShowProjectRecommender] = useState(false)
  const [progressMessage, setProgressMessage] = useState("")
  const [currentTip, setCurrentTip] = useState("")
  const [resultTab, setResultTab] = useState<ResultTab>("strengths")
  const [userSessionId] = useState(() => {
    if (typeof window !== "undefined") {
      let sessionId = sessionStorage.getItem("user_session_id")
      if (!sessionId) {
        sessionId = "user-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9)
        sessionStorage.setItem("user_session_id", sessionId)
      }
      const storedStudentId = sessionStorage.getItem("student_id")
      const storedName = sessionStorage.getItem("student_name")
      if (storedStudentId && storedName) {
        setShareData((prev) => ({ ...prev, studentId: storedStudentId, name: storedName }))
      }
      return sessionId
    }
    return "user-" + Date.now()
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showAnalysisComplete, setShowAnalysisComplete] = useState(false)
  const [hasShownCompletion, setHasShownCompletion] = useState(false)

  useEffect(() => {
    // Load from history (not from shared analyses)
    const history = StorageManager.getAnalysisHistory()
    setAnalysisHistory(history.slice(0, 3)) // Show最近 3 items
    
    // Also check for existing analysis state
    const checkAnalysisState = () => {
      if (typeof window !== "undefined") {
        const currentAnalysis = sessionStorage.getItem("current_analysis")
        const isAnalyzing = sessionStorage.getItem("is_analyzing") === "true"
        if (currentAnalysis && isAnalyzing) {
          setAnalysisResult(JSON.parse(currentAnalysis))
          setPhase("complete")
        }
      }
    }
    checkAnalysisState()
    
    // Listen for analysis state changes
    const handleStateChange = () => checkAnalysisState()
    window.addEventListener("analysisStateChange", handleStateChange)
    return () => window.removeEventListener("analysisStateChange", handleStateChange)
  }, [userSessionId])

  useEffect(() => {
    if (phase === "ocr" || phase === "analyzing") {
      const randomTip = PROGRESS_TIPS[Math.floor(Math.random() * PROGRESS_TIPS.length)]
      setCurrentTip(randomTip)
    }
  }, [phase])

  useEffect(() => {
    if (phase === "ocr" || phase === "analyzing") {
      const messages = phase === "ocr" ? PROGRESS_MESSAGES.ocr : PROGRESS_MESSAGES.analyzing
      let messageIndex = 0
      setProgressMessage(messages[0])

      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length
        setProgressMessage(messages[messageIndex])
      }, 2500)

      return () => clearInterval(interval)
    }
  }, [phase])

  useEffect(() => {
    const savedAnalysis = sessionStorage.getItem("current_analysis")
    const isAnalyzing = sessionStorage.getItem("is_analyzing") === "true"

    if (savedAnalysis && !analysisResult && isAnalyzing) {
      setAnalysisResult(JSON.parse(savedAnalysis))
      setPhase("complete")
    } else if (!isAnalyzing) {
      setPhase("idle")
      setAnalysisResult(null)
    }
  }, [])

  useEffect(() => {
    if (analysisResult) {
      sessionStorage.setItem("current_analysis", JSON.stringify(analysisResult))
    }
  }, [analysisResult])

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (
        phase === "uploading" ||
        phase === "ocr" ||
        phase === "analyzing" ||
        phase === "analysisComplete" ||
        phase === "complete"
      ) {
        sessionStorage.setItem("is_analyzing", "true")
      } else {
        sessionStorage.removeItem("is_analyzing")
      }
    }
  }, [phase])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setUploadedFiles(files)

      const urls = files.map((file) => URL.createObjectURL(file))
      setUploadedImageUrls(urls)

      startAnalysis(files)
    }
  }

  const handleFileSelectClick = () => {
    fileInputRef.current?.click()
  }

  const startAnalysis = async (files: File[]) => {
    setHasShownCompletion(false)

    if (typeof window !== "undefined") {
      sessionStorage.setItem("is_analyzing", "true")
    }

    setPhase("uploading")
    setProgressMessage("파일을 업로드하는 중이에요.")
    await new Promise((resolve) => setTimeout(resolve, 600))

    setPhase("ocr")
    setProgressMessage(PROGRESS_MESSAGES.ocr[0])
    const extractedTexts: string[] = []

    const totalFiles = files.length

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      const fileProgressStart = (i / totalFiles) * 100
      const fileProgressEnd = ((i + 1) / totalFiles) * 100

      const progressSteps = 60
      const stepSize = (fileProgressEnd - fileProgressStart) / progressSteps

      for (let step = 0; step < progressSteps; step++) {
        await new Promise((resolve) => setTimeout(resolve, 30))
        setOcrProgress(Math.min(99, fileProgressStart + stepSize * (step + 1)))
      }

      try {
        const text = await extractTextFromImage(file)
        extractedTexts.push(text)
      } catch (error) {
        console.error("[v0] OCR 오류:", error)
        extractedTexts.push("")
      }
    }

    setOcrProgress(100)
    await new Promise((resolve) => setTimeout(resolve, 200))

    setPhase("analyzing")
    setProgressMessage(PROGRESS_MESSAGES.analyzing[0])
    await new Promise((resolve) => setTimeout(resolve, 1800))

    if (!hasShownCompletion) {
      setPhase("analysisComplete")
      setShowAnalysisComplete(true)
      setHasShownCompletion(true)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setShowAnalysisComplete(false)
    }

    const careerAlignmentPercentage = careerDirection ? Math.floor(Math.random() * 30) + 60 : 0

    const mockErrors = [
      {
        type: "금지",
        content: "○○대학교 AI 캠프 참여",
        reason: "대학명 직접 명시 금지 (교육부 훈령 제530호)",
        page: 1,
        suggestion: "대학 주최 AI 캠프 참여로 수정 권장",
        riskLevel: 3,
      },
      {
        type: "금지",
        content: "TOEIC 900점 취득",
        reason: "공인어학시험 점수 기재 금지",
        page: 3,
        suggestion: "영어 의사소통 능력 우수로 표현",
        riskLevel: 3,
      },
      {
        type: "주의",
        content: "매사에 성실하고 적극적이며 앞으로가 기대됨",
        reason: "모호한 칭찬 표현, 구체적 관찰 근거 부족",
        page: 2,
        suggestion: "구체적인 활동 사례와 함께 성실성을 표현",
        riskLevel: 1,
      },
    ].sort((a, b) => b.riskLevel - a.riskLevel)

    const mockResult: AnalysisResult = {
      id: Date.now().toString(),
      studentName: "학생",
      uploadDate: new Date().toISOString(),
      overallScore: 88,
      careerDirection: careerDirection || undefined,
      careerAlignment: careerDirection
        ? {
            percentage: careerAlignmentPercentage,
            summary:
              careerAlignmentPercentage >= 80
                ? "진로 방향과 매우 잘 부합하는 생기부입니다."
                : careerAlignmentPercentage >= 60
                  ? "진로 방향과 적절히 연계된 생기부입니다."
                  : "진로 연계성을 더 강화하면 좋습니다.",
            strengths: ["AI 관련 활동이 진로와 직접 연결됨", "데이터 분석 역량이 우수함"],
            improvements: ["심화 탐구 활동 추가 권장", "전공 관련 독서 활동 보강"],
          }
        : undefined,
      strengths: [
        "AI 및 데이터 분석 관련 탐구 활동이 구체적이고 심층적임",
        "수학 세특에서 문제 해결 과정과 사고력이 명확히 드러남",
        "창의적 체험활동에서 리더십과 협업 역량이 우수함",
      ],
      improvements: [
        "진로 희망 대비 전공 적합성을 보완할 추가 활동 필요",
        "3학년 1학기 세특에서 심화 탐구 내용 보강 권장",
        "교과 간 연계성을 강화하여 일관된 서사 구축 필요",
      ],
      errors: mockErrors,
      suggestions: [
        "수학 세특: '데이터 분석' 키워드를 활용한 심화 탐구 추가 권장",
        "과학 세특: AI 윤리 관련 탐구로 진로 연계성 강화",
        "동아리 활동: 구체적인 역할과 성과를 명확히 기술",
      ],
      files: files.map((f) => f.name),
      isPrivate: true,
      likes: 0,
      saves: 0,
      comments: [],
      userId: userSessionId,
      studentProfile: "AI에 관심이 많은 학생으로 추정",
    }

    setAnalysisResult(mockResult)
    setPhase("complete")
    
    // CRITICAL: Set analysis state immediately for navigation
    if (typeof window !== "undefined") {
      sessionStorage.setItem("current_analysis", JSON.stringify(mockResult))
      sessionStorage.setItem("is_analyzing", "true")
      window.dispatchEvent(new CustomEvent("analysisStateChange"))
    }
    
    // Save to history immediately (even without sharing)
    StorageManager.saveToHistory(mockResult)
    
    // Reload history to show in "나의 최근 활동"
    setAnalysisHistory(StorageManager.getAnalysisHistory().slice(0, 3))
  }

  const handleShareClick = () => {
    setShowShareDialog(true)
  }

  const handleShareConfirm = () => {
    if (!shareData.studentId || !shareData.name || !shareData.agreedToTerms) {
      alert("모든 정보를 입력하고 동의해주세요.")
      return
    }

    sessionStorage.setItem("student_id", shareData.studentId)
    sessionStorage.setItem("student_name", shareData.name)

    if (analysisResult) {
      const sharedResult = {
        ...analysisResult,
        studentName: shareData.name,
        studentId: shareData.studentId,
        isPrivate: shareData.isPrivate,
      }

      StorageManager.saveAnalysis(sharedResult)
      setShowShareDialog(false)

      if (!shareData.isPrivate) {
        setTimeout(() => {
          router.push("/explore")
        }, 500)
      } else {
        alert("비공개로 저장되었습니다.")
      }
    }
  }

  const handleTeacherHelp = (error: any) => {
    setSelectedError(error)
    setShowTeacherHelper(true)
  }

  const handleExportPDF = () => {
    if (!analysisResult) return

    const report = `생기부 AI 분석 결과
===================

종합 평가: ${analysisResult.overallScore}점

${analysisResult.studentProfile ? `학생 프로필: ${analysisResult.studentProfile}` : ""}

${
  analysisResult.careerDirection &&
  `진로 방향: ${analysisResult.careerDirection}
진로 적합성: ${analysisResult.careerAlignment?.percentage}% (${analysisResult.careerAlignment?.summary})
`
}

강점:
${analysisResult.strengths.map((s, i) => `${i + 1}. ${s}`).join("\n")}

보완 사항:
${analysisResult.improvements.map((s, i) => `${i + 1}. ${s}`).join("\n")}

오류 ${analysisResult.errors.length}건:
${analysisResult.errors.map((e, i) => `${i + 1}. [${e.type}] ${e.content}\n   사유: ${e.reason}`).join("\n")}

개선 제안:
${analysisResult.suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n")}
    `.trim()

    const blob = new Blob([report], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    a.download = `생기부AI분석결과_${month}/${day}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetAnalysis = () => {
    setPhase("idle")
    setUploadedFiles([])
    uploadedImageUrls.forEach((url) => URL.revokeObjectURL(url))
    setUploadedImageUrls([])
    setAnalysisResult(null)
    setOcrProgress(0)
    setProgressMessage("")
    setCurrentTip("")
    setCareerDirection("")
    // sessionStorage.removeItem("current_analysis")
    // sessionStorage.removeItem("is_analyzing")
  }

  const isFixedScreen =
    phase === "idle" ||
    phase === "uploading" ||
    phase === "ocr" ||
    phase === "analyzing" ||
    phase === "analysisComplete"

  return (
    <AuthGuard>
      <div className={`relative h-screen w-screen bg-gray-50 ${isFixedScreen ? "overflow-hidden" : ""}`}>
        <LiquidBackground />
        <Navigation />
        {user && !user.isGuest && <NotificationCenter />}

        <div
          className={`relative z-10 h-full px-3 pt-2.5 pb-20 ${
            isFixedScreen ? "overflow-hidden flex flex-col items-center justify-center" : "overflow-y-auto"
          }`}
        >
          {phase === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-3"
            >
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-0.5" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif' }}>사상고 생기부AI</h1>
              <p className="text-xs text-gray-500 font-normal">학생 생활기록부 AI 탐지기</p>
            </motion.div>
          )}

          <div className={`max-w-lg mx-auto w-full ${isFixedScreen ? "" : ""}`}>
            <AnimatePresence mode="wait">
              {phase === "idle" && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2.5"
                >
                  <GlassCard className="p-2 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Compass className="w-3 h-3 text-blue-600" />
                      <h3 className="text-[11px] font-semibold text-gray-900">진로방향 설계</h3>
                    </div>
                    <p className="text-[9px] text-gray-600">나의 진학목표를 입력시 더 정밀한 분석을 받아볼수있어요.</p>
                    <Input
                      placeholder=""
                      value={careerDirection}
                      onChange={(e) => setCareerDirection(e.target.value)}
                      className="h-7 text-xs"
                    />
                  </GlassCard>

                  <GlassCard className="w-full p-6 text-center space-y-4" glow>
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto"
                    >
                      <Upload className="w-6 h-6 text-gray-700" />
                    </motion.div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-semibold text-gray-900">사상고 생기부AI 시작</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">생기부를 업로드하여 시작하세요.</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button
                      size="lg"
                      className="w-full max-w-xs text-sm h-10 rounded-full bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:shadow-lg transition-all font-medium"
                      onClick={handleFileSelectClick}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      사진 선택
                    </Button>
                  </GlassCard>

                  {analysisHistory.length > 0 && (
                    <GlassCard className="p-2.5 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-gray-700" />
                        <h3 className="text-xs font-semibold text-gray-900">나의 최근 활동</h3>
                      </div>
                      <div className="space-y-1.5">
                        {analysisHistory.map((analysis, index) => {
                          const uploadDate = new Date(analysis.uploadDate)
                          const timeDisplay = getSmartTimeDisplay(uploadDate)
                          const title = generateAnalysisTitle(analysis, index)

                          return (
                            <div
                              key={analysis.id}
                              className="w-full p-2.5 bg-gray-50/80 rounded-lg border border-gray-200/50 transition-all hover:border-gray-300/60"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold text-gray-900 truncate">{title}</span>
                                    <span className="text-[10px] text-gray-500 whitespace-nowrap">{timeDisplay}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-medium text-gray-700">종합 {analysis.overallScore}점</span>
                                    {analysis.careerDirection && (
                                      <span className="text-[10px] text-gray-500 truncate">• {analysis.careerDirection}</span>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setAnalysisResult(analysis)
                                    setPhase("complete")
                                    if (typeof window !== "undefined") {
                                      sessionStorage.setItem("current_analysis", JSON.stringify(analysis))
                                      sessionStorage.setItem("is_analyzing", "true")
                                    }
                                    window.scrollTo({ top: 0, behavior: "smooth" })
                                  }}
                                  className="h-7 px-2.5 text-[11px] bg-gray-900 hover:bg-gray-800 text-white rounded-md flex items-center gap-1 whitespace-nowrap flex-shrink-0"
                                >
                                  바로가기
                                  <ChevronRight className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </GlassCard>
                  )}
                </motion.div>
              )}

              {(phase === "uploading" || phase === "ocr" || phase === "analyzing" || phase === "analysisComplete") && (
                <motion.div
                  key="process"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  {(phase === "ocr" || phase === "analyzing") && (
                    <>
                      {progressMessage && (
                        <GlassCard className="p-2 text-center">
                          <p className="text-xs font-medium text-gray-700">{progressMessage}</p>
                        </GlassCard>
                      )}

                      <GlassCard className="p-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-700">
                            {phase === "ocr" ? "텍스트 추출 중..." : "AI 분석 중..."}
                          </span>
                          {phase === "ocr" && (
                            <span className="text-xs font-bold text-gray-900">{Math.floor(ocrProgress)}%</span>
                          )}
                        </div>
                        {phase === "ocr" && (
                          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                              className="h-full bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 rounded-full shadow-lg relative overflow-hidden"
                              style={{ width: `${ocrProgress}%` }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                animate={{
                                  x: ["-100%", "200%"],
                                }}
                                transition={{
                                  duration: 1.2,
                                  repeat: Infinity,
                                  ease: "linear",
                                  repeatType: "loop",
                                }}
                                style={{
                                  willChange: "transform",
                                }}
                              />
                            </motion.div>
                          </div>
                        )}
                        {phase === "analyzing" && (
                          <div className="flex justify-center py-2">
                            <motion.div
                              className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                ease: "linear",
                                repeatType: "loop",
                              }}
                              style={{
                                willChange: "transform",
                                transformOrigin: "center center",
                              }}
                            />
                          </div>
                        )}
                      </GlassCard>

                      <div className="grid grid-cols-3 gap-1.5">
                        <ProcessCard icon={Upload} title="업로드" active={false} complete={true} />
                        <ProcessCard
                          icon={Sparkles}
                          title="AI 분석"
                          active={phase === "ocr" || phase === "analyzing"}
                          complete={false}
                        />
                        <ProcessCard icon={CheckCircle2} title="완료" active={false} complete={false} />
                      </div>

                      {uploadedImageUrls.length > 0 && (
                        <GlassCard className="p-2 relative overflow-hidden rounded-2xl">
                          <div className="relative h-72">
                            <img
                              src={uploadedImageUrls[0] || "/placeholder.svg"}
                              alt="업로드된 생기부"
                              className="w-full h-full object-contain rounded-lg"
                              style={{ filter: 'brightness(0.92) contrast(1.05)' }}
                            />
                            {/* Premium scan effect with multiple layers */}
                            <motion.div
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                background: 'linear-gradient(180deg, transparent 0%, rgba(59, 130, 246, 0.12) 45%, rgba(96, 165, 250, 0.2) 50%, rgba(59, 130, 246, 0.12) 55%, transparent 100%)',
                                height: '40%',
                                filter: 'blur(2px)',
                              }}
                              animate={{
                                y: ["-50%", "150%"],
                              }}
                              transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                repeatType: "loop",
                              }}
                            />
                            {/* Subtle shimmer effect */}
                            <motion.div
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                background: 'linear-gradient(180deg, transparent 40%, rgba(255, 255, 255, 0.15) 50%, transparent 60%)',
                                height: '25%',
                              }}
                              animate={{
                                y: ["-30%", "130%"],
                              }}
                              transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                repeatType: "loop",
                                delay: 0.3,
                              }}
                            />
                            {/* Corner highlights */}
                            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-blue-500/40 rounded-tl-lg" />
                            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-blue-500/40 rounded-tr-lg" />
                            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-500/40 rounded-bl-lg" />
                            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-blue-500/40 rounded-br-lg" />
                          </div>
                        </GlassCard>
                      )}

                      {currentTip && (
                        <div className="text-center px-4 pt-2">
                          <p className="text-[10px] text-gray-500 italic">💡 {currentTip}</p>
                        </div>
                      )}
                    </>
                  )}

                  <AnimatePresence mode="wait">
                    {phase === "analysisComplete" && showAnalysisComplete && (
                      <motion.div
                        key="completion-popup"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                          duration: 0.4,
                        }}
                        className="flex items-center justify-center"
                      >
                        <GlassCard className="p-10 text-center" glow>
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{
                              scale: [0.8, 1.1, 1],
                            }}
                            transition={{
                              duration: 0.6,
                              ease: "easeOut",
                              times: [0, 0.6, 1],
                            }}
                            className="w-28 h-28 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mx-auto mb-4 shadow-lg"
                          >
                            <CheckCircle2 className="w-14 h-14 text-green-700" />
                          </motion.div>
                          <h3 className="text-4xl font-bold text-gray-900 mb-2">분석 완료!</h3>
                          <p className="text-lg text-gray-600">결과를 확인하세요.</p>
                        </GlassCard>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {phase === "complete" && analysisResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2.5 pb-4"
                >
                  <GlassCard className="p-3.5 text-center rounded-2xl" glow>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-black">{analysisResult.overallScore}점</div>
                      <p className="text-xs text-gray-600">종합 평가 (상위 12%)</p>

                      {analysisResult.studentProfile && (
                        <div className="pt-1.5 border-t border-gray-200/50">
                          <div className="flex items-center justify-center gap-1.5 mb-0.5">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                            <p className="text-xs font-semibold text-gray-700">학생의 전문성은?</p>
                          </div>
                          <p className="text-xs text-gray-600">{analysisResult.studentProfile}.</p>
                        </div>
                      )}
                    </div>
                  </GlassCard>

                  {analysisResult.careerAlignment && (
                    <GlassCard className="p-3 space-y-2 bg-gradient-to-br from-blue-50/80 to-purple-50/80 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4.5 h-4.5 text-blue-600" />
                        <h3 className="text-sm font-semibold text-gray-900">진로 적합성</h3>
                      </div>
                      <div className="text-center py-1.5">
                        <div className="text-3xl font-bold text-blue-600">
                          {analysisResult.careerAlignment.percentage}%
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{analysisResult.careerAlignment.summary}</p>
                      </div>
                    </GlassCard>
                  )}

                  <GlassCard className="p-3 space-y-2 rounded-2xl">
                    <div className="flex gap-2 border-b border-gray-200">
                      <button
                        onClick={() => setResultTab("strengths")}
                        className={`flex-1 pb-1.5 text-sm font-semibold transition-colors ${
                          resultTab === "strengths"
                            ? "text-green-700 border-b-2 border-green-600"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        강점
                      </button>
                      <button
                        onClick={() => setResultTab("improvements")}
                        className={`flex-1 pb-1.5 text-sm font-semibold transition-colors ${
                          resultTab === "improvements"
                            ? "text-orange-700 border-b-2 border-orange-600"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        보완
                      </button>
                    </div>
                    <ul className="space-y-1.5">
                      {resultTab === "strengths"
                        ? analysisResult.strengths.map((strength, idx) => (
                            <li key={idx} className="text-xs text-gray-700 leading-relaxed flex gap-2">
                              <span className="text-green-600 flex-shrink-0">•</span>
                              <span>{strength}.</span>
                            </li>
                          ))
                        : analysisResult.improvements.map((improvement, idx) => (
                            <li key={idx} className="text-xs text-gray-700 leading-relaxed flex gap-2">
                              <span className="text-orange-600 flex-shrink-0">•</span>
                              <span>{improvement}.</span>
                            </li>
                          ))}
                    </ul>
                  </GlassCard>

                  {analysisResult.errors.length > 0 && (
                    <GlassCard className="p-3 space-y-2 rounded-2xl">
                      <h3 className="text-sm font-semibold text-black flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        오류 {analysisResult.errors.length}건
                      </h3>
                      <div className="space-y-1.5">
                        {analysisResult.errors.map((error, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border space-y-1.5 ${
                              error.type === "금지"
                                ? "bg-red-50/60 border-red-200/60"
                                : "bg-orange-50/60 border-orange-200/60"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span
                                className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0 ${
                                  error.type === "금지" ? "bg-red-600 text-white" : "bg-orange-500 text-white"
                                }`}
                              >
                                {error.type}
                              </span>
                              <div className="flex-1 space-y-0.5 min-w-0">
                                <p className="text-xs font-medium text-gray-900">"{error.content}"</p>
                                <p className="text-[10px] text-gray-600 leading-relaxed">{error.reason}.</p>
                                {error.suggestion && (
                                  <div className="mt-1.5 p-1.5 bg-green-50/80 rounded-lg border border-green-200/60">
                                    <p className="text-[10px] text-green-800 font-medium">✓ 올바른 표현:</p>
                                    <p className="text-[10px] text-green-700 mt-0.5">{error.suggestion}.</p>
                                  </div>
                                )}
                                <button
                                  onClick={() => handleTeacherHelp(error)}
                                  className="mt-1 text-[10px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  선생님께 요청
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  )}

                  {analysisResult.suggestions.length > 0 && (
                    <GlassCard className="p-3 space-y-1.5 rounded-2xl">
                      <h3 className="text-sm font-semibold text-black flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        개선 제안
                      </h3>
                      <ul className="space-y-1">
                        {analysisResult.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-xs text-gray-700 leading-relaxed">
                            • {suggestion}.
                          </li>
                        ))}
                      </ul>
                    </GlassCard>
                  )}

                  <Button
                    size="sm"
                    className="w-full rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-11 text-sm font-medium shadow-lg"
                    onClick={() => setShowProjectRecommender(true)}
                  >
                    <Lightbulb className="w-4 h-4 mr-1.5" />
                    나에게 딱맞는 자율과제 추천받기!
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full rounded-full border-2 border-blue-200 hover:bg-blue-50 h-9 text-sm bg-white font-medium text-blue-700"
                    onClick={() => setShowUniversityPredictor(true)}
                  >
                    <TrendingUp className="w-4 h-4 mr-1.5" />
                    대학 예측
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full rounded-full border-2 border-purple-200 hover:bg-purple-50 h-9 text-sm bg-white font-medium text-purple-700"
                    onClick={() => setShowAIKiller(true)}
                  >
                    <Shield className="w-4 h-4 mr-1.5" />
                    AI 탐지
                  </Button>

                  <div className="flex flex-col gap-2 pt-1">
                    <Button
                      size="lg"
                      className="w-full rounded-full bg-black hover:bg-gray-900 text-white h-11 text-sm font-medium shadow-lg"
                      onClick={() => router.push("/results")}
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      상세 결과
                    </Button>
                    <div className="grid grid-cols-3 gap-1.5 mt-1">
                      <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full border-2 border-gray-200 hover:bg-gray-50 h-9 text-sm font-medium flex items-center justify-center gap-1 bg-transparent"
                        onClick={handleShareClick}
                      >
                        <Share2 className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-xs">공유</span>
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full border-2 border-gray-200 hover:bg-gray-50 h-9 text-sm font-medium flex items-center justify-center gap-1 bg-transparent"
                        onClick={handleExportPDF}
                      >
                        <Download className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-xs">다운로드</span>
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full border-2 border-gray-200 hover:bg-gray-50 h-9 text-sm font-medium flex items-center justify-center gap-1 bg-transparent"
                        onClick={resetAnalysis}
                      >
                        <X className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-xs">종료</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {showShareDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-sm"
              >
                <GlassCard className="p-4 space-y-3 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-black">공유 설정</h3>
                    <button
                      onClick={() => setShowShareDialog(false)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">학번</label>
                      <Input
                        value={shareData.studentId}
                        onChange={(e) => setShareData({ ...shareData, studentId: e.target.value })}
                        className="h-9 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">이름</label>
                      <Input
                        value={shareData.name}
                        onChange={(e) => setShareData({ ...shareData, name: e.target.value })}
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-800">비공개로 저장</p>
                          <p className="text-[10px] text-gray-600 mt-0.5">탐색 페이지에 공유 안 함</p>
                        </div>
                        <Switch
                          checked={shareData.isPrivate}
                          onCheckedChange={(checked) => setShareData({ ...shareData, isPrivate: checked })}
                        />
                      </div>
                    </div>

                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={shareData.agreedToTerms}
                          onChange={(e) => setShareData({ ...shareData, agreedToTerms: e.target.checked })}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <p className="text-xs text-gray-800 leading-relaxed">
                            민감한 정보는 자동으로
                            <br />
                            암호화 처리되어 게시됩니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={() => setShowShareDialog(false)}
                      variant="outline"
                      className="flex-1 rounded-full border-2 border-gray-200 hover:bg-gray-50 h-10 text-sm font-medium"
                    >
                      취소
                    </Button>
                    <Button
                      onClick={handleShareConfirm}
                      className="flex-1 rounded-full bg-black hover:bg-gray-900 text-white h-10 text-sm font-medium"
                    >
                      {shareData.isPrivate ? "비공개 저장" : "공유하기"}
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          )}

          {showTeacherHelper && selectedError && (
            <TeacherCommunicationHelper
              error={selectedError}
              onClose={() => {
                setShowTeacherHelper(false)
                setSelectedError(null)
              }}
            />
          )}

          {showAIKiller && analysisResult && (
            <AIKillerDetector analysisResult={analysisResult} onClose={() => setShowAIKiller(false)} />
          )}

          {showUniversityPredictor && analysisResult && (
            <UniversityPredictor analysisResult={analysisResult} onClose={() => setShowUniversityPredictor(false)} />
          )}

          {showProjectRecommender && analysisResult && (
            <ProjectRecommender
              analysisResult={analysisResult}
              careerDirection={careerDirection}
              onClose={() => setShowProjectRecommender(false)}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  )
}

interface ProcessCardProps {
  icon: React.ElementType
  title: string
  active: boolean
  complete: boolean
}

function ProcessCard({ icon: Icon, title, active, complete }: ProcessCardProps) {
  return (
    <GlassCard
      className={`p-3 text-center space-y-1.5 transition-all duration-500 ${
        active ? "ring-2 ring-black shadow-lg scale-105" : ""
      } ${complete ? "bg-gray-50/30" : ""}`}
      hover={false}
    >
      <div className="flex justify-center">
        {active && !complete ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop",
            }}
            style={{
              willChange: "transform",
              transformOrigin: "center center",
            }}
          >
            <Loader2 className="w-5 h-5 text-black" />
          </motion.div>
        ) : complete ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
            <CheckCircle2 className="w-5 h-5 text-black" />
          </motion.div>
        ) : (
          <Icon className="w-5 h-5 text-gray-300" />
        )}
      </div>
      <h4 className="font-medium text-xs text-black">{title}</h4>
    </GlassCard>
  )
}
