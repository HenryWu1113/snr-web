/**
 * 設定頁面 Layout
 * 使用統一的 DashboardLayout
 */

import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
