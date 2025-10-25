import { type NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { prompt, task } = await request.json()

    if (!GEMINI_API_KEY) {
      console.error("[v0] Missing GEMINI_API_KEY environment variable")
      return NextResponse.json({ error: "서버에 Gemini API 키가 설정되지 않았습니다." }, { status: 500 })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
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
            maxOutputTokens: task === "name" ? 50 : task === "description" ? 200 : 1000,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Gemini API error:", errorText)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    return NextResponse.json({ text })
  } catch (error) {
    console.error("[v0] Gemini route error:", error)
    return NextResponse.json({ error: "Gemini API 호출 실패" }, { status: 500 })
  }
}
