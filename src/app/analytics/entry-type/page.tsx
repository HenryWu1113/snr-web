/**
 * 進場類型分析頁面
 */

import { Metadata } from 'next'
import { DimensionAnalysisContent } from '@/components/analytics'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: '進場類型分析 | 統計分析 | SNR Web',
  description: '比較不同進場策略（EQ, BO, HNS 等）的交易表現',
}

export default async function EntryTypeAnalyticsPage() {
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
        dimension="entryType"
        title="進場類型分析"
        description="比較不同進場策略（EQ, BO, HNS 等）的交易表現，找出最高勝率的型態"
      />
    </div>
  )
}
