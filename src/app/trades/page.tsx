/**
 * 交易紀錄列表頁面
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { TradesPageContent } from '@/components/trades/trades-page-content'

export default async function TradesPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <DashboardLayout>
      <TradesPageContent />
    </DashboardLayout>
  )
}
