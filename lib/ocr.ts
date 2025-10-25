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

async function compressImageFile(file: File, maxSizeMB = 1): Promise<File> {
  // If already small enough, return as-is
  if (file.size < maxSizeMB * 1024 * 1024) {
    return file
  }

  console.log("[v0] Compressing image:", file.name, "from", Math.round(file.size / 1024) + "KB")

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Calculate new dimensions (max 1920px)
        const maxDim = 1920
        let width = img.width
        let height = img.height

        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          resolve(file)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressed = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
                type: "image/jpeg",
              })
              console.log("[v0] Compressed to", Math.round(compressed.size / 1024) + "KB")
              resolve(compressed)
            } else {
              resolve(file)
            }
          },
          "image/jpeg",
          0.85,
        )
      }
      img.onerror = () => resolve(file)
      img.src = e.target?.result as string
    }
    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}

export async function extractTextFromImage(
  imageFile: File,
  onProgress?: (progress: OCRProgress) => void,
): Promise<string> {
  if (onProgress) {
    onProgress({ status: DEFAULT_PROGRESS_MESSAGES.uploading, progress: 5 })
  }

  const compressedFile = await compressImageFile(imageFile, 1)

  const formData = new FormData()
  formData.append("files", compressedFile)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 50000)

  try {
    const response = await fetch("/api/ocr", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (onProgress) {
      onProgress({ status: DEFAULT_PROGRESS_MESSAGES.requesting, progress: 35 })
    }

    if (!response.ok) {
      let errorMessage = "OCR 요청 실패"
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch {
        errorMessage = await response.text()
      }
      console.error("[v0] OCR 오류:", errorMessage)
      throw new Error(errorMessage)
    }

    const data = (await response.json()) as OcrApiResponse

    if (data.error) {
      console.error("[v0] OCR API 오류:", data.error)
      throw new Error(data.error)
    }

    const text = data.texts?.[0]?.trim() ?? ""

    if (onProgress) {
      onProgress({ status: DEFAULT_PROGRESS_MESSAGES.complete, progress: 100 })
    }

    return text
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("OCR 처리 시간 초과. 이미지를 더 작게 만들어주세요.")
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
