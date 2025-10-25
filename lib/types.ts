// 헌트파이어 타입 정의
export interface Agent {
  id: string
  name: string // 간소화된 이름 (예: "마트종업원 에이전트")
  goal: string // 사용자 원본 요청
  description: string // 에이전트가 수행하는 작업 설명
  tools: string[]
  createdAt: string
  likes: number
  saves: number
  comments: Comment[]
  userId: string // 생성자 ID
  isPrivate?: boolean // 비공개 여부 추가
}

export interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: string
  replies: Reply[]
  likes: number
}

export interface Reply {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: string
  likes: number
}

export interface UserInteraction {
  likedAgents: Set<string>
  savedAgents: Set<string>
  likedComments: Set<string>
}

export interface AnalysisResult {
  id: string
  studentName: string
  uploadDate: string
  overallScore: number
  careerDirection?: string // Add career direction field
  careerAlignment?: CareerAlignment // Add career alignment analysis
  strengths: string[]
  improvements: string[]
  errors: ErrorItem[]
  suggestions: string[]
  files: string[]
  likes: number
  saves: number
  comments: Comment[]
  userId: string
  isPrivate?: boolean
  aiKillerResult?: AIKillerResult
}

export interface CareerAlignment {
  percentage: number // 0-100
  summary: string
  strengths: string[]
  improvements: string[]
}

export interface ErrorItem {
  type: "금지" | "주의"
  content: string
  reason: string
  page: number
  suggestion?: string
}

export interface AIKillerResult {
  overallAIProbability: number // 전체 AI 사용 확률 (0-100)
  detectedSections: AIDetectedSection[]
  riskAssessment: RiskLevel
  recommendations: string[]
}

export interface AIDetectedSection {
  content: string
  aiProbability: number // 해당 섹션의 AI 확률 (0-100)
  lineNumber: number
  reason: string
  humanWritingIndicators: string[]
  aiWritingIndicators: string[]
}

export type RiskLevel = "안전" | "주의" | "위험" | "매우위험"
