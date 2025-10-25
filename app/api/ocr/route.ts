import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY
const OCR_ENDPOINT = "https://api.ocr.space/parse/image"

interface OcrSpaceResult {
  ParsedResults?: Array<{
    ParsedText?: string
  }>
  IsErroredOnProcessing?: boolean
  ErrorMessage?: string | string[]
}

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    if (!OCR_SPACE_API_KEY) {
      console.error("[OCR] Missing OCR_SPACE_API_KEY environment variable")
      return NextResponse.json({ error: "서버에 OCR API 키가 설정되지 않았습니다." }, { status: 500 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files")

    if (!files.length) {
      return NextResponse.json({ error: "업로드된 파일이 없습니다." }, { status: 400 })
    }

    const results: string[] = []

    for (const file of files) {
      if (!(file instanceof File)) {
        continue
      }

      const ocrForm = new FormData()
      ocrForm.append("apikey", OCR_SPACE_API_KEY)
      ocrForm.append("language", "kor")
      ocrForm.append("isOverlayRequired", "false")
      ocrForm.append("detectOrientation", "true")
      ocrForm.append("scale", "true")
      ocrForm.append("OCREngine", "2")
      ocrForm.append("file", file, file.name)

      const response = await fetch(OCR_ENDPOINT, {
        method: "POST",
        body: ocrForm,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[OCR] API error response", response.status, errorText)
        throw new Error(`OCR.space API 실패 (status: ${response.status})`)
      }

      const data = (await response.json()) as OcrSpaceResult

      if (data.IsErroredOnProcessing) {
        const message = Array.isArray(data.ErrorMessage)
          ? data.ErrorMessage.join(", ")
          : data.ErrorMessage || "알 수 없는 오류"
        console.error("[OCR] Processing error", message)
        throw new Error(message)
      }

      const parsedText = data.ParsedResults?.map((item) => item.ParsedText ?? "").join("\n\n") ?? ""
      results.push(parsedText.trim())
    }

    return NextResponse.json({ texts: results })
  } catch (error) {
    console.error("[OCR] Unexpected error", error)
    const message = error instanceof Error ? error.message : "OCR 처리 중 오류가 발생했습니다."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
