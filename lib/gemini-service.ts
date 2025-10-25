/**
 * Gemini AI Service client utilities for 생기부 AI
 *
 * All network calls are routed through Next.js API endpoints to keep secrets server-side.
 */

import type { AIKillerResult, AnalysisResult, ErrorItem } from "./types"

const API_ROUTES = {
  analyze: "/api/analyze",
  university: "/api/university",
  projects: "/api/projects",
  detect: "/api/detect",
} as const

class ApiRequestError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = "ApiRequestError"
    this.status = status
    this.details = details
  }
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  if (!response.ok) {
    try {
      const data = await response.json()
      const message = typeof data?.error === "string" ? data.error : response.statusText
      throw new ApiRequestError(response.status, message, data)
    } catch (innerError) {
      if (innerError instanceof ApiRequestError) {
        throw innerError
      }
      const fallbackMessage = await response.text()
      throw new ApiRequestError(response.status, fallbackMessage || response.statusText)
    }
  }

  return (await response.json()) as T
}

interface NormalizedAnalysisResult {
  id: string
  overallScore: number
  studentProfile: string
  careerDirection: string
  careerAlignment?: {
    percentage: number
    summary: string
    strengths: string[]
    improvements: string[]
  }
  errors: ErrorItem[]
  strengths: string[]
  improvements: string[]
  suggestions: string[]
  originalText?: string
  analyzedAt: string
}

interface AnalyzeApiResponse {
  result: NormalizedAnalysisResult
  raw?: string
}

type UniversityTierProbability = "도전" | "적정" | "안정"

interface UniversityTierRecommendation {
  tier: string
  universities: string[]
  probability: UniversityTierProbability
}

interface UniversityPrediction {
  nationalPercentile: number
  academicLevel: string
  reachableUniversities: UniversityTierRecommendation[]
  strengthAnalysis: string
  improvementNeeded: string
  recommendations: string[]
}

interface UniversityApiResponse {
  result: UniversityPrediction
}

interface ProjectRecommendations {
  career: string
  bestProject: {
    title: string
    description: string
    reason: string
    difficulty: string
    duration: string
    benefits: string[]
  }
  projects: Array<{
    title: string
    description: string
    reason: string
    difficulty: string
    duration: string
    benefits: string[]
  }>
  tips: string[]
}

interface ProjectApiResponse {
  result: ProjectRecommendations
}

interface DetectApiResponse {
  result: AIKillerResult
}

function mapAnalysisToClient(payload: NormalizedAnalysisResult): AnalysisResult {
  const timestamp = payload.analyzedAt ?? new Date().toISOString()

  return {
    id: payload.id,
    studentName: "",
    studentProfile: payload.studentProfile ?? "",
    uploadDate: timestamp,
    overallScore: payload.overallScore,
    careerDirection: payload.careerDirection,
    careerAlignment: payload.careerAlignment,
    strengths: payload.strengths,
    improvements: payload.improvements,
    errors: payload.errors,
    suggestions: payload.suggestions,
    files: [],
    likes: 0,
    saves: 0,
    comments: [],
    userId: "",
    isPrivate: true,
    originalText: payload.originalText ?? "",
    analyzedAt: timestamp,
  }
}

export async function analyzeSaenggibu(
  text: string,
  careerDirection: string,
  onProgress?: (progress: number) => void,
): Promise<AnalysisResult> {
  if (!text || !text.trim()) {
    throw new Error("생기부 텍스트가 필요합니다.")
  }

  onProgress?.(10)

  const response = await postJson<AnalyzeApiResponse>(API_ROUTES.analyze, {
    text,
    careerDirection,
  })

  onProgress?.(60)

  const analysisResult = mapAnalysisToClient(response.result)

  onProgress?.(100)

  return analysisResult
}

/**
 * ------------------------------
 * University prediction fallback
 * ------------------------------
 */

const KOREAN_UNIVERSITY_DATA = {
  top_tier: [
    { name: "서울대학교", requiredPercentile: 1, majorStrengths: ["이공계", "인문", "사회과학"] },
    { name: "연세대학교", requiredPercentile: 2, majorStrengths: ["의학", "경영", "공학"] },
    { name: "고려대학교", requiredPercentile: 2, majorStrengths: ["법학", "경영", "미디어"] },
    { name: "KAIST", requiredPercentile: 1, majorStrengths: ["이공계", "과학기술"] },
    { name: "포항공대", requiredPercentile: 2, majorStrengths: ["공학", "이공계"] },
  ],
  high_tier: [
    { name: "성균관대학교", requiredPercentile: 6, majorStrengths: ["경영", "공학", "의학"] },
    { name: "한양대학교", requiredPercentile: 7, majorStrengths: ["공학", "건축", "디자인"] },
    { name: "서강대학교", requiredPercentile: 8, majorStrengths: ["경영", "경제", "인문"] },
    { name: "중앙대학교", requiredPercentile: 10, majorStrengths: ["예체능", "미디어", "경영"] },
    { name: "경희대학교", requiredPercentile: 12, majorStrengths: ["호텔경영", "국제학", "의학"] },
    { name: "한국외국어대학교", requiredPercentile: 13, majorStrengths: ["통번역", "국제학", "어문계"] },
    { name: "서울시립대학교", requiredPercentile: 14, majorStrengths: ["도시공학", "세무학", "공학"] },
  ],
  mid_high_tier: [
    { name: "건국대학교", requiredPercentile: 18, majorStrengths: ["부동산", "수의학", "경영"] },
    { name: "동국대학교", requiredPercentile: 20, majorStrengths: ["경찰행정", "연극영화", "불교학"] },
    { name: "홍익대학교", requiredPercentile: 22, majorStrengths: ["미술", "디자인", "건축"] },
    { name: "숙명여자대학교", requiredPercentile: 23, majorStrengths: ["약학", "경영", "한국어문"] },
    { name: "국민대학교", requiredPercentile: 25, majorStrengths: ["자동차", "테크노디자인", "경영"] },
    { name: "숭실대학교", requiredPercentile: 27, majorStrengths: ["컴퓨터", "전자공학", "경영"] },
    { name: "세종대학교", requiredPercentile: 28, majorStrengths: ["호텔관광", "애니메이션", "우주항공"] },
  ],
  mid_tier: [
    { name: "단국대학교", requiredPercentile: 32, majorStrengths: ["공학", "예체능", "교육"] },
    { name: "광운대학교", requiredPercentile: 35, majorStrengths: ["전자공학", "컴퓨터", "정보통신"] },
    { name: "명지대학교", requiredPercentile: 38, majorStrengths: ["건축", "기계", "디자인"] },
    { name: "상명대학교", requiredPercentile: 40, majorStrengths: ["디자인", "문화예술", "교육"] },
    { name: "가천대학교", requiredPercentile: 42, majorStrengths: ["의학", "간호", "약학"] },
    { name: "아주대학교", requiredPercentile: 35, majorStrengths: ["의학", "공학", "약학"] },
    { name: "인하대학교", requiredPercentile: 36, majorStrengths: ["물류", "항공우주", "공학"] },
  ],
  regional_national: [
    { name: "부산대학교", requiredPercentile: 22, majorStrengths: ["공학", "의학", "경영"] },
    { name: "경북대학교", requiredPercentile: 24, majorStrengths: ["의학", "공학", "자연과학"] },
    { name: "전남대학교", requiredPercentile: 28, majorStrengths: ["의학", "수의학", "공학"] },
    { name: "전북대학교", requiredPercentile: 30, majorStrengths: ["법학", "공학", "농업"] },
    { name: "충남대학교", requiredPercentile: 26, majorStrengths: ["공학", "자연과학", "인문"] },
    { name: "충북대학교", requiredPercentile: 32, majorStrengths: ["공학", "자연과학", "의학"] },
    { name: "강원대학교", requiredPercentile: 35, majorStrengths: ["산림", "수의학", "공학"] },
  ],
} as const

type UniversityDatasetKey = keyof typeof KOREAN_UNIVERSITY_DATA

type UniversityDatasetItem = (typeof KOREAN_UNIVERSITY_DATA)[UniversityDatasetKey][number]

function calculateNationalPercentile(overallScore: number): number {
  const score = Math.max(0, Math.min(100, overallScore))

  if (score >= 95) {
    return Math.max(1, Math.round((100 - score) * 0.5))
  }
  if (score >= 85) {
    return Math.round(5 + (95 - score))
  }
  if (score >= 75) {
    return Math.round(15 + (85 - score) * 1.5)
  }
  if (score >= 65) {
    return Math.round(30 + (75 - score) * 2)
  }
  return Math.round(50 + (65 - score) * 1.5)
}

function getAcademicLevel(percentile: number): string {
  if (percentile <= 5) return "최상위권"
  if (percentile <= 15) return "상위권"
  if (percentile <= 30) return "중상위권"
  if (percentile <= 50) return "중위권"
  return "중하위권"
}

function getReachableUniversities(percentile: number): UniversityTierRecommendation[] {
  const results: UniversityTierRecommendation[] = []

  const pickUniversities = (
    dataset: UniversityDatasetItem[],
    tierName: string,
    predicate: (item: UniversityDatasetItem) => boolean,
    probability: UniversityTierProbability,
  ) => {
    const items = dataset.filter(predicate).slice(0, 3).map((item) => item.name)
    if (items.length > 0) {
      results.push({ tier: tierName, universities: items, probability })
    }
  }

  if (percentile <= 15) {
    pickUniversities(KOREAN_UNIVERSITY_DATA.top_tier, "최상위권 (SKY/특수대학)", (item) => item.requiredPercentile >= percentile * 0.5, "도전")
  }

  if (percentile <= 25) {
    pickUniversities(
      KOREAN_UNIVERSITY_DATA.high_tier,
      "상위권 대학",
      (item) => Math.abs(item.requiredPercentile - percentile) <= 8,
      percentile <= 15 ? "적정" : "도전",
    )
  }

  if (percentile <= 40) {
    pickUniversities(
      KOREAN_UNIVERSITY_DATA.mid_high_tier,
      "중상위권 대학",
      (item) => Math.abs(item.requiredPercentile - percentile) <= 10,
      percentile <= 25 ? "적정" : "도전",
    )
  }

  if (percentile <= 55) {
    pickUniversities(
      KOREAN_UNIVERSITY_DATA.mid_tier,
      "중위권 대학",
      (item) => Math.abs(item.requiredPercentile - percentile) <= 12,
      percentile <= 40 ? "적정" : "도전",
    )
  }

  if (percentile <= 45) {
    pickUniversities(
      KOREAN_UNIVERSITY_DATA.regional_national,
      "지방 거점 국립대",
      (item) => Math.abs(item.requiredPercentile - percentile) <= 15,
      "적정",
    )
  }

  return results.slice(0, 4)
}

function buildUniversityFallback(analysisResult: AnalysisResult, careerDirection: string): UniversityPrediction {
  const percentile = calculateNationalPercentile(analysisResult.overallScore)
  const academicLevel = getAcademicLevel(percentile)
  const reachableUniversities = getReachableUniversities(percentile)

  const strengthsSummary = analysisResult.strengths.slice(0, 2).join(" • ") || "생기부가 전반적으로 잘 작성되었습니다"
  const improvementsSummary = analysisResult.improvements.slice(0, 2).join(" • ") || "지속적인 개선이 필요합니다"

  return {
    nationalPercentile: percentile,
    academicLevel,
    reachableUniversities,
    strengthAnalysis: `${careerDirection || "진로 미지정"} 방향에서 돋보이는 강점: ${strengthsSummary}`,
    improvementNeeded: `보완이 필요한 부분: ${improvementsSummary}`,
    recommendations: [
      "학교 생활기록부의 강점을 지속적으로 강화하세요.",
      "진로 적합성을 높일 수 있는 심화 활동을 추가하세요.",
      "구체적인 활동 사례와 성과를 기록해보세요.",
    ],
  }
}

export async function predictUniversity(analysisResult: AnalysisResult, careerDirection: string): Promise<UniversityPrediction> {
  try {
    const response = await postJson<UniversityApiResponse>(API_ROUTES.university, {
      analysisResult,
      careerDirection,
    })

    return response.result
  } catch (error) {
    console.error("[University Prediction] Falling back due to error", error)
    return buildUniversityFallback(analysisResult, careerDirection)
  }
}

/**
 * ------------------------------
 * Project recommendation fallback
 * ------------------------------
 */

function buildProjectFallback(analysisResult: AnalysisResult, careerDirection: string): ProjectRecommendations {
  const strengths = analysisResult.strengths.slice(0, 3)
  const improvements = analysisResult.improvements.slice(0, 3)

  return {
    career: careerDirection || "생기부 내용 기반 분석",
    bestProject: {
      title: "맞춤형 자율 과제",
      description: strengths.length > 0 ? strengths[0] : "학생의 진로와 관심사에 맞는 프로젝트",
      reason: "학생의 역량을 극대화할 수 있는 과제",
      difficulty: "중상",
      duration: "2-3개월",
      benefits: ["전공 역량 강화", "실전 경험 축적", "생기부 보강"],
    },
    projects: [
      {
        title: "진로 연계 심화 탐구",
        description: strengths[1] || "관심 분야의 심화 학습 및 연구",
        reason: "진로 적합성을 강화할 활동",
        difficulty: "중상",
        duration: "3개월",
        benefits: ["전문성 향상", "탐구 역량 강화"],
      },
      {
        title: "독서 기반 학습 확장",
        description: improvements[0] || "전공 관련 도서 분석 및 정리",
        reason: "비판적 사고력과 표현력 배양",
        difficulty: "중",
        duration: "1-2개월",
        benefits: ["분석력 강화", "표현력 향상"],
      },
    ],
    tips: [
      "프로젝트는 구체적인 결과물을 남겨야 합니다.",
      "진로와의 연계성을 명확히 하세요.",
      "과정을 꼼꼼히 기록하세요.",
    ],
  }
}

export async function recommendProjects(analysisResult: AnalysisResult, careerDirection: string): Promise<ProjectRecommendations> {
  try {
    const response = await postJson<ProjectApiResponse>(API_ROUTES.projects, {
      analysisResult,
      careerDirection,
    })

    return response.result
  } catch (error) {
    console.error("[Project Recommendation] Falling back due to error", error)
    return buildProjectFallback(analysisResult, careerDirection)
  }
}

/**
 * ------------------------------
 * AI writing detection fallback
 * ------------------------------
 */

function buildDetectionFallback(errorMessage?: string): AIKillerResult {
  return {
    overallAIProbability: 0,
    riskAssessment: "안전",
    detectedSections: [],
    recommendations: [
      "AI 작성 탐지를 완료할 수 없습니다.",
      "원본 생기부 텍스트를 확인한 후 다시 시도하세요.",
      errorMessage ?? "추가 정보를 확인해주세요.",
    ],
  }
}

export async function detectAIWriting(text: string): Promise<AIKillerResult> {
  if (!text || !text.trim()) {
    return buildDetectionFallback("분석할 텍스트가 없습니다.")
  }

  try {
    const response = await postJson<DetectApiResponse>(API_ROUTES.detect, { text })
    return response.result
  } catch (error) {
    console.error("[AI Detection] Falling back due to error", error)
    const message = error instanceof Error ? error.message : undefined
    return buildDetectionFallback(message)
  }
}
