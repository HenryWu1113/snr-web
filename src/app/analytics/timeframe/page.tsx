/**
 * 時間框架分析頁面
 */

import { Metadata } from 'next'
import { DimensionAnalysisContent } from '@/components/analytics'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: '時間框架分析 | 統計分析 | SNR Web',
  description: '分析不同時間框架的交易效果',
}

export default async function TimeframeAnalyticsPage() {
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
        dimension="timeframe"
        title="時間框架分析"
        description="比較 5 分鐘、15 分鐘、1 小時等不同時間框架的表現"
      />
    </div>
  )
}
