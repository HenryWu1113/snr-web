/**
 * 統計分析主頁面 - 總覽
 */

import { Metadata } from 'next'
import { AnalyticsOverviewContent } from '@/components/analytics'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: '統計分析 | SNR Web',
  description: '交易統計分析總覽',
}

export default async function AnalyticsPage() {
  // 驗證用戶
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 獲取用戶的所有交易數據（用於總覽）
  const trades = await prisma.trade.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      orderDate: 'desc',
    },
    take: 100, // 限制最近 100 筆
  })

  // 序列化交易資料（轉換 Date 為字串，Decimal 為數字）
  const serializedTrades = trades.map((trade) => ({
    ...trade,
    tradeDate: trade.tradeDate.toISOString(),
    orderDate: trade.orderDate.toISOString(),
    createdAt: trade.createdAt.toISOString(),
    updatedAt: trade.updatedAt.toISOString(),
    targetR: Number(trade.targetR),
    actualExitR: Number(trade.actualExitR),
    leverage: Number(trade.leverage),
    profitLoss: Number(trade.profitLoss),
  }))

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">統計分析</h1>
        <p className="text-muted-foreground mt-1">
          深入分析交易表現，發現優勢與弱點
        </p>
      </header>

      <AnalyticsOverviewContent trades={serializedTrades as any} userName={user.email || ''} />
    </div>
  )
}
