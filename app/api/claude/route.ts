import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { messages, task } = await request.json()

    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4-20250514",
      messages: messages,
      system: getSystemPrompt(task),
      maxTokens: 1024,
    })

    return NextResponse.json({ text })
  } catch (error) {
    console.error("[v0] Claude API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

function getSystemPrompt(task: string): string {
  switch (task) {
    case "name":
      return "당신은 간결하고 자연스러운 에이전트 이름을 생성하는 전문가입니다. 핵심 역할만 포함하고 2-5글자로 응답하세요. 예: '청소부', '상담사', 'CEO'"
    case "description":
      return "당신은 에이전트의 작업을 간략하게 설명하는 전문가입니다. 2-3줄로 명확하게 설명하세요."
    case "greeting":
      return "당신은 에이전트의 첫 인사말을 생성하는 전문가입니다. '저의 새로운 모습인 [역할]이 되어 지금부터 당신의 작업을 대신 수행하겠습니다.' 형식으로 응답하세요."
    case "chat":
      return "당신은 헌트파이어(Huntfire) 슈퍼 에이전트입니다. 사용자의 요청을 분석하고 최적의 도구를 통합하여 특화된 작업을 수행합니다."
    default:
      return "당신은 도움이 되는 AI 어시스턴트입니다."
  }
}
