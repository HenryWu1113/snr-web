#!/usr/bin/env node

/**
 * 修補 Prisma Client 的 default.js 以解決 Next.js 16 Turbopack 的模組解析問題
 * 這是臨時解決方案，直到 Prisma 或 Next.js 修復此兼容性問題
 */

const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '../node_modules/.prisma/client/default.js')

try {
  const content = fs.readFileSync(filePath, 'utf8')

  if (content.includes('#main-entry-point')) {
    const patched = content.replace(
      "module.exports = { ...require('#main-entry-point') }",
      "module.exports = { ...require('./index.js') }"
    )

    fs.writeFileSync(filePath, patched, 'utf8')
    console.log('✅ Prisma Client 修補成功')
  } else {
    console.log('ℹ️  Prisma Client 已經修補或不需要修補')
  }
} catch (error) {
  console.error('❌ 修補 Prisma Client 失敗:', error.message)
  process.exit(1)
}
