-- ==========================================
-- Row Level Security (RLS) 政策設定
-- ==========================================
-- 在 Supabase Dashboard > SQL Editor 中執行此腳本

-- 1. 啟用 trades 表的 RLS
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- 2. 建立 trades 表的 RLS 政策

-- 使用者只能查看自己的交易紀錄
CREATE POLICY "Users can view own trades" ON trades
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- 使用者只能新增自己的交易紀錄
CREATE POLICY "Users can insert own trades" ON trades
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- 使用者只能更新自己的交易紀錄
CREATE POLICY "Users can update own trades" ON trades
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- 使用者只能刪除自己的交易紀錄
CREATE POLICY "Users can delete own trades" ON trades
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- 3. 啟用選項管理表的 RLS（所有人可讀）

-- Commodities（交易商品）
ALTER TABLE commodities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read commodities" ON commodities
  FOR SELECT
  USING (true);

-- Timeframes（時間框架）
ALTER TABLE timeframes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read timeframes" ON timeframes
  FOR SELECT
  USING (true);

-- Setup Ratings（盤勢評分）
ALTER TABLE setup_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read setup_ratings" ON setup_ratings
  FOR SELECT
  USING (true);

-- Entry Types（進場方式）
ALTER TABLE entry_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read entry_types" ON entry_types
  FOR SELECT
  USING (true);

-- Trendline Types（趨勢線型態）
ALTER TABLE trendline_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read trendline_types" ON trendline_types
  FOR SELECT
  USING (true);

-- 4. 啟用多對多關聯表的 RLS

-- Trade Setup Ratings（透過 trade_id 檢查）
ALTER TABLE trade_setup_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own trade setup ratings" ON trade_setup_ratings
  USING (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = trade_setup_ratings.trade_id
      AND trades.user_id = auth.uid()::text
    )
  );

-- Trade Entry Types（透過 trade_id 檢查）
ALTER TABLE trade_entry_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own trade entry types" ON trade_entry_types
  USING (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = trade_entry_types.trade_id
      AND trades.user_id = auth.uid()::text
    )
  );
