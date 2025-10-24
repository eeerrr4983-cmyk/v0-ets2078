import { APP_CONFIG, ERROR_MESSAGES } from "./constants"

export interface FileValidationResult {
  valid: boolean
  error?: string
}

export function validateFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: ERROR_MESSAGES.FILE_TOO_LARGE,
    }
  }

  // Check file type
  if (!APP_CONFIG.SUPPORTED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_FILE_TYPE,
    }
  }

  return { valid: true }
}

export function validateFiles(files: File[]): FileValidationResult {
  // Check number of files
  if (files.length > APP_CONFIG.MAX_FILES) {
    return {
      valid: false,
      error: ERROR_MESSAGES.TOO_MANY_FILES,
    }
  }

  // Validate each file
  for (const file of files) {
    const result = validateFile(file)
    if (!result.valid) {
      return result
    }
  }

  return { valid: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}
