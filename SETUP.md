# SNR Web - 專案設定指南

## 1. 建立 Supabase 專案

### 1.1 註冊並建立專案

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 點擊「New Project」建立新專案
3. 填寫專案資訊：
   - Name: `snr-web` (或任意名稱)
   - Database Password: 設定一個強密碼（請記住此密碼）
   - Region: 選擇 `Southeast Asia (Singapore)` 或最接近的區域
4. 等待專案建立完成（約 2-3 分鐘）

### 1.2 取得連線資訊

建立完成後，前往 **Project Settings > API**：

1. 複製 `Project URL` → 這是你的 `NEXT_PUBLIC_SUPABASE_URL`
2. 複製 `anon public` key → 這是你的 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. 複製 `service_role` key → 這是你的 `SUPABASE_SERVICE_ROLE_KEY`（⚠️ 保密）

前往 **Project Settings > Database > Connection String**：

1. 選擇「Session mode (connection pooling)」並複製 **URI** → 這是你的 `DATABASE_URL`
   - 確保選擇「Session mode」
   - Port: `6543`
   - 將 `[YOUR-PASSWORD]` 替換為你的資料庫密碼
   - 連線字串格式：`postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

## 2. 設定環境變數

建立 `.env.local` 檔案並填入以下資訊：

```env
# Supabase 設定（必填）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase 資料庫連線（用於 Prisma）
DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Supabase Service Role Key（後端專用）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 時區設定
TIMEZONE=Asia/Taipei

# Cloudinary 圖片上傳（後續設定）
# NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret
```

⚠️ **重要**：
- `.env.local` 已加入 `.gitignore`，不會被提交到版本控制
- `SUPABASE_SERVICE_ROLE_KEY` 僅在伺服器端使用，切勿暴露至前端

## 3. 執行資料庫遷移

### 3.1 生成 Prisma Client

```bash
npx prisma generate
```

### 3.2 推送 Schema 至 Supabase

```bash
npx prisma db push
```

這會在 Supabase 資料庫中建立所有資料表。

### 3.3 （選用）執行正式 Migration

如果想要建立 migration 歷史紀錄：

```bash
npx prisma migrate dev --name init
```

## 4. 設定 Row Level Security (RLS)

### 4.1 在 Supabase Dashboard 中設定 RLS

前往 **SQL Editor**，執行以下 SQL：

```sql
-- 啟用 RLS
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- 使用者只能查看自己的交易紀錄
CREATE POLICY "Users can view own trades" ON trades
  FOR SELECT USING (auth.uid() = user_id);

-- 使用者只能新增自己的交易紀錄
CREATE POLICY "Users can insert own trades" ON trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 使用者只能更新自己的交易紀錄
CREATE POLICY "Users can update own trades" ON trades
  FOR UPDATE USING (auth.uid() = user_id);

-- 使用者只能刪除自己的交易紀錄
CREATE POLICY "Users can delete own trades" ON trades
  FOR DELETE USING (auth.uid() = user_id);
```

### 4.2 設定選項管理表的 RLS（選用）

如果需要限制選項管理表的存取：

```sql
-- 所有使用者都可以讀取選項
ALTER TABLE commodities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read commodities" ON commodities
  FOR SELECT USING (true);

ALTER TABLE timeframes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read timeframes" ON timeframes
  FOR SELECT USING (true);

ALTER TABLE setup_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read setup_ratings" ON setup_ratings
  FOR SELECT USING (true);

ALTER TABLE entry_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read entry_types" ON entry_types
  FOR SELECT USING (true);

ALTER TABLE trendline_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read trendline_types" ON trendline_types
  FOR SELECT USING (true);
```

## 5. 設定 Supabase Authentication

### 5.1 啟用 Email/Password 認證

前往 **Authentication > Providers**：

1. 確認「Email」已啟用
2. （選用）停用「Confirm email」以加速開發（生產環境建議啟用）

### 5.2（選用）設定 GitHub OAuth

如果要啟用 GitHub 登入：

1. 前往 [GitHub Developer Settings](https://github.com/settings/developers)
2. 建立新的 OAuth App：
   - Application name: `SNR Web`
   - Homepage URL: `http://localhost:3000`（開發環境）
   - Authorization callback URL: `https://[PROJECT-REF].supabase.co/auth/v1/callback`
3. 取得 `Client ID` 和 `Client Secret`
4. 在 Supabase Dashboard > **Authentication > Providers** > **GitHub**：
   - 啟用 GitHub
   - 填入 Client ID 和 Client Secret
   - 儲存

## 6. 初始化資料（選用）

建立一些初始選項資料，方便測試。前往 **SQL Editor** 執行：

```sql
-- 插入交易商品
INSERT INTO commodities (name, display_order) VALUES
  ('NQ (Nasdaq 100)', 1),
  ('ES (S&P 500)', 2),
  ('YM (Dow Jones)', 3),
  ('RTY (Russell 2000)', 4),
  ('ZN (10-Year T-Note)', 5);

-- 插入時間框架
INSERT INTO timeframes (name, display_order) VALUES
  ('1分鐘', 1),
  ('5分鐘', 2),
  ('15分鐘', 3),
  ('30分鐘', 4),
  ('1小時', 5),
  ('4小時', 6),
  ('日線', 7);

-- 插入盤勢評分
INSERT INTO setup_ratings (name, display_order) VALUES
  ('A+ (極佳)', 1),
  ('A (優秀)', 2),
  ('B (良好)', 3),
  ('C (普通)', 4),
  ('D (不佳)', 5);

-- 插入進場方式
INSERT INTO entry_types (name, display_order) VALUES
  ('突破進場', 1),
  ('回測進場', 2),
  ('反轉進場', 3),
  ('趨勢追蹤', 4),
  ('區間交易', 5);

-- 插入趨勢線型態
INSERT INTO trendline_types (name, display_order) VALUES
  ('上升趨勢', 1),
  ('下降趨勢', 2),
  ('橫向盤整', 3),
  ('突破型態', 4),
  ('反轉型態', 5);
```

## 7. 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器前往 [http://localhost:3000](http://localhost:3000)

## 8. 驗證設定

### 8.1 檢查 Prisma 連線

```bash
npx prisma studio
```

這會開啟 Prisma Studio，你可以在瀏覽器中查看和管理資料庫。

### 8.2 檢查 Supabase 連線

建立測試檔案 `src/app/api/test/route.ts`：

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    message: 'Supabase connection successful',
    session: data.session ? 'Active' : 'None'
  })
}
```

前往 [http://localhost:3000/api/test](http://localhost:3000/api/test) 檢查連線。

## 9. 下一步

設定完成後，你可以開始：

1. ✅ 建立登入/註冊頁面
2. ✅ 實作交易紀錄 CRUD 功能
3. ✅ 建立儀表板與分析功能

參考 [REQUIREMENTS.md](./REQUIREMENTS.md) 的開發優先順序進行開發。

## 常見問題

### Q: Prisma 連線失敗

**A:** 檢查 `DATABASE_URL` 和 `DIRECT_URL` 是否正確，確保密碼已替換。

### Q: Supabase Auth 錯誤

**A:** 確認 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是否正確。

### Q: RLS 導致查詢失敗

**A:** 確保已設定正確的 RLS 政策，或在開發階段暫時關閉 RLS：
```sql
ALTER TABLE trades DISABLE ROW LEVEL SECURITY;
```

### Q: Migration 錯誤

**A:** 刪除 `prisma/migrations` 資料夾並重新執行 `npx prisma db push`。

## 相關資源

- [Supabase 文件](https://supabase.com/docs)
- [Prisma 文件](https://www.prisma.io/docs)
- [Next.js 文件](https://nextjs.org/docs)
