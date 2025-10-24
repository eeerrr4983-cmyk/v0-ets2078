export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map()

  static startMeasure(name: string): void {
    this.marks.set(name, performance.now())
  }

  static endMeasure(name: string): number {
    const startTime = this.marks.get(name)
    if (!startTime) {
      console.warn(`[v0] No start mark found for "${name}"`)
      return 0
    }

    const duration = performance.now() - startTime
    this.marks.delete(name)

    if (duration > 1000) {
      console.warn(`[v0] Slow operation "${name}": ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startMeasure(name)
    try {
      const result = await fn()
      this.endMeasure(name)
      return result
    } catch (error) {
      this.endMeasure(name)
      throw error
    }
  }
}
