/**
 * 商品分析頁面
 */

import { Metadata } from 'next'
import { DimensionAnalysisContent } from '@/components/analytics'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: '商品分析 | 統計分析 | SNR Web',
  description: '分析不同商品的交易表現',
}

export default async function CommodityAnalyticsPage() {
  // 驗證用戶
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
        dimension="commodity"
        title="商品分析"
        description="分析不同商品的交易表現，找出最有優勢的標的"
      />
    </div>
  )
}
