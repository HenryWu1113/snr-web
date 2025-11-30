/**
 * 做多/做空分析頁面
 */

import { Metadata } from 'next'
import { DimensionAnalysisContent } from '@/components/analytics'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: '做多/做空分析 | 統計分析 | SNR Web',
  description: '比較做多與做空方向的交易表現',
}

export default async function PositionAnalyticsPage() {
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
        dimension="position"
        title="做多/做空分析"
        description="比較做多（LONG）與做空（SHORT）的交易表現差異"
      />
    </div>
  )
}
