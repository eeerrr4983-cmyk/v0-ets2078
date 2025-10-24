export class Analytics {
  static track(event: string, properties?: Record<string, any>) {
    if (typeof window === "undefined") return

    // Track with Vercel Analytics
    if (window.va) {
      window.va("track", event, properties)
    }

    // Console log in development
    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics]", event, properties)
    }
  }

  static pageView(path: string) {
    this.track("pageview", { path })
  }

  static analysisStarted(fileCount: number) {
    this.track("analysis_started", { file_count: fileCount })
  }

  static analysisCompleted(score: number, duration: number) {
    this.track("analysis_completed", { score, duration_ms: duration })
  }

  static featureUsed(feature: string) {
    this.track("feature_used", { feature })
  }

  static errorOccurred(error: string, context?: string) {
    this.track("error", { error, context })
  }

  static shareInitiated(platform?: string) {
    this.track("share_initiated", { platform })
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    va?: (event: string, ...args: any[]) => void
  }
}
