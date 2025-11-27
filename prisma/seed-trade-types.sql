-- ==========================================
-- 初始交易類型資料
-- ==========================================

-- 插入交易類型選項
INSERT INTO trade_types (id, name, display_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), '實盤', 1, true, NOW(), NOW()),
  (gen_random_uuid(), '回測', 2, true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;
