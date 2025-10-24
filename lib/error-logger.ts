export class ErrorLogger {
  static log(
    error: Error,
    context?: {
      component?: string
      action?: string
      userId?: string
      metadata?: Record<string, any>
    },
  ) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context,
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("[Error]", errorInfo)
    }

    // In production, send to error tracking service
    // Example: Sentry, LogRocket, etc.
    if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
      // Send to error tracking service
      this.sendToErrorService(errorInfo)
    }

    return errorInfo
  }

  private static sendToErrorService(errorInfo: any) {
    // Implement error service integration here
    // For now, just store in sessionStorage for debugging
    try {
      const errors = JSON.parse(sessionStorage.getItem("app_errors") || "[]")
      errors.push(errorInfo)
      // Keep only last 10 errors
      if (errors.length > 10) errors.shift()
      sessionStorage.setItem("app_errors", JSON.stringify(errors))
    } catch (e) {
      // Silently fail if storage is full
    }
  }

  static getRecentErrors(): any[] {
    if (typeof window === "undefined") return []
    try {
      return JSON.parse(sessionStorage.getItem("app_errors") || "[]")
    } catch {
      return []
    }
  }

  static clearErrors() {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("app_errors")
    }
  }
}
