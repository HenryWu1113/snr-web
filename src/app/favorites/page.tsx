/**
 * 喜歡的交易頁面
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { FavoritesPageContent } from '@/components/favorites/favorites-page-content'

export default async function FavoritesPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <DashboardLayout>
      <FavoritesPageContent />
    </DashboardLayout>
  )
}
