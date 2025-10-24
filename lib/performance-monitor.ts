export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map()

  static mark(name: string) {
    if (typeof window === "undefined") return
    this.marks.set(name, performance.now())
  }

  static measure(name: string, startMark: string): number {
    if (typeof window === "undefined") return 0

    const startTime = this.marks.get(startMark)
    if (!startTime) return 0

    const duration = performance.now() - startTime

    if (process.env.NODE_ENV === "development") {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startMark = `${name}_start`
    this.mark(startMark)

    try {
      const result = await fn()
      this.measure(name, startMark)
      return result
    } catch (error) {
      this.measure(`${name}_error`, startMark)
      throw error
    }
  }

  static getWebVitals() {
    if (typeof window === "undefined") return null

    return {
      // First Contentful Paint
      fcp: performance.getEntriesByName("first-contentful-paint")[0]?.startTime,
      // Largest Contentful Paint
      lcp: performance.getEntriesByType("largest-contentful-paint")[0]?.startTime,
      // First Input Delay
      fid: performance.getEntriesByType("first-input")[0]?.processingStart,
      // Cumulative Layout Shift
      cls: performance.getEntriesByType("layout-shift").reduce((sum, entry: any) => {
        if (!entry.hadRecentInput) {
          return sum + entry.value
        }
        return sum
      }, 0),
    }
  }
}
