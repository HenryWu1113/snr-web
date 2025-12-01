/**
 * 自定義標籤分析頁面
 */

import { Metadata } from 'next'
import { DimensionAnalysisContent } from '@/components/analytics'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: '自定義標籤分析 | 統計分析 | SNR Web',
  description: '分析帶有不同標籤的交易表現',
}

export default async function TagsAnalyticsPage() {
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
        dimension="tags"
        title="自定義標籤分析"
        description="分析不同標籤（如#追單、#情緒差、#完美執行等）對交易績效的影響"
      />
    </div>
  )
}
