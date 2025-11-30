/**
 * 趨勢線類型分析頁面
 */

import { Metadata } from 'next'
import { DimensionAnalysisContent } from '@/components/analytics'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: '趨勢線類型分析 | 統計分析 | SNR Web',
  description: '比較不同趨勢線策略的交易表現',
}

export default async function TrendlineAnalyticsPage() {
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
        dimension="trendline"
        title="趨勢線類型分析"
        description="比較不同趨勢線類型（111、222 等）的策略效果"
      />
    </div>
  )
}
