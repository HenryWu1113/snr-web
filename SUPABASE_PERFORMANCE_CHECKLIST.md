# Supabase 效能優化檢查清單

## 1. 檢查 Row Level Security (RLS) 規則

RLS 規則可能導致查詢變慢，特別是 UPDATE 操作。

### 📋 檢查步驟：

1. 前往 Supabase Dashboard
2. Database → Tables → trades
3. 點擊「Policies」標籤
4. 檢查是否有複雜的 RLS 規則

### ⚠️ 常見效能問題：

```sql
-- ❌ 慢：每次都要 JOIN 其他表
CREATE POLICY "Users can update own trades"
ON trades FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.active = true
  )
);

-- ✅ 快：簡單的欄位比對
CREATE POLICY "Users can update own trades"
ON trades FOR UPDATE  
USING (user_id = auth.uid());
```

### 🔧 建議的 RLS 規則：

```sql
-- SELECT: 使用者只能看到自己的交易
CREATE POLICY "Users can view own trades"
ON trades FOR SELECT
USING (user_id = auth.uid());

-- INSERT: 使用者只能新增自己的交易
CREATE POLICY "Users can insert own trades"
ON trades FOR INSERT
WITH CHECK (user_id = auth.uid());

-- UPDATE: 使用者只能更新自己的交易
CREATE POLICY "Users can update own trades"
ON trades FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: 使用者只能刪除自己的交易
CREATE POLICY "Users can delete own trades"
ON trades FOR DELETE
USING (user_id = auth.uid());
```

---

## 2. 確認索引已部署

執行以下 SQL 檢查索引是否存在：

```sql
-- 檢查 trades 表的索引
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'trades'
ORDER BY indexname;
```

### 預期結果：

應該看到類似的索引：
- `trades_pkey` (主鍵)
- `trades_user_id_idx`
- `trades_user_id_trade_date_idx` ⭐ (複合索引)
- `trades_user_id_commodity_id_trade_date_idx` ⭐
- 等等...

如果沒有看到複合索引，代表 `db push` 可能失敗了。

---

## 3. 優化 Connection Pooling

### 檢查連線池設定：

```typescript
// src/lib/prisma.ts (已配置)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,           // ✅ 適合 Supabase 免費版
  min: 1,           // ✅ 保持基本連線
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 30000,
})
```

### ⚠️ 注意事項：

Supabase 免費版限制：
- 最大 60 個並行連線（所有應用共享）
- 建議每個應用不超過 5-10 個連線

---

## 4. 時區查詢問題 (pg_timezone_names)

這個查詢可能來自：
1. Prisma 內部查詢
2. Supabase Dashboard 查詢
3. 某個擴展功能

### 🔍 排查步驟：

1. 在 Supabase Dashboard → Database → Query Performance
2. 點擊該查詢，查看「Query Text」完整內容
3. 檢查是否有「source: dashboard」或其他註解

### 💡 如果是您的程式碼：

可以快取時區資訊：

```typescript
let cachedTimezone: string | null = null

export async function getTimezone() {
  if (!cachedTimezone) {
    // 只查詢一次
    cachedTimezone = await queryTimezone()
  }
  return cachedTimezone
}
```

---

## 5. 監控建議

### A. 啟用 Prisma Query Log（開發環境）

```typescript
// src/lib/prisma.ts
export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']  // 顯示所有查詢
    : ['error'],
})
```

### B. 使用 Supabase Studio

1. Database → Query Performance
2. 定期檢查慢查詢（> 500ms）
3. 查看 cache hit rate（應該 > 95%）

### C. Vercel Analytics（生產環境）

1. 部署到 Vercel
2. 啟用 Speed Insights
3. 監控 API 回應時間

---

## 6. 效能基準測試

### 測試腳本：

```bash
# 測試 API 回應時間
curl -w "@curl-format.txt" -o /dev/null -s "https://your-app.vercel.app/api/trades/datatable"
```

### curl-format.txt 內容：

```
time_namelookup:  %{time_namelookup}s\n
time_connect:  %{time_connect}s\n
time_appconnect:  %{time_appconnect}s\n
time_pretransfer:  %{time_pretransfer}s\n
time_redirect:  %{time_redirect}s\n
time_starttransfer:  %{time_starttransfer}s\n
----------\n
time_total:  %{time_total}s\n
```

---

## 📊 優先級總結

| 優化項目 | 預期效果 | 執行難度 |
|---------|---------|---------|
| 1. 檢查並優化 RLS 規則 | ⚡⚡⚡ 大幅提升 UPDATE 速度 | ⭐ Easy |
| 2. 確認複合索引已部署 | ⚡⚡⚡ 大幅提升查詢速度 | ⭐ Easy |
| 3. 排查時區查詢來源 | ⚡⚡ 減少不必要的查詢 | ⭐⭐ Medium |
| 4. 啟用查詢日誌 | 📊 幫助診斷問題 | ⭐ Easy |

---

## ✅ 下一步行動

1. **立即執行**：檢查 Supabase RLS 規則
2. **確認**：索引是否正確部署
3. **監控**：啟用 Prisma query log
4. **測試**：重新測試 DataTable 載入速度

完成這些步驟後，UPDATE 速度應該會大幅改善！
