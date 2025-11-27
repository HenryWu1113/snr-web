import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 開始建立測試交易數據...')

  // 替換為你的實際 user ID (從 Supabase Auth 取得)
  const userId = process.argv[2]

  if (!userId) {
    console.error('❌ 請提供 user ID: npm run seed:trades <user-id>')
    process.exit(1)
  }

  // 取得選項資料
  const commodities = await prisma.commodity.findMany()
  const timeframes = await prisma.timeframe.findMany()
  const trendlineTypes = await prisma.trendlineType.findMany()

  if (commodities.length === 0) {
    console.error('❌ 請先執行 seed-data.sql 建立選項資料')
    process.exit(1)
  }

  // 生成過去 30 天的隨機交易
  const trades = []
  const now = new Date()

  for (let i = 0; i < 50; i++) {
    // 隨機日期（過去 30 天內）
    const daysAgo = Math.floor(Math.random() * 30)
    const tradeDate = new Date(now)
    tradeDate.setDate(tradeDate.getDate() - daysAgo)

    // 隨機交易數據
    const stopLossTicks = Math.floor(Math.random() * 10) + 5 // 5-15 ticks
    const targetRatioNum = Math.floor(Math.random() * 4) + 1 // 1-4
    const targetRRatio = `1:${targetRatioNum}`
    const targetTicks = stopLossTicks * targetRatioNum

    // 隨機實際出場 (-1R 到 +3R)
    const actualRMultiple = (Math.random() * 4 - 1).toFixed(2)
    const actualExitTicks = Math.floor(
      Number(actualRMultiple) * stopLossTicks
    )

    // 計算損益 (假設每 tick = $12.5)
    const profitLoss = actualExitTicks * 12.5

    // 判定勝負
    let winLoss: 'win' | 'loss' | 'breakeven'
    if (Number(actualRMultiple) > 0.1) winLoss = 'win'
    else if (Number(actualRMultiple) < -0.1) winLoss = 'loss'
    else winLoss = 'breakeven'

    trades.push({
      userId,
      tradeDate,
      commodityId: commodities[Math.floor(Math.random() * commodities.length)]
        .id,
      timeframeId:
        timeframes[Math.floor(Math.random() * timeframes.length)].id,
      trendlineTypeId:
        trendlineTypes[Math.floor(Math.random() * trendlineTypes.length)].id,
      stopLossTicks,
      targetRRatio,
      targetTicks,
      actualExitTicks,
      actualRMultiple: Number(actualRMultiple),
      profitLoss,
      winLoss,
      notes: `測試交易 #${i + 1}`,
    })
  }

  // 批量插入
  const result = await prisma.trade.createMany({
    data: trades,
  })

  console.log(`✅ 成功建立 ${result.count} 筆測試交易`)

  // 顯示統計
  const stats = await prisma.trade.groupBy({
    by: ['winLoss'],
    where: { userId },
    _count: true,
  })

  console.log('\n📊 統計摘要:')
  stats.forEach((s) => {
    console.log(`  ${s.winLoss}: ${s._count} 筆`)
  })
}

main()
  .catch((e) => {
    console.error('❌ 錯誤:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
