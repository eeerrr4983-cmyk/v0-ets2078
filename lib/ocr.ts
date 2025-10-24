import { createWorker } from "tesseract.js"

export interface OCRProgress {
  status: string
  progress: number
}

export async function extractTextFromImage(
  imageFile: File,
  onProgress?: (progress: OCRProgress) => void,
): Promise<string> {
  const worker = await createWorker("kor+eng", 1, {
    logger: (m) => {
      if (onProgress && m.status) {
        onProgress({
          status: m.status,
          progress: m.progress || 0,
        })
      }
    },
  })

  try {
    const {
      data: { text },
    } = await worker.recognize(imageFile)
    await worker.terminate()
    return text.trim()
  } catch (error) {
    await worker.terminate()
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
