/**
 * 交易類型分析頁面
 */

import { Metadata } from 'next'
import { DimensionAnalysisContent } from '@/components/analytics'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: '交易類型分析 | 統計分析 | SNR Web',
  description: '比較實盤與回測的交易表現',
}

export default async function TradeTypeAnalyticsPage() {
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
        dimension="tradeType"
        title="交易類型分析"
        description="比較實盤、回測等不同交易類型的表現差異"
      />
    </div>
  )
}
