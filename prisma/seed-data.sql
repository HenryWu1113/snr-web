-- ==========================================
-- 初始化基礎選項資料
-- ==========================================
-- 在 Supabase Dashboard > SQL Editor 中執行此腳本

-- 1. 插入交易商品（Commodities）
INSERT INTO commodities (id, name, "displayOrder", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'NQ (Nasdaq 100)', 1, NOW(), NOW()),
  (gen_random_uuid(), 'ES (S&P 500)', 2, NOW(), NOW()),
  (gen_random_uuid(), 'YM (Dow Jones)', 3, NOW(), NOW()),
  (gen_random_uuid(), 'RTY (Russell 2000)', 4, NOW(), NOW()),
  (gen_random_uuid(), 'ZN (10-Year T-Note)', 5, NOW(), NOW()),
  (gen_random_uuid(), 'GC (Gold)', 6, NOW(), NOW()),
  (gen_random_uuid(), 'CL (Crude Oil)', 7, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 2. 插入時間框架（Timeframes）
INSERT INTO timeframes (id, name, "displayOrder", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), '1分鐘', 1, NOW(), NOW()),
  (gen_random_uuid(), '5分鐘', 2, NOW(), NOW()),
  (gen_random_uuid(), '15分鐘', 3, NOW(), NOW()),
  (gen_random_uuid(), '30分鐘', 4, NOW(), NOW()),
  (gen_random_uuid(), '1小時', 5, NOW(), NOW()),
  (gen_random_uuid(), '4小時', 6, NOW(), NOW()),
  (gen_random_uuid(), '日線', 7, NOW(), NOW()),
  (gen_random_uuid(), '週線', 8, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 3. 插入盤勢評分（Setup Ratings）
INSERT INTO setup_ratings (id, name, "displayOrder", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'A+ (極佳)', 1, NOW(), NOW()),
  (gen_random_uuid(), 'A (優秀)', 2, NOW(), NOW()),
  (gen_random_uuid(), 'B (良好)', 3, NOW(), NOW()),
  (gen_random_uuid(), 'C (普通)', 4, NOW(), NOW()),
  (gen_random_uuid(), 'D (不佳)', 5, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 4. 插入進場方式（Entry Types）
INSERT INTO entry_types (id, name, "displayOrder", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), '突破進場', 1, NOW(), NOW()),
  (gen_random_uuid(), '回測進場', 2, NOW(), NOW()),
  (gen_random_uuid(), '反轉進場', 3, NOW(), NOW()),
  (gen_random_uuid(), '趨勢追蹤', 4, NOW(), NOW()),
  (gen_random_uuid(), '區間交易', 5, NOW(), NOW()),
  (gen_random_uuid(), '假突破', 6, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 5. 插入趨勢線型態（Trendline Types）
INSERT INTO trendline_types (id, name, "displayOrder", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), '上升趨勢', 1, NOW(), NOW()),
  (gen_random_uuid(), '下降趨勢', 2, NOW(), NOW()),
  (gen_random_uuid(), '橫向盤整', 3, NOW(), NOW()),
  (gen_random_uuid(), '突破型態', 4, NOW(), NOW()),
  (gen_random_uuid(), '反轉型態', 5, NOW(), NOW()),
  (gen_random_uuid(), '三角收斂', 6, NOW(), NOW()),
  (gen_random_uuid(), '頭肩型態', 7, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 6. 驗證插入結果
SELECT 'Commodities' as table_name, COUNT(*) as count FROM commodities
UNION ALL
SELECT 'Timeframes', COUNT(*) FROM timeframes
UNION ALL
SELECT 'Setup Ratings', COUNT(*) FROM setup_ratings
UNION ALL
SELECT 'Entry Types', COUNT(*) FROM entry_types
UNION ALL
SELECT 'Trendline Types', COUNT(*) FROM trendline_types;
