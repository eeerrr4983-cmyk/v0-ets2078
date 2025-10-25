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

  const response = await fetch("/api/ocr", {
    method: "POST",
    body: formData,
  })

  if (onProgress) {
    onProgress({ status: DEFAULT_PROGRESS_MESSAGES.requesting, progress: 35 })
  }

  if (!response.ok) {
    const errorMessage = await response.text()
    throw new Error(errorMessage || "OCR 요청에 실패했습니다.")
  }

  const data = (await response.json()) as OcrApiResponse

  if (data.error) {
    throw new Error(data.error)
  }

  const text = data.texts?.[0]?.trim() ?? ""

  if (onProgress) {
    onProgress({ status: DEFAULT_PROGRESS_MESSAGES.complete, progress: 100 })
  }

  return text
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
