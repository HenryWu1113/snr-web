/**
 * 交易紀錄頁面內容（Client Component）
 */

'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TradeDataTable } from '@/components/datatable/trade-datatable'
import { AddTradeModal } from '@/components/forms/add-trade-modal'

export function TradesPageContent() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => {
    // 刷新 DataTable
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">交易紀錄</h1>
            <p className="text-muted-foreground mt-2">
              查看、篩選和分析您的交易歷史記錄
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新增交易
          </Button>
        </div>

        <TradeDataTable key={refreshKey} />
      </div>

      <AddTradeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleSuccess}
      />
    </>
  )
}
