// 로컬 스토리지 관리
import type { Agent, UserInteraction, AnalysisResult } from "./types"

export class StorageManager {
  // 에이전트 저장
  static saveAgent(agent: Agent): void {
    try {
      const agents = this.getAllAgents()
      agents.push(agent)
      const serialized = this.safeJSONStringify(agents)
      if (serialized) {
        localStorage.setItem("huntfire_agents", serialized)
      }
    } catch (error) {
      this.handleStorageError(error, "saveAgent")
    }
  }

  // 모든 에이전트 가져오기
  static getAllAgents(): Agent[] {
    try {
      const data = localStorage.getItem("huntfire_agents")
      return this.safeJSONParse(data, [])
    } catch (error) {
      this.handleStorageError(error, "getAllAgents")
      return []
    }
  }

  // 에이전트 업데이트
  static updateAgent(agentId: string, updates: Partial<Agent>): void {
    try {
      const agents = this.getAllAgents()
      const index = agents.findIndex((a) => a.id === agentId)
      if (index !== -1) {
        agents[index] = { ...agents[index], ...updates }
        const serialized = this.safeJSONStringify(agents)
        if (serialized) {
          localStorage.setItem("huntfire_agents", serialized)
        }
      }
    } catch (error) {
      this.handleStorageError(error, "updateAgent")
    }
  }

  // 사용자 상호작용 저장
  static saveInteraction(interaction: UserInteraction): void {
    try {
      const serialized = this.safeJSONStringify({
        likedAgents: Array.from(interaction.likedAgents),
        savedAgents: Array.from(interaction.savedAgents),
        likedComments: Array.from(interaction.likedComments),
      })
      if (serialized) {
        localStorage.setItem("huntfire_interaction", serialized)
      }
    } catch (error) {
      this.handleStorageError(error, "saveInteraction")
    }
  }

  // 사용자 상호작용 가져오기
  static getInteraction(): UserInteraction {
    try {
      const data = localStorage.getItem("huntfire_interaction")
      if (!data) {
        return {
          likedAgents: new Set(),
          savedAgents: new Set(),
          likedComments: new Set(),
        }
      }
      const parsed = this.safeJSONParse(data, {
        likedAgents: [],
        savedAgents: [],
        likedComments: [],
      })
      return {
        likedAgents: new Set(parsed.likedAgents || []),
        savedAgents: new Set(parsed.savedAgents || []),
        likedComments: new Set(parsed.likedComments || []),
      }
    } catch (error) {
      this.handleStorageError(error, "getInteraction")
      return {
        likedAgents: new Set(),
        savedAgents: new Set(),
        likedComments: new Set(),
      }
    }
  }

  // 트렌딩 에이전트 계산
  static getTrendingAgents(): Agent[] {
    const agents = this.getAllAgents()
    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000

    return agents
      .filter((agent) => new Date(agent.createdAt).getTime() > oneDayAgo)
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 3) // 5개에서 3개로 변경
  }

  // 개인화 추천 알고리즘
  static getPersonalizedRecommendations(searchQuery: string): Agent[] {
    const agents = this.getAllAgents()
    const interaction = this.getInteraction()

    // 검색어와 매칭되는 에이전트 우선
    const scored = agents.map((agent) => {
      let score = 0

      // 검색어 매칭
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (agent.name.toLowerCase().includes(query)) score += 10
        if (agent.description.toLowerCase().includes(query)) score += 5
        if (agent.goal.toLowerCase().includes(query)) score += 3
      }

      // 인기도
      score += agent.likes * 2
      score += agent.saves * 3

      // 최신성
      const daysSinceCreation = (Date.now() - new Date(agent.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      score += Math.max(0, 10 - daysSinceCreation)

      return { agent, score }
    })

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item) => item.agent)
  }

  static deleteAgent(agentId: string): void {
    const agents = this.getAllAgents()
    const filtered = agents.filter((a) => a.id !== agentId)
    localStorage.setItem("huntfire_agents", JSON.stringify(filtered))
  }

  static saveAsPrivate(agent: Agent): void {
    const updatedAgent = { ...agent, isPrivate: true }
    this.saveAgent(updatedAgent)
  }

  // 분석 결과 저장
  static saveAnalysis(analysis: AnalysisResult): void {
    try {
      const analyses = this.getAllAnalyses()
      analyses.push(analysis)
      const serialized = this.safeJSONStringify(analyses)
      if (serialized) {
        localStorage.setItem("saenggibu_analyses", serialized)
      }
    } catch (error) {
      this.handleStorageError(error, "saveAnalysis")
    }
  }

  // 모든 분석 결과 가져오기
  static getAllAnalyses(): AnalysisResult[] {
    try {
      const data = localStorage.getItem("saenggibu_analyses")
      return this.safeJSONParse(data, [])
    } catch (error) {
      this.handleStorageError(error, "getAllAnalyses")
      return []
    }
  }

  static getUserAnalyses(userId: string): AnalysisResult[] {
    try {
      const allAnalyses = this.getAllAnalyses()
      return allAnalyses.filter((analysis) => analysis.userId === userId)
    } catch (error) {
      this.handleStorageError(error, "getUserAnalyses")
      return []
    }
  }

  // 최근 활동 가져오기 (최근 3개)
  static getRecentActivity(userId: string): AnalysisResult[] {
    try {
      const userAnalyses = this.getUserAnalyses(userId)
      // 최신순으로 정렬 후 3개만 반환
      return userAnalyses
        .sort((a, b) => {
          const dateA = new Date(a.uploadDate || a.timestamp || 0).getTime()
          const dateB = new Date(b.uploadDate || b.timestamp || 0).getTime()
          return dateB - dateA
        })
        .slice(0, 3)
    } catch (error) {
      this.handleStorageError(error, "getRecentActivity")
      return []
    }
  }

  // 시간 포맷팅 (오늘, 어제, MM/DD)
  static formatTimeAgo(dateString: string): string {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24))

      if (daysDiff === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        if (hours === 0) {
          const minutes = Math.floor(diff / (1000 * 60))
          return `${minutes}분 전`
        }
        return `${hours}시간 전`
      } else if (daysDiff === 1) {
        return '어제'
      } else if (daysDiff < 7) {
        return `${daysDiff}일 전`
      } else {
        const month = date.getMonth() + 1
        const day = date.getDate()
        return `${month}/${day}`
      }
    } catch (error) {
      return ''
    }
  }

  static getPublicAnalyses(): AnalysisResult[] {
    try {
      const allAnalyses = this.getAllAnalyses()
      return allAnalyses.filter((analysis) => !analysis.isPrivate)
    } catch (error) {
      this.handleStorageError(error, "getPublicAnalyses")
      return []
    }
  }

  static updateAnalysis(analysisId: string, updates: Partial<AnalysisResult>): void {
    try {
      const analyses = this.getAllAnalyses()
      const index = analyses.findIndex((a) => a.id === analysisId)
      if (index !== -1) {
        analyses[index] = { ...analyses[index], ...updates }
        const serialized = this.safeJSONStringify(analyses)
        if (serialized) {
          localStorage.setItem("saenggibu_analyses", serialized)
        }
      }
    } catch (error) {
      this.handleStorageError(error, "updateAnalysis")
    }
  }

  static getTrendingAnalyses(): AnalysisResult[] {
    const analyses = this.getPublicAnalyses()
    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000

    return analyses
      .filter((analysis) => new Date(analysis.uploadDate).getTime() > oneDayAgo)
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 3)
  }

  static getPersonalizedRecommendations(searchQuery: string): AnalysisResult[] {
    const analyses = this.getPublicAnalyses()
    const interaction = this.getInteraction()

    const scored = analyses.map((analysis) => {
      let score = 0

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (analysis.studentName.toLowerCase().includes(query)) score += 10
        if (analysis.strengths.some((s) => s.toLowerCase().includes(query))) score += 5
        if (analysis.improvements.some((i) => i.toLowerCase().includes(query))) score += 3
      }

      score += analysis.likes * 2
      score += analysis.saves * 3

      const daysSinceUpload = (Date.now() - new Date(analysis.uploadDate).getTime()) / (1000 * 60 * 60 * 24)
      score += Math.max(0, 10 - daysSinceUpload)

      return { analysis, score }
    })

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item) => item.analysis)
  }

  private static handleStorageError(error: unknown, operation: string): void {
    console.error(`[v0] Storage error during ${operation}:`, error)
  }

  private static safeJSONParse<T>(data: string | null, fallback: T): T {
    if (!data) return fallback
    try {
      return JSON.parse(data)
    } catch (error) {
      this.handleStorageError(error, "JSON parsing")
      return fallback
    }
  }

  private static safeJSONStringify(data: any): string | null {
    try {
      return JSON.stringify(data)
    } catch (error) {
      this.handleStorageError(error, "JSON stringifying")
      return null
    }
  }

  static clearCache(): void {
    try {
      const keysToKeep = ["user_session_id", "student_id", "student_name", "user_display_number"]
      const allKeys = Object.keys(localStorage)

      allKeys.forEach((key) => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      this.handleStorageError(error, "clearCache")
    }
  }

  static getStorageSize(): number {
    try {
      let total = 0
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length
        }
      }
      return total
    } catch (error) {
      this.handleStorageError(error, "getStorageSize")
      return 0
    }
  }
}
