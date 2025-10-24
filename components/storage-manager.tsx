"use client"

import type { AnalysisResult, UserInteraction } from "@/lib/types"

export class StorageManager {
  // 분석 결과 저장
  static saveAnalysis(result: AnalysisResult): void {
    const results = this.getAllAnalyses()
    results.push(result)
    localStorage.setItem("saenggibu_analyses", JSON.stringify(results))
  }

  // 모든 분석 결과 가져오기
  static getAllAnalyses(): AnalysisResult[] {
    const data = localStorage.getItem("saenggibu_analyses")
    return data ? JSON.parse(data) : []
  }

  // 분석 결과 업데이트
  static updateAnalysis(analysisId: string, updates: Partial<AnalysisResult>): void {
    const results = this.getAllAnalyses()
    const index = results.findIndex((a) => a.id === analysisId)
    if (index !== -1) {
      results[index] = { ...results[index], ...updates }
      localStorage.setItem("saenggibu_analyses", JSON.stringify(results))
    }
  }

  // 사용자 상호작용 저장
  static saveInteraction(interaction: UserInteraction): void {
    localStorage.setItem(
      "saenggibu_interaction",
      JSON.stringify({
        likedAgents: Array.from(interaction.likedAgents),
        savedAgents: Array.from(interaction.savedAgents),
        likedComments: Array.from(interaction.likedComments),
      }),
    )
  }

  // 사용자 상호작용 가져오기
  static getInteraction(): UserInteraction {
    const data = localStorage.getItem("saenggibu_interaction")
    if (!data) {
      return {
        likedAgents: new Set(),
        savedAgents: new Set(),
        likedComments: new Set(),
      }
    }
    const parsed = JSON.parse(data)
    return {
      likedAgents: new Set(parsed.likedAgents || []),
      savedAgents: new Set(parsed.savedAgents || []),
      likedComments: new Set(parsed.likedComments || []),
    }
  }

  // 트렌딩 분석 결과 계산
  static getTrendingAnalyses(): AnalysisResult[] {
    const results = this.getAllAnalyses()
    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000

    return results
      .filter((result) => new Date(result.uploadDate).getTime() > oneDayAgo)
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 3)
  }

  // 개인화 추천 알고리즘
  static getPersonalizedRecommendations(searchQuery: string): AnalysisResult[] {
    const results = this.getAllAnalyses()
    const interaction = this.getInteraction()

    const scored = results.map((result) => {
      let score = 0

      // 검색어 매칭
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (result.studentName.toLowerCase().includes(query)) score += 10
        if (result.strengths.some((s) => s.toLowerCase().includes(query))) score += 5
        if (result.improvements.some((i) => i.toLowerCase().includes(query))) score += 3
      }

      // 인기도
      score += result.likes * 2
      score += result.saves * 3

      // 최신성
      const daysSinceCreation = (Date.now() - new Date(result.uploadDate).getTime()) / (1000 * 60 * 60 * 24)
      score += Math.max(0, 10 - daysSinceCreation)

      return { result, score }
    })

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item) => item.result)
  }

  static deleteAnalysis(analysisId: string): void {
    const results = this.getAllAnalyses()
    const filtered = results.filter((a) => a.id !== analysisId)
    localStorage.setItem("saenggibu_analyses", JSON.stringify(filtered))
  }

  static saveAsPrivate(result: AnalysisResult): void {
    const updatedResult = { ...result, isPrivate: true }
    this.saveAnalysis(updatedResult)
  }

  // 사용자별 분석 결과 가져오기
  static getUserAnalyses(userId: string): AnalysisResult[] {
    const allAnalyses = this.getAllAnalyses()
    return allAnalyses.filter((analysis) => analysis.userId === userId)
  }

  // 공개 분석 결과 가져오기
  static getPublicAnalyses(): AnalysisResult[] {
    const allAnalyses = this.getAllAnalyses()
    return allAnalyses.filter((analysis) => !analysis.isPrivate)
  }
}
