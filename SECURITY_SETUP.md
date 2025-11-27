# 安全性設定指南

## RLS (Row Level Security) 政策

### 問題說明

當你看到 "Data is publicly accessible via API as RLS is disabled" 警告時，表示該資料表沒有啟用 RLS，任何人都可以透過 API 存取資料。

### 解決方案

1. 前往 Supabase Dashboard
2. 選擇你的專案
3. 點擊左側選單的 **SQL Editor**
4. 執行以下 SQL 腳本

## User Preferences 資料表 RLS 政策

```sql
-- 啟用 RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 政策 1: 使用者只能查看自己的設定
CREATE POLICY "Users can view own preferences"
ON user_preferences
FOR SELECT
USING (auth.uid() = user_id);

-- 政策 2: 使用者只能新增自己的設定
CREATE POLICY "Users can insert own preferences"
ON user_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 政策 3: 使用者只能更新自己的設定
CREATE POLICY "Users can update own preferences"
ON user_preferences
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 政策 4: 使用者只能刪除自己的設定
CREATE POLICY "Users can delete own preferences"
ON user_preferences
FOR DELETE
USING (auth.uid() = user_id);
```

## 驗證 RLS 是否啟用

執行以下 SQL 來檢查 RLS 狀態：

```sql
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('user_preferences', 'trades', 'commodities', 'timeframes', 'setup_ratings', 'entry_types', 'trendline_types');
```

所有資料表的 `rowsecurity` 應該顯示 `true`。

## 已設定 RLS 的資料表

根據 `prisma/rls-policies.sql`，以下資料表已經有 RLS：

- ✅ `trades` - 使用者只能存取自己的交易紀錄
- ✅ `commodities` - 所有使用者可讀，只有認證使用者可新增/修改
- ✅ `timeframes` - 所有使用者可讀，只有認證使用者可新增/修改
- ✅ `setup_ratings` - 所有使用者可讀，只有認證使用者可新增/修改
- ✅ `entry_types` - 所有使用者可讀，只有認證使用者可新增/修改
- ✅ `trendline_types` - 所有使用者可讀，只有認證使用者可新增/修改
- ✅ `trade_setup_ratings` - 透過 trades 間接保護
- ✅ `trade_entry_types` - 透過 trades 間接保護

## 新增的資料表

- ⚠️ `user_preferences` - **需要執行上方的 SQL**

## 安全性最佳實踐

1. **永遠啟用 RLS** - 所有包含使用者資料的資料表都應該啟用 RLS
2. **最小權限原則** - 只給予使用者最低限度的必要權限
3. **測試政策** - 使用不同帳號測試是否能存取其他使用者的資料
4. **定期檢查** - 定期檢查所有資料表的 RLS 狀態

## 快速檢查腳本

在 Supabase SQL Editor 執行：

```sql
-- 列出所有沒有啟用 RLS 的資料表
SELECT
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false;
```

如果有任何資料表出現在結果中，應該檢查是否需要啟用 RLS。
