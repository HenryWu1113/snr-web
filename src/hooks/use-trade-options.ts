import { useState, useEffect } from 'react'

interface Option {
  id: string
  name: string
}

interface TradeOptions {
  tradeTypes: Option[]
  commodities: Option[]
  timeframes: Option[]
  entryTypes: Option[]
  trendlineTypes: Option[]
  tradingTags: Option[]
}

// Module-level cache (單例模式)
// 只要 App 不重新整理，這個變數就會一直存在記憶體中
let cachedOptions: TradeOptions | null = null
let fetchPromise: Promise<TradeOptions> | null = null

export function useTradeOptions() {
  const [options, setOptions] = useState<TradeOptions>({
    tradeTypes: [],
    commodities: [],
    timeframes: [],
    entryTypes: [],
    trendlineTypes: [],
    tradingTags: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // 如果已經有快取資料，直接使用
    if (cachedOptions) {
      setOptions(cachedOptions)
      return
    }

    // 如果正在請求中，等待該請求完成
    if (fetchPromise) {
      setIsLoading(true)
      fetchPromise
        .then((data) => {
          setOptions(data)
        })
        .catch((err) => {
          setError(err)
        })
        .finally(() => {
          setIsLoading(false)
        })
      return
    }

    // 發起新的請求
    setIsLoading(true)
    fetchPromise = Promise.all([
      fetch('/api/options/trade-types').then(r => r.json()).then(res => res.data || []),
      fetch('/api/options/commodities').then(r => r.json()).then(res => res.data || []),
      fetch('/api/options/timeframes').then(r => r.json()).then(res => res.data || []),
      fetch('/api/options/entry-types').then(r => r.json()).then(res => res.data || []),
      fetch('/api/options/trendline-types').then(r => r.json()).then(res => res.data || []),
      fetch('/api/options/trading-tags').then(r => r.json()).then(res => res.data || []),
    ]).then(([tradeTypes, commodities, timeframes, entryTypes, trendlineTypes, tradingTags]) => {
      const data = {
        tradeTypes: Array.isArray(tradeTypes) ? tradeTypes : [],
        commodities: Array.isArray(commodities) ? commodities : [],
        timeframes: Array.isArray(timeframes) ? timeframes : [],
        entryTypes: Array.isArray(entryTypes) ? entryTypes : [],
        trendlineTypes: Array.isArray(trendlineTypes) ? trendlineTypes : [],
        tradingTags: Array.isArray(tradingTags) ? tradingTags : [],
      }
      // 寫入快取
      cachedOptions = data
      return data
    })

    fetchPromise
      .then((data) => {
        setOptions(data)
      })
      .catch((err) => {
        console.error('Failed to load options:', err)
        setError(err)
        // 如果失敗，清除 promise 以便重試
        fetchPromise = null
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return { options, isLoading, error }
}
