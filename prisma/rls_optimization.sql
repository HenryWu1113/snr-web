-- =============================================
-- 個人專案 RLS 優化設定
-- 適用於：只有自己使用的交易日誌系統
-- =============================================

-- 第一步：移除所有現有的複雜 policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- 第二步：為每個表建立超簡單的 RLS 規則
-- =============================================

-- 1. Trades 表（主要資料）
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_own_trades"
ON trades FOR ALL
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

-- 2. Trade Entry Types（多對多關聯）
ALTER TABLE trade_entry_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_entry_types"
ON trade_entry_types FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM trades 
    WHERE trades.id = trade_entry_types.trade_id 
    AND trades.user_id = auth.uid()::text
  )
);

-- 3. Trade Tags（多對多關聯）
ALTER TABLE trade_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_trade_tags"
ON trade_tags FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM trades 
    WHERE trades.id = trade_tags.trade_id 
    AND trades.user_id = auth.uid()::text
  )
);

-- 4. Trade Collections（多對多關聯）
ALTER TABLE trade_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_trade_collections"
ON trade_collections FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM trades 
    WHERE trades.id = trade_collections.trade_id 
    AND trades.user_id = auth.uid()::text
  )
);

-- 5. Collections（收藏分類）
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_collections"
ON collections FOR ALL
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

-- 6. User Preferences（使用者設定）
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_preferences"
ON user_preferences FOR ALL
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

-- =============================================
-- 選項表（所有人都可以讀取，只有 service_role 可以寫入）
-- =============================================

-- 7. Commodities（商品）
ALTER TABLE commodities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone_read_commodities"
ON commodities FOR SELECT
USING (true);  -- 所有人都可以讀

CREATE POLICY "service_role_manage_commodities"
ON commodities FOR ALL
USING (auth.role() = 'service_role');

-- 8. Timeframes（時間框架）
ALTER TABLE timeframes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone_read_timeframes"
ON timeframes FOR SELECT
USING (true);

CREATE POLICY "service_role_manage_timeframes"
ON timeframes FOR ALL
USING (auth.role() = 'service_role');

-- 9. Entry Types（進場類型）
ALTER TABLE entry_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone_read_entry_types"
ON entry_types FOR SELECT
USING (true);

CREATE POLICY "service_role_manage_entry_types"
ON entry_types FOR ALL
USING (auth.role() = 'service_role');

-- 10. Trendline Types（趨勢線類型）
ALTER TABLE trendline_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone_read_trendline_types"
ON trendline_types FOR SELECT
USING (true);

CREATE POLICY "service_role_manage_trendline_types"
ON trendline_types FOR ALL
USING (auth.role() = 'service_role');

-- 11. Trade Types（交易類型）
ALTER TABLE trade_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone_read_trade_types"
ON trade_types FOR SELECT
USING (true);

CREATE POLICY "service_role_manage_trade_types"
ON trade_types FOR ALL
USING (auth.role() = 'service_role');

-- 12. Trading Tags（交易標籤）
ALTER TABLE trading_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone_read_trading_tags"
ON trading_tags FOR SELECT
USING (true);

CREATE POLICY "service_role_manage_trading_tags"
ON trading_tags FOR ALL
USING (auth.role() = 'service_role');

-- =============================================
-- 驗證設定
-- =============================================

-- 檢查所有表的 RLS 狀態
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 檢查所有 policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
