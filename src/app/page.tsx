import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { prisma } from '@/lib/prisma'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { session }
  } = await supabase.auth.getSession()

  // 如果未登入，重導向至登入頁
  if (!session) {
    redirect('/login')
  }

  const user = session.user

  // 查詢該使用者的所有交易紀錄
  const trades = await prisma.trade.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      tradeDate: 'asc'
    }
  })

  // 序列化交易資料（轉換 Date 為字串）
  const serializedTrades = trades.map((trade) => ({
    ...trade,
    tradeDate: trade.tradeDate.toISOString(),
    orderDate: trade.orderDate.toISOString(),
    createdAt: trade.createdAt.toISOString(),
    updatedAt: trade.updatedAt.toISOString()
  }))

  return (
    <DashboardLayout>
      <div className='container mx-auto px-4 py-8'>
        <DashboardContent
          trades={serializedTrades as any}
          userName={user.user_metadata?.name || user.email || '使用者'}
        />
      </div>
    </DashboardLayout>
  )
}
