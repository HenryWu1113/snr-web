/**
 * 收藏分類頁面
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CollectionsPageContent } from '@/components/collections/collections-page-content'

export default async function CollectionsPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <DashboardLayout>
      <CollectionsPageContent />
    </DashboardLayout>
  )
}
