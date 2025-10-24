// LangChain API 통합
const LANGCHAIN_API_KEY = "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"

export interface LangChainTool {
  id: string
  name: string
  description: string
  category: string
  version: string
}

export async function searchLangChainTools(query: string): Promise<LangChainTool[]> {
  try {
    // LangChain Hub API 시뮬레이션
    // 실제로는 LangChain Hub API를 호출해야 함
    console.log("[v0] Searching LangChain tools with API key:", LANGCHAIN_API_KEY.slice(0, 20) + "...")

    // 폴백: 일반적인 LangChain 도구 목록
    const commonTools: LangChainTool[] = [
      {
        id: "python-repl",
        name: "Python REPL",
        description: "Python 코드 실행 도구",
        category: "code-execution",
        version: "1.0.0",
      },
      {
        id: "web-search",
        name: "Web Search",
        description: "웹 검색 및 스크레이핑",
        category: "data-collection",
        version: "1.0.0",
      },
      {
        id: "pandas",
        name: "Pandas",
        description: "데이터 분석 및 처리",
        category: "data-analysis",
        version: "2.0.0",
      },
      {
        id: "numpy",
        name: "NumPy",
        description: "수치 계산 라이브러리",
        category: "computation",
        version: "1.26.0",
      },
      {
        id: "matplotlib",
        name: "Matplotlib",
        description: "데이터 시각화",
        category: "visualization",
        version: "3.8.0",
      },
      {
        id: "torch",
        name: "PyTorch",
        description: "머신러닝 프레임워크",
        category: "machine-learning",
        version: "2.1.0",
      },
    ]

    return commonTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query.toLowerCase()) ||
        tool.description.toLowerCase().includes(query.toLowerCase()),
    )
  } catch (error) {
    console.error("[v0] LangChain search error:", error)
    return []
  }
}
