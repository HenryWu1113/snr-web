-- ==========================================
-- Row Level Security (RLS) for user_preferences
-- ==========================================

-- 啟用 RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 政策 1: 使用者只能查看自己的設定
CREATE POLICY "Users can view own preferences"
ON user_preferences
FOR SELECT
USING (auth.uid()::text = user_id);

-- 政策 2: 使用者只能新增自己的設定
CREATE POLICY "Users can insert own preferences"
ON user_preferences
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- 政策 3: 使用者只能更新自己的設定
CREATE POLICY "Users can update own preferences"
ON user_preferences
FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- 政策 4: 使用者只能刪除自己的設定
CREATE POLICY "Users can delete own preferences"
ON user_preferences
FOR DELETE
USING (auth.uid()::text = user_id);
