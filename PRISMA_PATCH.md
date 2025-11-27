# Prisma Client 修補說明

## 問題描述

Prisma 7.0.0 與 Next.js 16 (Turbopack) 存在兼容性問題：

```
Error: Cannot find module '#main-entry-point'
```

這是因為 Prisma 使用了 Node.js 的 package.json `imports` 字段，但 Turbopack 無法正確解析 `#main-entry-point` 這個內部模組引用。

## 解決方案

### 自動修補 (推薦)

專案已配置 `postinstall` 腳本，會在以下情況自動執行修補：

- `npm install`
- `npm ci` (Vercel 部署時)
- `prisma generate`

修補腳本位於 [scripts/patch-prisma.js](scripts/patch-prisma.js)

### 手動修補

如果需要手動修補：

```bash
node scripts/patch-prisma.js
```

## Vercel 部署

Vercel 部署時會自動執行 `postinstall` 腳本，無需額外配置。

## 臨時性說明

這是臨時解決方案，等待以下任一情況後可移除：

1. Prisma 修復此問題（追蹤：https://github.com/prisma/prisma/issues）
2. Next.js Turbopack 改進模組解析
3. 降級到 Prisma 6.x（不推薦）

## 相關配置

- [next.config.ts](next.config.ts) - 已添加 `serverExternalPackages`
- [package.json](package.json) - 已添加 `postinstall` 腳本
- [src/lib/prisma.ts](src/lib/prisma.ts) - 使用 PostgreSQL adapter

## 驗證修補

修補成功後，應該能看到以下訊息：

```
✅ Prisma Client 修補成功
```

或

```
ℹ️  Prisma Client 已經修補或不需要修補
```
