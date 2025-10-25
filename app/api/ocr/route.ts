import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY
const OCR_ENDPOINT = "https://api.ocr.space/parse/image"

export const maxDuration = 60

interface OcrSpaceResult {
  ParsedResults?: Array<{
    ParsedText?: string
  }>
  IsErroredOnProcessing?: boolean
  ErrorMessage?: string | string[]
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 25000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("OCR 처리 시간 초과. 이미지를 더 작게 만들어주세요 (권장: 1MB 이하)")
    }
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!OCR_SPACE_API_KEY) {
      console.error("[OCR] Missing OCR_SPACE_API_KEY")
      return NextResponse.json({ error: "OCR API 키가 설정되지 않았습니다." }, { status: 500 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files")

    if (!files.length) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 })
    }

    const filesToProcess = files.slice(0, 2).filter((file): file is File => {
      if (!(file instanceof File)) return false
      if (file.size > 5 * 1024 * 1024) {
        console.warn("[OCR] File too large:", file.name, file.size)
        return false
      }
      return true
    })

    if (filesToProcess.length === 0) {
      return NextResponse.json({ error: "유효한 파일이 없습니다. 파일 크기는 5MB 이하여야 합니다." }, { status: 400 })
    }

    const results: string[] = []

    for (const file of filesToProcess) {
      try {
        const ocrForm = new FormData()
        ocrForm.append("apikey", OCR_SPACE_API_KEY)
        ocrForm.append("language", "kor")
        ocrForm.append("isOverlayRequired", "false")
        ocrForm.append("OCREngine", "1")
        ocrForm.append("file", file, file.name)

        console.log("[OCR] Processing:", file.name, "Size:", Math.round(file.size / 1024) + "KB")

        const response = await fetchWithTimeout(OCR_ENDPOINT, {
          method: "POST",
          body: ocrForm,
        })

        const contentType = response.headers.get("content-type")

        if (!response.ok) {
          const errorText = await response.text()
          console.error("[OCR] API error:", response.status, errorText.substring(0, 100))
          throw new Error(`OCR 실패 (${response.status})`)
        }

        if (!contentType?.includes("application/json")) {
          const textResponse = await response.text()
          console.error("[OCR] Non-JSON response:", textResponse.substring(0, 100))
          throw new Error("OCR API 응답 형식 오류")
        }

        const data = (await response.json()) as OcrSpaceResult

        if (data.IsErroredOnProcessing) {
          const message = Array.isArray(data.ErrorMessage)
            ? data.ErrorMessage.join(", ")
            : data.ErrorMessage || "처리 오류"
          console.error("[OCR] Processing error:", message)
          throw new Error(message)
        }

        const parsedText = data.ParsedResults?.map((item) => item.ParsedText ?? "").join("\n\n") ?? ""
        const cleanedText = parsedText.trim()

        console.log("[OCR] Success:", cleanedText.length, "chars")
        results.push(cleanedText)
      } catch (fileError) {
        console.error("[OCR] File error:", file.name, fileError)
        results.push("") // Add empty to maintain order
      }
    }

    return NextResponse.json({ texts: results })
  } catch (error) {
    console.error("[OCR] Error:", error)
    const message = error instanceof Error ? error.message : "OCR 처리 오류"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
