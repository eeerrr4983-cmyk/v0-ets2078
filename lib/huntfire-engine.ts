import { chatWithGemini, huntToolsWithGemini, type GeminiHuntResult, generateNaturalAgentName } from "./api/gemini"
import { searchLangChainTools } from "./api/langchain"

export interface AgentCreationResult {
  agentName: string
  specification: string
  huntResult: GeminiHuntResult
  selectedTools: string[]
  status: "hunting" | "transforming" | "complete"
}

export class HuntfireEngine {
  // Phase 1: Hunt (Gemini Scout)
  static async hunt(goal: string, onProgress?: (phase: string) => void): Promise<AgentCreationResult> {
    console.log("[v0] Starting Huntfire Engine...")

    onProgress?.("hunting")
    console.log("[v0] Gemini analyzing goal...")

    const agentName = await generateNaturalAgentName(goal)
    const specification = goal

    console.log("[v0] Gemini hunting tools...")
    const huntResult = await huntToolsWithGemini(specification, ["Python REPL", "Web Search", "Data Analysis"])

    console.log("[v0] Searching LangChain repository...")
    await searchLangChainTools(specification)

    return {
      agentName,
      specification,
      huntResult,
      selectedTools: huntResult.tools.map((t) => t.name),
      status: "hunting",
    }
  }

  // Phase 2: Transform (Claude Integration)
  static async transform(
    result: AgentCreationResult,
    onProgress?: (phase: string) => void,
  ): Promise<AgentCreationResult> {
    onProgress?.("transforming")
    console.log("[v0] Transforming agent...")

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const selectedTools = result.huntResult.tools
      .sort((a, b) => b.reliability - a.reliability)
      .slice(0, 5)
      .map((t) => t.name)

    return {
      ...result,
      selectedTools,
      status: "transforming",
    }
  }

  // Phase 3: Complete
  static async complete(
    result: AgentCreationResult,
    onProgress?: (phase: string) => void,
  ): Promise<AgentCreationResult> {
    onProgress?.("complete")
    console.log("[v0] Agent transformation complete!")

    return {
      ...result,
      status: "complete",
    }
  }

  static async createAgent(goal: string, onProgress?: (phase: string) => void): Promise<AgentCreationResult> {
    let result = await this.hunt(goal, onProgress)
    result = await this.transform(result, onProgress)
    result = await this.complete(result, onProgress)
    return result
  }

  static async sendMessage(messages: Array<{ role: string; content: string }>): Promise<string> {
    return await chatWithGemini(messages)
  }
}
