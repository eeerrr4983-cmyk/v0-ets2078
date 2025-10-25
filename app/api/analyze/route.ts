import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { randomUUID } from "crypto"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"

export const maxDuration = 60

interface GeminiCandidatePart {
  text?: string
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiCandidatePart[]
  }
}

interface GeminiResponse {
  candidates?: GeminiCandidate[]
  error?: { message?: string }
}

interface GeminiAnalysis {
  overallScore?: number
  studentProfile?: string
  careerAlignment?: {
    percentage?: number
    summary?: string
    strengths?: string[]
    improvements?: string[]
  }
  errors?: Array<{
    type?: string
    content?: string
    reason?: string
    page?: number
    suggestion?: string
  }>
  strengths?: string[]
  improvements?: string[]
  suggestions?: string[]
}

interface AnalysisError {
  type: "금지" | "주의"
  content: string
  reason: string
  page: number
  suggestion?: string
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
  errors: AnalysisError[]
  strengths: string[]
  improvements: string[]
  suggestions: string[]
  originalText: string
  analyzedAt: string
}

type AnalysisRequestBody = {
  text?: string
  careerDirection?: string
}

const GUIDELINE_2025 = `
### 2025 학교생활기록부 세부능력 및 특기사항 전수검토 가이드라인

당신은 2025학년도 교육부 훈령 제530호를 완벽히 숙지한 생기부 전문 검토 AI입니다.

#### 절대 금지 사항 (발견 시 즉시 지적):
1. **대학명**: 서울대, 연세대, 고려대, KAIST 등 모든 대학/전문대/대학원 명칭 및 변형 표현
2. **기관명**: 교육관련기관 외 모든 기관/단체/회사/재단/협회/학회/연구소 (예외: 교육부, 시도교육청만 허용)
3. **상호명**: 학원, 출판사, 기업, 앱, 플랫폼 (예: △△학원, EBS, 메가스터디)
4. **강사/인물명**: 특정인 실명 (예: ○○ 강사, △△ 교수)
5. **공인어학시험**: TOEIC, TOEFL, HSK, JLPT, IELTS, OPIc 등 모든 시험명 및 점수/급수
6. **인증시험**: 컴퓨터활용능력, 한자급수, 바리스타 등 모든 인증 및 급수
7. **모의고사 성적**: 등급, 백분위, 표준점수 등 모든 정량 지표
8. **대회 용어**: 교외대회 참가/수상, '대회' 단어 사용 자체 금지
9. **교외상/교외대회**: 학교 밖 모든 시상, 대회, 경연, 올림피아드
10. **온라인 플랫폼**: K-MOOC, MOOC, Coursera, edX, 유튜브 강의
11. **특허/논문/출판**: 특허출원, 논문게재, 도서출간, 저작권 등록
12. **사교육 유발 요소**: 장학금, 교외 멘토링, 캠프/워크숍, 해외연수

#### 주의 사항 (개선 권고):
1. **정량성적 오기재**: 점수, 등급, 석차 등 숫자 지표 (성적 미산출 과목 제외)
2. **단순 나열**: "~했다", "~참여함" 반복만으로 구체적 관찰 근거 없음
3. **모호한 칭찬**: "성실하고 적극적", "열심히 함" 등 근거 부족 표현
4. **미래 전망 추측**: "~할 것으로 예상", "~에 적합할 것" 등 추정성 문구
5. **교과 무관 내용**: 해당 교과 성취기준과 무관한 일반적 태도 서술
6. **인용문 내부 금지**: 도서 인용 시 출판사명, 저자명 포함 금지
`

function createAnalysisPrompt(text: string, careerDirection: string): string {
  return `${GUIDELINE_2025}

#### 분석 대상:
**학생 진로 방향**: ${careerDirection || "미지정"}

**생기부 텍스트**:
\`\`\`
${text}
\`\`\`

#### 분석 요청사항:
위 가이드라인을 철저히 적용하여 생기부 텍스트를 정밀 분석하고, 다음 JSON 형식으로 응답하세요:

\`\`\`json
{
  "overallScore": 0-100 사이의 점수 (금지사항 발견 시 대폭 감점),
  "studentProfile": "학생의 전문성과 특징을 한 문장으로 요약 (진로 연계)",
  "careerAlignment": {
    "percentage": 0-100,
    "summary": "진로 방향과의 연계성 평가 (2-3문장)"
  },
  "errors": [
    {
      "type": "금지" 또는 "주의",
      "content": "문제가 되는 원문을 정확히 인용",
      "reason": "위반 사유를 구체적으로 설명 (가이드라인 항목 번호 명시)",
      "page": 페이지 번호 (알 수 없으면 1),
      "suggestion": "구체적이고 실행 가능한 수정 방안 제시"
    }
  ],
  "strengths": [
    "발견된 강점을 구체적으로 설명 (진로 연계, 활동의 심화성, 지속성 등)",
    "최소 3개, 각각 1-2문장으로 상세 작성"
  ],
  "improvements": [
    "개선이 필요한 부분을 구체적으로 설명",
    "최소 3개, 각각 1-2문장으로 상세 작성"
  ],
  "suggestions": [
    "실행 가능한 구체적 개선 제안 (예: 진로 연계 활동 추가, 독서 심화 등)",
    "최소 3개"
  ]
}
\`\`\`

**중요**:
- errors 배열은 실제로 발견된 금지/주의 사항만 포함
- 금지사항 1개 발견 시 overallScore에서 -15점, 주의사항 1개당 -5점
- 모든 항목은 한국어로 명확하고 구체적으로 작성
- JSON 형식을 정확히 준수 (중괄호, 따옴표, 쉼표 확인)`
}

function extractGeneratedText(payload: GeminiResponse): string {
  return payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ""
}

function extractJsonBlock(text: string): string | null {
  const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
  if (codeBlockMatch) {
    return codeBlockMatch[1]
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return jsonMatch[0]
  }

  return null
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return fallback
}

function toArrayOfStrings(value: unknown, minFallback?: string[]): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0)
  }
  return minFallback ?? []
}

function normalizeErrors(value: GeminiAnalysis["errors"]): AnalysisError[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => ({
      type: typeof item?.type === "string" && item.type.includes("금지") ? "금지" : "주의",
      content: typeof item?.content === "string" ? item.content.trim() : "",
      reason: typeof item?.reason === "string" ? item.reason.trim() : "",
      page:
        typeof item?.page === "number" && Number.isFinite(item.page) && item.page > 0
          ? Math.floor(item.page)
          : 1,
      suggestion: typeof item?.suggestion === "string" ? item.suggestion.trim() : undefined,
    }))
    .filter((item) => item.content.length > 0 || item.reason.length > 0)
}

function normalizeAnalysis(
  raw: GeminiAnalysis,
  careerDirection: string,
  originalText: string,
): NormalizedAnalysisResult {
  const overallScore = Math.max(0, Math.min(100, toNumber(raw.overallScore, 75)))

  const careerAlignment = raw.careerAlignment
    ? {
        percentage: Math.max(0, Math.min(100, toNumber(raw.careerAlignment.percentage, 50))),
        summary: typeof raw.careerAlignment.summary === "string" ? raw.careerAlignment.summary.trim() : "",
        strengths: toArrayOfStrings(raw.careerAlignment.strengths),
        improvements: toArrayOfStrings(raw.careerAlignment.improvements),
      }
    : undefined

  const normalized: NormalizedAnalysisResult = {
    id: randomUUID(),
    overallScore,
    studentProfile: typeof raw.studentProfile === "string" ? raw.studentProfile.trim() : "",
    careerDirection: careerDirection || "미지정",
    careerAlignment,
    errors: normalizeErrors(raw.errors),
    strengths: toArrayOfStrings(raw.strengths, ["생기부가 전반적으로 잘 작성되었습니다"]),
    improvements: toArrayOfStrings(raw.improvements, ["지속적인 개선이 필요합니다"]),
    suggestions: toArrayOfStrings(raw.suggestions, ["구체적인 사례를 더 추가하면 좋습니다"]),
    originalText,
    analyzedAt: new Date().toISOString(),
  }

  if (normalized.strengths.length === 0) {
    normalized.strengths = ["생기부가 전반적으로 잘 작성되었습니다"]
  }

  if (normalized.improvements.length === 0) {
    normalized.improvements = ["지속적인 개선이 필요합니다"]
  }

  if (normalized.suggestions.length === 0) {
    normalized.suggestions = ["구체적인 사례를 더 추가하면 좋습니다"]
  }

  return normalized
}

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      console.error("[Analyze] Missing GEMINI_API_KEY environment variable")
      return NextResponse.json(
        { error: "서버에 Gemini API 키가 설정되지 않았습니다." },
        { status: 500 },
      )
    }

    const { text, careerDirection }: AnalysisRequestBody = await request.json()

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "분석할 생기부 텍스트가 필요합니다." },
        { status: 400 },
      )
    }

    const prompt = createAnalysisPrompt(text, careerDirection ?? "")

    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE",
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Analyze] Gemini API error", response.status, errorText)
      return NextResponse.json(
        { error: "Gemini API 호출에 실패했습니다.", details: errorText },
        { status: 502 },
      )
    }

    const payload = (await response.json()) as GeminiResponse
    const generatedText = extractGeneratedText(payload)

    if (!generatedText) {
      console.error("[Analyze] Gemini 응답에 텍스트가 없습니다.", payload)
      return NextResponse.json(
        { error: "AI 응답에서 결과를 찾을 수 없습니다." },
        { status: 502 },
      )
    }

    const jsonBlock = extractJsonBlock(generatedText)

    if (!jsonBlock) {
      console.error("[Analyze] Gemini 응답에서 JSON 블록을 찾을 수 없습니다.", generatedText)
      return NextResponse.json(
        { error: "AI 응답을 JSON으로 파싱할 수 없습니다.", raw: generatedText },
        { status: 502 },
      )
    }

    let parsed: GeminiAnalysis

    try {
      parsed = JSON.parse(jsonBlock) as GeminiAnalysis
    } catch (error) {
      console.error("[Analyze] JSON 파싱 오류", error, jsonBlock)
      return NextResponse.json(
        { error: "AI 응답을 JSON으로 파싱하는 중 오류가 발생했습니다.", raw: jsonBlock },
        { status: 502 },
      )
    }

    const normalized = normalizeAnalysis(parsed, careerDirection ?? "", text)

    return NextResponse.json({ result: normalized, raw: generatedText })
  } catch (error) {
    console.error("[Analyze] Unexpected error", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "생기부 분석 중 알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 },
    )
  }
}
