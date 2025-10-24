"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { X, Lightbulb, Loader2, Sparkles, Target, BookOpen, Crown } from "lucide-react"
import type { AnalysisResult } from "@/lib/types"

interface ProjectRecommenderProps {
  analysisResult: AnalysisResult
  careerDirection: string
  onClose: () => void
}

export function ProjectRecommender({ analysisResult, careerDirection, onClose }: ProjectRecommenderProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [userCareer, setUserCareer] = useState(careerDirection)
  const [recommendations, setRecommendations] = useState<any>(null)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  const analyzeAndRecommend = () => {
    setIsAnalyzing(true)

    setTimeout(() => {
      const mockRecommendations = {
        career: userCareer || "생기부 내용 기반 분석",
        bestProject: {
          title: "나만의 AI 챗봇 개발 프로젝트",
          description: "실생활 문제를 해결하는 맞춤형 AI 챗봇 설계 및 구현",
          reason: "학생의 역량과 활동성을 극대화할 수 있는 최적의 과제",
          difficulty: "상",
          duration: "3-4개월",
          benefits: ["전공 역량 극대화", "실전 경험 축적", "대학 진학 시 매우 유리"],
        },
        projects: [
          {
            title: "머신러닝 모델 개발 탐구",
            description: "실생활 문제를 해결하는 간단한 ML 모델 구현",
            reason: "AI 진로에 필수적인 기술 습득",
            difficulty: "상",
            duration: "3-4개월",
            benefits: ["심화 학습", "기술 역량 강화", "대학 진학 시 유리"],
          },
          {
            title: "AI 기반 데이터 분석 프로젝트",
            description: "공공 데이터를 활용한 사회 문제 해결 분석",
            reason: "진로와의 연계되며 데이터 분석 역량 강화",
            difficulty: "중상",
            duration: "2-3개월",
            benefits: ["전공 적합성 향상", "실전 경험 축적", "포트폴리오 구축"],
          },
          {
            title: "교내 AI 동아리 프로젝트",
            description: "팀 단위로 AI 서비스 기획 및 프로토타입 제작",
            reason: "협업 능력과 리더십 함께 발전",
            difficulty: "중",
            duration: "1-2개월",
            benefits: ["팀워크 향상", "실무 경험", "생기부 강화"],
          },
        ],
        tips: [
          "프로젝트는 구체적인 결과물이 있어야 합니다.",
          "진로와의 연계성을 명확히 설명할 수 있어야 해요.",
          "과정과 성찰을 함께 기록하면 더 좋습니다.",
        ],
      }
      setRecommendations(mockRecommendations)
      setIsAnalyzing(false)
    }, 2500)
  }

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
              <Lightbulb className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-black">자율과제 추천</h3>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pt-3">
            {!recommendations && !isAnalyzing && (
              <div className="space-y-3">
                <p className="text-xs text-gray-600">나에게 딱맞는 자율과제를 찾아보세요!</p>
                <Button
                  onClick={analyzeAndRecommend}
                  className="w-full rounded-full bg-purple-600 hover:bg-purple-700 text-white h-9 text-sm font-medium"
                >
                  추천받기
                </Button>
              </div>
            )}

            {isAnalyzing && (
              <div className="py-1.5 text-center space-y-1.5">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-9 h-9 mx-auto"
                >
                  <Loader2 className="w-9 h-9 text-purple-600" />
                </motion.div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-gray-900">분석 중...</h4>
                  <p className="text-xs text-gray-600">진로에 맞는 프로젝트를 찾고 있어요.</p>
                </div>
              </div>
            )}

            {recommendations && (
              <div className="space-y-3 pb-3">
                <GlassCard className="p-4 bg-gradient-to-br from-purple-50/80 to-blue-50/80 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Target className="w-4.5 h-4.5 text-purple-600" />
                    <h4 className="text-sm font-semibold text-gray-900">나의 진로: {recommendations.career}</h4>
                  </div>
                </GlassCard>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    최고의 과제
                  </h4>
                  <GlassCard className="p-4 space-y-3 hover:shadow-lg transition-shadow rounded-2xl border-2 border-yellow-200/60 bg-gradient-to-br from-yellow-50/40 to-orange-50/40">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-sm font-bold text-gray-900">{recommendations.bestProject.title}</h5>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium whitespace-nowrap">
                          {recommendations.bestProject.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {recommendations.bestProject.description}.
                      </p>
                    </div>

                    <div className="p-1.5 bg-blue-50/60 rounded-lg border border-blue-200/60">
                      <p className="text-xs text-blue-800">
                        <span className="font-semibold">추천 이유:</span> {recommendations.bestProject.reason}.
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>⏱️ {recommendations.bestProject.duration}</span>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-gray-900">기대 효과:</p>
                      <ul className="space-y-0.5">
                        {recommendations.bestProject.benefits.map((benefit: string, bidx: number) => (
                          <li key={bidx} className="text-xs text-gray-700">
                            • {benefit}.
                          </li>
                        ))}
                      </ul>
                    </div>
                  </GlassCard>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    추천 자율과제
                  </h4>
                  {recommendations.projects
                    .sort((a: any, b: any) => {
                      const difficultyOrder: any = { 상: 3, 중상: 2, 중: 1, 하: 0 }
                      return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]
                    })
                    .map((project: any, idx: number) => (
                      <GlassCard key={idx} className="p-4 space-y-3 hover:shadow-lg transition-shadow rounded-2xl">
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="text-sm font-bold text-gray-900">{project.title}</h5>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium whitespace-nowrap">
                              {project.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed">{project.description}.</p>
                        </div>

                        <div className="p-1.5 bg-blue-50/60 rounded-lg border border-blue-200/60">
                          <p className="text-xs text-blue-800">
                            <span className="font-semibold">추천 이유:</span> {project.reason}.
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>⏱️ {project.duration}</span>
                        </div>

                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-gray-900">기대 효과:</p>
                          <ul className="space-y-0.5">
                            {project.benefits.map((benefit: string, bidx: number) => (
                              <li key={bidx} className="text-xs text-gray-700">
                                • {benefit}.
                              </li>
                            ))}
                          </ul>
                        </div>
                      </GlassCard>
                    ))}
                </div>

                <GlassCard className="p-4 space-y-1 bg-amber-50/60 border-amber-200/60 rounded-2xl">
                  <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    프로젝트 진행 팁
                  </h4>
                  <ul className="space-y-0.5">
                    {recommendations.tips.map((tip: string, idx: number) => (
                      <li key={idx} className="text-xs text-amber-800 leading-relaxed">
                        • {tip}
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
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
