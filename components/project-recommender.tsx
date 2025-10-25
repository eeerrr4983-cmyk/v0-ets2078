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

  const analyzeAndRecommend = async () => {
    setIsAnalyzing(true)

    try {
      // Import the project recommendation function
      const { recommendProjects } = await import('@/lib/gemini-service')
      
      const career = userCareer || careerDirection || '미지정'
      const projectRecommendations = await recommendProjects(analysisResult, career)
      setRecommendations(projectRecommendations)
    } catch (error) {
      console.error('[Project Recommendation Error]', error)
      // Fallback to default recommendations
      setRecommendations({
        career: userCareer || "생기부 내용 기반 분석",
        bestProject: {
          title: "맞춤형 자율 과제",
          description: "학생의 진로와 관심사에 맞는 프로젝트",
          reason: "학생의 역량을 극대화할 수 있는 과제",
          difficulty: "중상",
          duration: "2-3개월",
          benefits: ["전공 역량 강화", "실전 경험 축적", "생기부 보강"],
        },
        projects: [
          {
            title: "진로 관련 심화 탐구",
            description: "관심 분야의 심화 학습 및 연구",
            reason: "진로 적합성 강화",
            difficulty: "중상",
            duration: "2-3개월",
            benefits: ["전문성 향상", "탐구 역량 강화"],
          },
        ],
        tips: [
          "프로젝트는 구체적인 결과물이 있어야 합니다.",
          "진로와의 연계성을 명확히 하세요.",
          "과정을 꼼꼼히 기록하세요.",
        ],
      })
    } finally {
      setIsAnalyzing(false)
    }
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
