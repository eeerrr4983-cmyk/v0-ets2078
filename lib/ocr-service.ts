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

    // Create FormData for API request with optimized settings for Korean text
    const formData = new FormData()
    formData.append('file', imageFile)
    
    // Korean language with maximum accuracy settings
    formData.append('language', 'kor') // Korean language
    formData.append('isOverlayRequired', 'false')
    formData.append('detectOrientation', 'true') // Auto-rotate for better accuracy
    formData.append('scale', 'true') // Upscale for small text
    formData.append('OCREngine', '2') // Engine 2 has better Korean support
    
    // Advanced settings for maximum accuracy
    formData.append('isTable', 'false') // Optimize for continuous text
    formData.append('detectCheckbox', 'false')
    
    await smoothProgress(5, 15, 300, '한국어 OCR 엔진 준비 중...')

    onProgress?.({
      status: 'uploading',
      progress: 15,
      message: 'OCR 서버에 업로드 중...'
    })

    const apiKey = process.env.NEXT_PUBLIC_OCR_SPACE_API_KEY || 'K85664750088957'
    
    console.log('[OCR] Starting Korean text extraction with OCR.space')
    
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
      const errorText = await response.text()
      console.error('[OCR] API error:', response.status, errorText)
      throw new Error(`OCR API 오류: ${response.status}`)
    }

    onProgress?.({
      status: 'processing',
      progress: 45,
      message: '한국어 텍스트를 정밀 추출 중...'
    })

    // Simulate processing progress
    await smoothProgress(45, 75, 1000, '생기부 내용을 꼼꼼히 읽는 중...')

    const result = await response.json()
    
    console.log('[OCR] Response received:', {
      exitCode: result.OCRExitCode,
      isErroredOnProcessing: result.IsErroredOnProcessing,
      errorMessage: result.ErrorMessage
    })

    onProgress?.({
      status: 'completing',
      progress: 85,
      message: '텍스트 정제 중...'
    })

    if (result.OCRExitCode !== 1 || result.IsErroredOnProcessing) {
      const errorMsg = result.ErrorMessage?.[0] || result.ErrorMessage || 'OCR 처리 실패'
      console.error('[OCR] Processing failed:', errorMsg)
      throw new Error(errorMsg)
    }

    // Extract text from all pages with improved handling
    const extractedText = result.ParsedResults
      ?.map((page: any) => {
        const text = page.ParsedText || ''
        // Log confidence if available
        if (page.TextOrientation !== undefined) {
          console.log('[OCR] Text orientation:', page.TextOrientation)
        }
        return text
      })
      .join('\n\n')
      .trim() || ''

    if (!extractedText) {
      throw new Error('텍스트를 추출할 수 없습니다. 이미지가 흐리거나 글씨가 너무 작을 수 있습니다.')
    }

    console.log('[OCR] Extracted text length:', extractedText.length, 'characters')
    console.log('[OCR] First 200 characters:', extractedText.substring(0, 200))

    await smoothProgress(85, 100, 300, '텍스트 추출 완료!')

    onProgress?.({
      status: 'complete',
      progress: 100,
      message: `텍스트 추출 완료! (${extractedText.length}자)`
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
