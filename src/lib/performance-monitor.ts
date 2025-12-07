/**
 * 效能監控工具
 * 用於追蹤 API 和資料庫查詢效能
 */

type PerformanceMetric = {
  name: string
  duration: number
  timestamp: number
  type: 'api' | 'db' | 'render'
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private slowThreshold = {
    api: 500, // API 查詢超過 500ms 視為慢
    db: 300,  // 資料庫查詢超過 300ms 視為慢
    render: 100, // 渲染超過 100ms 視為慢
  }

  /**
   * 測量非同步函數執行時間
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    type: 'api' | 'db' | 'render' = 'api'
  ): Promise<T> {
    const start = performance.now()
    
    try {
      const result = await fn()
      const duration = performance.now() - start
      
      this.recordMetric({ name, duration, timestamp: Date.now(), type })
      
      // 慢查詢警告
      if (duration > this.slowThreshold[type]) {
        console.warn(
          `⚠️ [${type.toUpperCase()}] 慢查詢: ${name} took ${duration.toFixed(2)}ms`
        )
      } else if (process.env.NODE_ENV === 'development') {
        console.log(
          `✓ [${type.toUpperCase()}] ${name}: ${duration.toFixed(2)}ms`
        )
      }
      
      return result
    } catch (error) {
      const duration = performance.now() - start
      console.error(
        `✗ [${type.toUpperCase()}] ${name} failed after ${duration.toFixed(2)}ms`,
        error
      )
      throw error
    }
  }

  /**
   * 記錄效能指標
   */
  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)
    
    // 只保留最近 100 筆記錄
    if (this.metrics.length > 100) {
      this.metrics.shift()
    }
  }

  /**
   * 取得效能統計
   */
  getStats(type?: 'api' | 'db' | 'render') {
    const filteredMetrics = type 
      ? this.metrics.filter(m => m.type === type)
      : this.metrics

    if (filteredMetrics.length === 0) {
      return null
    }

    const durations = filteredMetrics.map(m => m.duration)
    const sum = durations.reduce((a, b) => a + b, 0)
    const avg = sum / durations.length
    const min = Math.min(...durations)
    const max = Math.max(...durations)
    const median = durations.sort((a, b) => a - b)[Math.floor(durations.length / 2)]

    return {
      count: filteredMetrics.length,
      avg: Number(avg.toFixed(2)),
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      median: Number(median.toFixed(2)),
    }
  }

  /**
   * 列印效能報告
   */
  printReport() {
    console.log('\n📊 效能監控報告\n')
    console.log('API 查詢:')
    console.table(this.getStats('api'))
    console.log('\n資料庫查詢:')
    console.table(this.getStats('db'))
    console.log('\n前端渲染:')
    console.table(this.getStats('render'))
  }

  /**
   * 清除所有記錄
   */
  clear() {
    this.metrics = []
  }
}

// 建立全域實例
const performanceMonitor = new PerformanceMonitor()

// 開發環境下暴露到 window
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  ;(window as any).performanceMonitor = performanceMonitor
}

export default performanceMonitor
