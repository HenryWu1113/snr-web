-- 清除 DataTable 相關的使用者偏好設定
-- 用於修復 schema 變更後的欄位名稱不匹配問題

-- 查看現有的偏好設定（執行前先看看）
SELECT * FROM user_preferences
WHERE type LIKE '%datatable%'
   OR type LIKE '%trade%'
   OR type LIKE '%column%'
   OR type LIKE '%sort%';

-- 刪除所有 datatable 相關的偏好設定
DELETE FROM user_preferences
WHERE type LIKE '%datatable%'
   OR type LIKE '%trade%'
   OR type LIKE '%column%'
   OR type LIKE '%sort%';
