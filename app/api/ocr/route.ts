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
      ocrForm.append("isTable", "true")
      ocrForm.append("filetype", file.type.includes("pdf") ? "PDF" : "Auto")
      ocrForm.append("file", file, file.name)

      console.log("[OCR] Processing file:", file.name, "Size:", file.size, "Type:", file.type)

      const response = await fetch(OCR_ENDPOINT, {
        method: "POST",
        body: ocrForm,
      })

      const contentType = response.headers.get("content-type")
      const isJson = contentType?.includes("application/json")

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[OCR] API error response", response.status, errorText)
        throw new Error(`OCR.space API 실패 (status: ${response.status}): ${errorText.substring(0, 100)}`)
      }

      if (!isJson) {
        const textResponse = await response.text()
        console.error("[OCR] Non-JSON response received:", textResponse.substring(0, 200))
        throw new Error(`OCR.space API가 예상치 못한 응답을 반환했습니다: ${textResponse.substring(0, 100)}`)
      }

      let data: OcrSpaceResult
      try {
        data = (await response.json()) as OcrSpaceResult
      } catch (parseError) {
        const rawText = await response.text()
        console.error("[OCR] JSON parse error. Raw response:", rawText.substring(0, 200))
        throw new Error(`OCR 응답을 파싱할 수 없습니다. API 키를 확인해주세요.`)
      }

      if (data.IsErroredOnProcessing) {
        const message = Array.isArray(data.ErrorMessage)
          ? data.ErrorMessage.join(", ")
          : data.ErrorMessage || "알 수 없는 오류"
        console.error("[OCR] Processing error", message)
        throw new Error(message)
      }

      const parsedText = data.ParsedResults?.map((item) => item.ParsedText ?? "").join("\n\n") ?? ""
      const cleanedText = parsedText.trim()

      console.log("[OCR] Extracted text length:", cleanedText.length, "characters")
      console.log("[OCR] First 200 characters:", cleanedText.substring(0, 200))

      if (cleanedText.length === 0) {
        console.warn("[OCR] Warning: Empty text extracted from", file.name)
      }

      results.push(cleanedText)
    }

    return NextResponse.json({ texts: results })
  } catch (error) {
    console.error("[OCR] Unexpected error", error)
    const message = error instanceof Error ? error.message : "OCR 처리 중 오류가 발생했습니다."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
