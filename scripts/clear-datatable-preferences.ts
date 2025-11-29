/**
 * 清除 DataTable 相關的使用者偏好設定
 * 用於修復 schema 變更後的欄位名稱不匹配問題
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearDatatablePreferences() {
  try {
    console.log('🔍 查詢現有的 DataTable 偏好設定...')

    // 查詢所有 datatable 相關的偏好設定
    const preferences = await prisma.userPreference.findMany({
      where: {
        OR: [
          { type: { contains: 'datatable' } },
          { type: { contains: 'trade' } },
          { type: { contains: 'column' } },
          { type: { contains: 'sort' } },
        ],
      },
    })

    console.log(`📊 找到 ${preferences.length} 筆偏好設定`)

    if (preferences.length > 0) {
      preferences.forEach((pref) => {
        console.log(`  - ${pref.type} (User: ${pref.userId})`)
      })

      console.log('\n🗑️  刪除偏好設定...')

      const result = await prisma.userPreference.deleteMany({
        where: {
          OR: [
            { type: { contains: 'datatable' } },
            { type: { contains: 'trade' } },
            { type: { contains: 'column' } },
            { type: { contains: 'sort' } },
          ],
        },
      })

      console.log(`✅ 成功刪除 ${result.count} 筆偏好設定`)
    } else {
      console.log('ℹ️  沒有找到需要清除的偏好設定')
    }
  } catch (error) {
    console.error('❌ 清除偏好設定時發生錯誤:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearDatatablePreferences()
  .then(() => {
    console.log('\n🎉 完成！請重新載入交易紀錄頁面。')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 執行失敗:', error)
    process.exit(1)
  })
