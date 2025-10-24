import { type NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = "AIzaSyCYhOWMK6LWl4Qm-8Uth4XF6eWfUPOh6I0"

export async function POST(request: NextRequest) {
  try {
    const { prompt, task } = await request.json()

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
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
