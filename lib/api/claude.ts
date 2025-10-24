export interface ClaudeMessage {
  role: "user" | "assistant"
  content: string
}

export async function sendToClaudeAgent(messages: ClaudeMessage[]): Promise<string> {
  try {
    const response = await fetch("/api/claude", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        task: "chat",
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.text || "응답을 생성할 수 없습니다."
  } catch (error) {
    console.error("[v0] Claude API error:", error)
    throw error
  }
}

export async function generateNaturalAgentName(goal: string): Promise<string> {
  try {
    const response = await fetch("/api/claude", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `다음 목표를 보고 자연스럽고 간략한 에이전트 이름을 생성해주세요. 핵심 역할만 포함하고, "에이전트"라는 단어는 제외하세요.

목표: ${goal}

예시:
- "마트종업원을 대신해서 시식코너를 운영해줘" → "마트종업원"
- "청소하는 청소부직원" → "청소부"
- "정신질환전문 상담사가 되어줘" → "정신과상담사"

간략한 이름만 응답해주세요 (2-5글자):`,
          },
        ],
        task: "name",
      }),
    })

    if (!response.ok) {
      throw new Error("Name generation failed")
    }

    const data = await response.json()
    const name = data.text.trim().replace(/["']/g, "").slice(0, 15)
    return name || goal.slice(0, 10)
  } catch (error) {
    console.error("[v0] Name generation error:", error)
    return goal.slice(0, 10)
  }
}

export async function generateTaskDescription(goal: string, agentName: string): Promise<string> {
  try {
    const response = await fetch("/api/claude", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `다음 목표를 보고 에이전트가 어떻게 작업을 수행하는지 간략하게 2-3줄로 설명해주세요.

목표: ${goal}
에이전트 이름: ${agentName}

간략한 설명만 응답해주세요:`,
          },
        ],
        task: "description",
      }),
    })

    if (!response.ok) {
      throw new Error("Description generation failed")
    }

    const data = await response.json()
    return data.text.trim().slice(0, 100) + "."
  } catch (error) {
    console.error("[v0] Description generation error:", error)
    return `${goal.slice(0, 50)}... 작업을 수행합니다.`
  }
}

export async function analyzeGoalWithClaude(goal: string): Promise<{
  agentName: string
  requiredTools: string[]
  specification: string
}> {
  try {
    const agentName = await generateNaturalAgentName(goal)

    const response = await fetch("/api/claude", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `다음 목표를 분석하여 필요한 도구 명세서를 작성해주세요:

목표: ${goal}
에이전트 이름: ${agentName}

다음 형식으로 JSON 응답을 제공해주세요:
{
  "agentName": "에이전트 이름",
  "requiredTools": ["도구1", "도구2", "도구3"],
  "specification": "상세 명세서"
}`,
          },
        ],
        task: "chat",
      }),
    })

    if (!response.ok) {
      throw new Error("Analysis failed")
    }

    const data = await response.json()
    const jsonMatch = data.text.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return {
      agentName: agentName,
      requiredTools: ["Python REPL", "Web Search", "Data Analysis"],
      specification: goal,
    }
  } catch (error) {
    console.error("[v0] Claude analysis error:", error)
    const fallbackName = await generateNaturalAgentName(goal).catch(() => goal.slice(0, 10))
    return {
      agentName: fallbackName,
      requiredTools: ["Python REPL", "Web Search", "Data Analysis"],
      specification: goal,
    }
  }
}
