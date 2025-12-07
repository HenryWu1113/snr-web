# ⚠️ DataTable React Query 重構 - 手動修復步驟

## 問題狀況

在自動重構過程中出現了一些格式問題，需要手動修復幾個地方。

---

## 🔧 需要手動修復的地方

### 1. **修復 line 145-150** (defaultFilters useEffect)

找到這段程式碼：
```typescript
  // 當 defaultFilters 變化時，更新 filters（但不重新載入偏好設定）
  useEffect(() => {
  // 渲染狀態
  if (!preferencesLoaded || isLoading) {
      setFilters((prev) => ({ ...prev, ...stableDefaultFilters }))
      setPage(1)
```

**改成**：
```typescript
  // 當 defaultFilters 變化時，更新 filters（但不重新載入偏好設定）
  useEffect(() => {
    if (preferencesLoaded) {
      setFilters((prev) => ({ ...prev, ...stableDefaultFilters }))
      setPage(1)
    }
  }, [stableDefaultFilters, preferencesLoaded])
```

---

### 2. **修復 DataTableToolbar** (大約 line 267-279)

找到這段：
```typescript
      <DataTableToolbar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        columnVisibility={columnVisibility}
          onColumnVisibilityChange={(vis) => {
            setColumnVisibility(vis)
            saveColumnVisibility(vis)
            // ⚡ 不需要重新載入！後端會回傳所有資料，前端只是改變顯示
          }}sort={sort}    // ← 錯誤！
        columns={TRADE_COLUMNS}
        data={data?.data || []}
        sort={sort}        // ← 重複！
      />
```

**改成**：
```typescript
      <DataTableToolbar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={(vis) => {
          setColumnVisibility(vis)
          saveColumnVisibility(vis)
          // ⚡ 不需要重新載入！後端會回傳所有資料，前端只是改變顯示
        }}
        columns={TRADE_COLUMNS}
        data={data?.data || []}
        sort={sort}
      />
```

---

### 3. **確認所有 `fetchData` 都已替換**

搜尋整個檔案，確保沒有剩餘的 `fetchData` 調用。應該都改成：
- `refetch()` - React Query 的重新載入
- 或直接移除（如 columnVisibility 變更時）

---

### 4. **確認 `loading` 都改成 `isLoading`**

搜尋 `loading`，確保都改成 `isLoading`

---

## ✅ 修復後測試

修復完成後：

1. 重新啟動 dev server
   ```bash
   npm run dev  
```

2. 檢查是否有任何 TypeScript 錯誤

3. 測試功能：
   - ✅ 載入交易資料
   - ✅ 切換頁面
   - ✅ 改變列數
   - ✅ 篩選資料
   - ✅ 改變欄位顯示（應該不會重新載入）
   - ✅ 編輯/刪除交易

---

## 🚀 完成後的優勢

- ⚡ 1 分鐘快取（切換頁面立即顯示）
- ⚡ 改變欄位顯示不重新載入（立即切換）
- ⚡ 手動刷新按鈕（接下來會加入）

---

## 📝 備註

如果手動修復有困難，可以：
1. 回到之前的 commit
2. 告訴我，我們用更保守的方式逐步修改

對不起造成困擾！😅
