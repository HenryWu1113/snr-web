/**
 * 交易時段分析頁面
 */

import { Metadata } from 'next'
import { DimensionAnalysisContent } from '@/components/analytics'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: '交易時段分析 | 統計分析 | SNR Web',
  description: '比較不同交易時段（亞洲盤、倫敦盤、紐約盤、重疊時段）的交易表現',
}

export default async function TradingSessionAnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <DimensionAnalysisContent
        dimension="tradingSession"
        title="交易時段分析"
        description="分析不同時段（亞洲盤、倫敦盤、紐約盤、重疊時段）的交易勝率與績效表現"
      />
    </div>
  )
}
