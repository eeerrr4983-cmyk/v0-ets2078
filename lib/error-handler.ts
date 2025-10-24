export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode = 500,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export function handleError(error: unknown): { message: string; code: string } {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: "UNKNOWN_ERROR",
    }
  }

  return {
    message: "알 수 없는 오류가 발생했습니다",
    code: "UNKNOWN_ERROR",
  }
}

export function logError(error: unknown, context?: string) {
  const errorInfo = handleError(error)
  console.error(`[v0] Error${context ? ` in ${context}` : ""}:`, errorInfo)
}
