"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { X, TrendingUp, Loader2, Award, Target, Lightbulb } from "lucide-react"
import type { AnalysisResult } from "@/lib/types"

interface UniversityPredictorProps {
  analysisResult: AnalysisResult
  onClose: () => void
}

export function UniversityPredictor({ analysisResult, onClose }: UniversityPredictorProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [prediction, setPrediction] = useState<any>(null)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  useEffect(() => {
    setTimeout(() => {
      const mockPrediction = {
        nationalPercentile: 12,
        academicLevel: "상위권",
        reachableUniversities: [
          { tier: "최상위권", universities: ["서울대", "연세대", "고려대"], probability: "도전" },
          { tier: "상위권", universities: ["성균관대", "한양대", "중앙대"], probability: "적정" },
          { tier: "중상위권", universities: ["경희대", "한국외대", "서울시립대"], probability: "안정" },
        ],
        strengthAnalysis: "AI 및 데이터 분석 관련 활동이 우수하여 공학계열 진학에 유리합니다.",
        improvementNeeded: "3학년 심화 탐구 활동을 보강하면 최상위권 대학 합격 가능성이 높아집니다.",
        recommendations: [
          "현재 생기부 수준으로 상위권 대학 지원 가능",
          "전공 적합성을 더 강화하면 최상위권도 도전 가능",
          "교과 성적과 생기부가 균형있게 발전 중",
        ],
      }
      setPrediction(mockPrediction)
      setIsAnalyzing(false)
    }, 2500)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-8 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        <GlassCard className="flex flex-col max-h-full rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-200/50 flex-shrink-0 bg-white/95 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-black">대학 지원 가능성</h3>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pt-3">
            <p className="text-xs text-gray-600 mb-3">생기부 분석을 바탕으로 지원 가능한 대학을 예측합니다.</p>

            {isAnalyzing ? (
              <div className="py-1.5 text-center space-y-1.5">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-10 h-10 mx-auto"
                >
                  <Loader2 className="w-10 h-10 text-blue-600" />
                </motion.div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-gray-900">예측 중...</h4>
                  <p className="text-xs text-gray-600">생기부 수준을 분석하고 있습니다</p>
                </div>
              </div>
            ) : prediction ? (
              <div className="space-y-4 pb-3">
                <GlassCard className="p-4 space-y-3 bg-gradient-to-br from-blue-50/80 to-purple-50/80 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900">전국 상위</h4>
                    <div className="text-3xl font-bold text-blue-600">{prediction.nationalPercentile}%</div>
                  </div>
                  <p className="text-xs text-gray-600">현재 생기부 수준: {prediction.academicLevel}</p>
                </GlassCard>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    지원 가능 대학
                  </h4>
                  {prediction.reachableUniversities.map((tier: any, idx: number) => (
                    <GlassCard key={idx} className="p-4 space-y-1 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-semibold text-gray-900">{tier.tier}</h5>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            tier.probability === "안정"
                              ? "bg-green-100 text-green-700"
                              : tier.probability === "적정"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {tier.probability}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700">{tier.universities.join(", ")}</p>
                    </GlassCard>
                  ))}
                </div>

                <GlassCard className="p-4 space-y-1 bg-green-50/60 border-green-200/60 rounded-2xl">
                  <h4 className="text-sm font-semibold text-green-800 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    강점 분석
                  </h4>
                  <p className="text-xs text-green-700 leading-relaxed">{prediction.strengthAnalysis}</p>
                </GlassCard>

                <GlassCard className="p-4 space-y-1 bg-orange-50/60 border-orange-200/60 rounded-2xl">
                  <h4 className="text-sm font-semibold text-orange-800 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    개선 방향
                  </h4>
                  <p className="text-xs text-orange-700 leading-relaxed">{prediction.improvementNeeded}</p>
                </GlassCard>

                <GlassCard className="p-4 space-y-1 rounded-2xl">
                  <h4 className="text-sm font-semibold text-gray-900">종합 의견</h4>
                  <ul className="space-y-0.5">
                    {prediction.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="text-xs text-gray-700 leading-relaxed">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </GlassCard>

                <Button
                  onClick={onClose}
                  className="w-full rounded-full bg-black hover:bg-gray-900 text-white h-10 text-sm font-medium"
                >
                  확인
                </Button>
              </div>
            ) : null}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
