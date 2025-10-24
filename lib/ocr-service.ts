/**
 * OCR Service using OCR.space API
 * Provides high-quality text extraction from images
 */

export interface OCRProgress {
  status: string
  progress: number
  message?: string
}

export interface OCRResult {
  text: string
  confidence: number
  error?: string
}

/**
 * Extract text from image using OCR.space API
 */
export async function extractTextFromImage(
  imageFile: File,
  onProgress?: (progress: OCRProgress) => void,
): Promise<string> {
  try {
    // Helper function to simulate smooth progress between checkpoints
    const smoothProgress = async (start: number, end: number, duration: number, message: string) => {
      const steps = 10
      const increment = (end - start) / steps
      const delay = duration / steps
      
      for (let i = 0; i <= steps; i++) {
        onProgress?.({
          status: 'processing',
          progress: Math.min(end, start + (increment * i)),
          message
        })
        if (i < steps) {
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    onProgress?.({
      status: 'preparing',
      progress: 5,
      message: '이미지를 준비하는 중...'
    })

    // Create FormData for API request
    const formData = new FormData()
    formData.append('file', imageFile)
    formData.append('language', 'kor')
    formData.append('isOverlayRequired', 'false')
    formData.append('detectOrientation', 'true')
    formData.append('scale', 'true')
    formData.append('OCREngine', '2')

    await smoothProgress(5, 15, 300, '이미지를 준비하는 중...')

    onProgress?.({
      status: 'uploading',
      progress: 15,
      message: 'OCR 서버에 업로드 중...'
    })

    const apiKey = process.env.NEXT_PUBLIC_OCR_SPACE_API_KEY || 'K85664750088957'
    
    // Start upload with progress simulation
    const uploadPromise = fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': apiKey,
      },
      body: formData,
    })

    // Simulate upload progress
    await smoothProgress(15, 40, 800, 'OCR 서버에 업로드 중...')

    const response = await uploadPromise

    if (!response.ok) {
      throw new Error(`OCR API 오류: ${response.status}`)
    }

    onProgress?.({
      status: 'processing',
      progress: 45,
      message: '텍스트를 추출하는 중...'
    })

    // Simulate processing progress
    await smoothProgress(45, 75, 1000, '텍스트를 정밀하게 추출하는 중...')

    const result = await response.json()

    onProgress?.({
      status: 'completing',
      progress: 85,
      message: '텍스트 정제 중...'
    })

    if (result.OCRExitCode !== 1) {
      throw new Error(result.ErrorMessage || 'OCR 처리 실패')
    }

    // Extract text from all pages
    const extractedText = result.ParsedResults
      ?.map((page: any) => page.ParsedText || '')
      .join('\n\n')
      .trim() || ''

    await smoothProgress(85, 100, 300, '텍스트 추출 완료!')

    onProgress?.({
      status: 'complete',
      progress: 100,
      message: '텍스트 추출 완료!'
    })

    return extractedText
  } catch (error) {
    console.error('[OCR Error]', error)
    onProgress?.({
      status: 'error',
      progress: 0,
      message: error instanceof Error ? error.message : 'OCR 처리 중 오류 발생'
    })
    throw error
  }
}

/**
 * Extract text from multiple images
 */
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

/**
 * Fallback to Tesseract.js if OCR.space fails
 */
export async function extractTextWithFallback(
  imageFile: File,
  onProgress?: (progress: OCRProgress) => void,
): Promise<string> {
  try {
    // Try OCR.space first
    return await extractTextFromImage(imageFile, onProgress)
  } catch (error) {
    console.warn('[OCR] OCR.space failed, falling back to Tesseract.js', error)
    
    // Fallback to local Tesseract.js
    const { createWorker } = await import('tesseract.js')
    
    const worker = await createWorker('kor+eng', 1, {
      logger: (m) => {
        if (onProgress && m.status) {
          onProgress({
            status: m.status,
            progress: m.progress || 0,
            message: '로컬 OCR 처리 중...'
          })
        }
      },
    })

    try {
      const { data: { text } } = await worker.recognize(imageFile)
      await worker.terminate()
      return text.trim()
    } catch (err) {
      await worker.terminate()
      throw err
    }
  }
}
