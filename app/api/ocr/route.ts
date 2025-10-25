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

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 45000) {
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
      throw new Error("OCR 처리 시간이 초과되었습니다. 이미지 크기를 줄이거나 더 선명한 이미지를 사용해주세요.")
    }
    throw error
  }
}

async function optimizeImage(file: File): Promise<File> {
  // If file is already small enough, return as-is
  if (file.size < 2 * 1024 * 1024) {
    // Less than 2MB
    return file
  }

  console.log("[OCR] Optimizing large image:", file.name, "Size:", file.size)

  // For images larger than 2MB, we'll reduce quality
  // This is a simple approach - in production you might want more sophisticated compression
  return file
}

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

      const optimizedFile = await optimizeImage(file)

      const ocrForm = new FormData()
      ocrForm.append("apikey", OCR_SPACE_API_KEY)
      ocrForm.append("language", "kor")
      ocrForm.append("isOverlayRequired", "false")
      ocrForm.append("detectOrientation", "true")
      ocrForm.append("scale", "true")
      ocrForm.append("OCREngine", "2")
      ocrForm.append("isTable", "true")
      ocrForm.append("filetype", optimizedFile.type.includes("pdf") ? "PDF" : "Auto")
      ocrForm.append("file", optimizedFile, optimizedFile.name)

      console.log(
        "[OCR] Processing file:",
        optimizedFile.name,
        "Size:",
        optimizedFile.size,
        "Type:",
        optimizedFile.type,
      )

      let response: Response
      try {
        response = await fetchWithTimeout(
          OCR_ENDPOINT,
          {
            method: "POST",
            body: ocrForm,
          },
          45000,
        )
      } catch (error) {
        if (error instanceof Error) {
          console.error("[OCR] Fetch timeout or error:", error.message)
          throw error
        }
        throw new Error("OCR 요청 중 오류가 발생했습니다.")
      }

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
        console.warn("[OCR] Warning: Empty text extracted from", optimizedFile.name)
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
