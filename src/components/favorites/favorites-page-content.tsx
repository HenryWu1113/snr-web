/**
 * 喜歡的交易頁面內容
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TradeDataTable } from '@/components/datatable/trade-datatable'
import { Heart } from 'lucide-react'

export function FavoritesPageContent() {
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)

  // 當交易被更新時刷新列表
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
    router.refresh()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-6 w-6 text-red-500 fill-red-500" />
          <h1 className="text-3xl font-bold">我的喜歡</h1>
        </div>
        <p className="text-muted-foreground">
          這裡顯示您標記為喜歡的所有交易紀錄
        </p>
      </div>

      <TradeDataTable
        key={refreshKey}
        onTradeUpdate={handleRefresh}
        onTradeDelete={handleRefresh}
        fixedFilters={{ isFavorite: true }}
      />
    </div>
  )
}
