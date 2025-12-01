/**
 * 持倉時間分析頁面
 */

import { Metadata } from 'next'
import { DimensionAnalysisContent } from '@/components/analytics'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: '持倉時間分析 | 統計分析 | SNR Web',
  description: '分析持倉時間長短與交易績效的關係',
}

export default async function HoldingTimeAnalyticsPage() {
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
        dimension="holdingTime"
        title="持倉時間分析"
        description="分析不同持倉時間區間（0-30分、30-60分、1-2小時等）的交易勝率與表現"
      />
    </div>
  )
}
