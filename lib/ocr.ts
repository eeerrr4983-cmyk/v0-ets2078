export interface OCRProgress {
  status?: string
  progress: number
}

interface OcrApiResponse {
  texts?: string[]
  error?: string
}

const DEFAULT_PROGRESS_MESSAGES = {
  uploading: "이미지를 업로드하는 중입니다...",
  requesting: "OCR.space에서 텍스트를 추출하고 있어요...",
  complete: "텍스트 추출이 완료되었어요!",
}

export async function extractTextFromImage(
  imageFile: File,
  onProgress?: (progress: OCRProgress) => void,
): Promise<string> {
  if (onProgress) {
    onProgress({ status: DEFAULT_PROGRESS_MESSAGES.uploading, progress: 5 })
  }

  const formData = new FormData()
  formData.append("files", imageFile)

  if (onProgress) {
    onProgress({ status: "OCR.space 서버에 연결 중...", progress: 15 })
  }

  // Increase timeout and add abort controller
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 90000) // 90 seconds

  try {
    const response = await fetch("/api/ocr", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (onProgress) {
      onProgress({ status: "한국어 텍스트를 정밀하게 추출하는 중...", progress: 45 })
    }

    if (!response.ok) {
      const errorMessage = await response.text()
      throw new Error(errorMessage || "OCR 요청에 실패했습니다.")
    }

    if (onProgress) {
      onProgress({ status: "텍스트 분석 중...", progress: 75 })
    }

    const data = (await response.json()) as OcrApiResponse

    if (data.error) {
      throw new Error(data.error)
    }

    const text = data.texts?.[0]?.trim() ?? ""

    if (!text || text.length === 0) {
      throw new Error("텍스트를 추출할 수 없습니다. 이미지 품질을 확인해주세요.")
    }

    if (onProgress) {
      onProgress({ status: DEFAULT_PROGRESS_MESSAGES.complete, progress: 100 })
    }

    return text
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error("OCR 처리 시간이 초과되었습니다. 이미지 크기를 줄이거나 다시 시도해주세요.")
    }
    throw error
  }
}

export async function extractTextFromMultipleImages(
  imageFiles: File[],
  onProgress?: (fileIndex: number, progress: OCRProgress) => void,
): Promise<string[]> {
  const results: string[] = []

  for (let i = 0; i < imageFiles.length; i++) {
    const text = await extractTextFromImage(imageFiles[i], (progress) => {
      onProgress?.(i, progress)
    })
    results.push(text)
  }

  return results
}
