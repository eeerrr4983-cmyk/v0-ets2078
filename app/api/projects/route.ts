import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"

export const maxDuration = 60

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

interface ProjectItem {
  title: string
  description: string
  reason: string
  difficulty: string
  duration: string
  benefits: string[]
}

interface ProjectRecommendations {
  career: string
  bestProject: ProjectItem
  projects: ProjectItem[]
  tips: string[]
}

function createProjectPrompt(analysisResult: any, careerDirection: string): string {
  return `당신은 한국 고등학생을 위한 자율 과제 추천 전문가입니다. 학생의 생기부 분석 결과를 바탕으로 맞춤형 프로젝트를 추천하세요.

### 학생 정보:
**진로 방향**: ${careerDirection || "미지정"}
**생기부 종합 점수**: ${analysisResult.overallScore}/100
**학생 프로필**: ${analysisResult.studentProfile || "정보 없음"}
**주요 강점**: ${analysisResult.strengths?.slice(0, 3).join(" • ") || "정보 없음"}
**개선 필요 사항**: ${analysisResult.improvements?.slice(0, 3).join(" • ") || "정보 없음"}

### 추천 요청:
학생의 진로와 역량에 맞는 자율 과제를 추천하고, 다음 JSON 형식으로 응답하세요:

\`\`\`json
{
  "career": "진로 분야 요약",
  "bestProject": {
    "title": "가장 추천하는 프로젝트 제목",
    "description": "프로젝트 상세 설명 (2-3문장)",
    "reason": "이 프로젝트를 추천하는 이유 (학생의 강점과 연계)",
    "difficulty": "하", "중", "중상", "상" 중 하나,
    "duration": "예상 소요 기간 (예: 1-2개월)",
    "benefits": [
      "기대 효과 1",
      "기대 효과 2",
      "기대 효과 3"
    ]
  },
  "projects": [
    {
      "title": "추가 프로젝트 1",
      "description": "프로젝트 설명",
      "reason": "추천 이유",
      "difficulty": "난이도",
      "duration": "소요 기간",
      "benefits": ["효과1", "효과2"]
    },
    {
      "title": "추가 프로젝트 2",
      "description": "프로젝트 설명",
      "reason": "추천 이유",
      "difficulty": "난이도",
      "duration": "소요 기간",
      "benefits": ["효과1", "효과2"]
    },
    {
      "title": "추가 프로젝트 3",
      "description": "프로젝트 설명",
      "reason": "추천 이유",
      "difficulty": "난이도",
      "duration": "소요 기간",
      "benefits": ["효과1", "효과2"]
    }
  ],
  "tips": [
    "프로젝트 수행 시 실용적 조언 1",
    "프로젝트 수행 시 실용적 조언 2",
    "프로젝트 수행 시 실용적 조언 3"
  ]
}
\`\`\`

**중요 지침**:
- 프로젝트는 고등학생이 학교에서 실제로 수행 가능해야 함
- 진로와의 명확한 연계성 제시
- 구체적이고 실행 가능한 프로젝트 제안
- 교과 활동 또는 창의적 체험활동으로 기록 가능한 내용
- 교외 대회, 사교육 관련 내용 절대 포함 금지
- 모든 텍스트는 한국어로 명확하고 구체적으로 작성
- JSON 형식을 정확히 준수`
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

function buildFallbackProjects(analysisResult: any, careerDirection: string): ProjectRecommendations {
  const career = careerDirection || "생기부 내용 기반 분석"
  const strength1 = analysisResult.strengths?.[0] || "학생의 역량"
  const strength2 = analysisResult.strengths?.[1] || "관심 분야"
  const improvement = analysisResult.improvements?.[0] || "추가 개선 필요 사항"

  return {
    career,
    bestProject: {
      title: `${career} 관련 심화 탐구 프로젝트`,
      description: `${strength1}을 활용하여 ${career} 분야의 주제를 선정하고, 2-3개월간 심도 있는 탐구를 진행합니다. 탐구 결과를 보고서로 작성하고 발표회를 통해 공유합니다.`,
      reason: `학생의 강점인 ${strength1}과 진로 방향이 잘 맞아떨어지며, 심화 탐구를 통해 전문성을 더욱 강화할 수 있습니다.`,
      difficulty: "중상",
      duration: "2-3개월",
      benefits: [
        "진로 관련 전문 지식 습득",
        "탐구 역량 및 문제 해결 능력 향상",
        "생기부 세특 기재 우수 소재 확보"
      ]
    },
    projects: [
      {
        title: "교과 연계 실험/실습 프로젝트",
        description: `${strength2}를 바탕으로 교과 내용과 연계된 실험 또는 실습 활동을 설계하고 수행합니다.`,
        reason: "이론과 실제를 결합하여 교과 이해도를 높이고 실전 역량을 기를 수 있습니다.",
        difficulty: "중",
        duration: "1-2개월",
        benefits: ["실험/실습 능력 강화", "교과 연계성 확보"]
      },
      {
        title: "독서 기반 비평 프로젝트",
        description: `${career} 관련 전문 도서 3-5권을 읽고 비평문을 작성하며, 주제별로 심화 분석을 수행합니다.`,
        reason: "비판적 사고력과 학문적 표현력을 동시에 기를 수 있는 효과적인 활동입니다.",
        difficulty: "중",
        duration: "2개월",
        benefits: ["비판적 사고력 향상", "독서 활동 심화"]
      },
      {
        title: "교내 봉사/멘토링 활동",
        description: `${improvement}를 보완하기 위해 후배 또는 동급생 대상 학습 멘토링이나 봉사 활동을 기획하고 운영합니다.`,
        reason: "리더십과 공동체 의식을 함양하며, 자신의 부족한 부분을 보완하는 계기가 됩니다.",
        difficulty: "중",
        duration: "1-2개월",
        benefits: ["리더십 개발", "공동체 의식 강화"]
      }
    ],
    tips: [
      "프로젝트는 구체적인 결과물(보고서, 발표 자료, 포트폴리오 등)을 남겨야 합니다.",
      "진로와의 연계성을 명확히 하고, 교과 선생님의 지도를 받으세요.",
      "과정을 꼼꼼히 기록하여 생기부 세특 기재에 활용하세요.",
      "혼자보다는 동급생과 협업하면 더 풍부한 결과를 얻을 수 있습니다."
    ]
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      console.error("[Projects] Missing GEMINI_API_KEY")
      return NextResponse.json({ error: "서버에 Gemini API 키가 설정되지 않았습니다." }, { status: 500 })
    }

    const { analysisResult, careerDirection } = await request.json()

    if (!analysisResult) {
      return NextResponse.json({ error: "분석 결과가 필요합니다." }, { status: 400 })
    }

    const prompt = createProjectPrompt(analysisResult, careerDirection || "")

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
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      }),
    })

    if (!response.ok) {
      console.error("[Projects] Gemini API error", response.status)
      return NextResponse.json(
        { result: buildFallbackProjects(analysisResult, careerDirection) },
        { status: 200 }
      )
    }

    const payload = (await response.json()) as GeminiResponse
    const generatedText = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ""

    if (!generatedText) {
      return NextResponse.json(
        { result: buildFallbackProjects(analysisResult, careerDirection) },
        { status: 200 }
      )
    }

    const jsonBlock = extractJsonBlock(generatedText)

    if (!jsonBlock) {
      return NextResponse.json(
        { result: buildFallbackProjects(analysisResult, careerDirection) },
        { status: 200 }
      )
    }

    try {
      const parsed = JSON.parse(jsonBlock) as ProjectRecommendations
      return NextResponse.json({ result: parsed })
    } catch (parseError) {
      console.error("[Projects] JSON parse error", parseError)
      return NextResponse.json(
        { result: buildFallbackProjects(analysisResult, careerDirection) },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error("[Projects] Unexpected error", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "프로젝트 추천 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
