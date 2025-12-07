# 🎯 最後的修復步驟

## ✅ 已完成

1. ✅ 加入 Loading 遮罩 - `trade-datatable.tsx` 已更新
2. ⏳ 欄位選擇改成 Dialog - 需要手動完成最後步驟

---

## 🔧 需要手動修復

### 1. 修復 `datatable-toolbar.tsx` Line 63

找到這行：
```typescript
useState(() => {
```

改成：
```typescript
useEffect(() => {
```

---

### 2. 完成欄位選擇 Dialog

找到約 Line 160-178 的欄位選擇器：

```typescript
{/* 欄位選擇器 */}
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm">
      <Settings2 className="mr-2 h-4 w-4" />
      欄位
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-[200px]">
    <DropdownMenuLabel>顯示欄位</DropdownMenuLabel>
    <DropdownMenuSeparator />
    {columns.map((column) => (
      <DropdownMenuCheckboxItem
        key={column.id}
        checked={columnVisibility[column.id] ?? false}
        onCheckedChange={(checked) =>
          onColumnVisibilityChange(column.id, checked)
        }
      >
        {column.header}
      </DropdownMenuCheckboxItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

**完整替換成**：

```tsx
{/* ⚡ 欄位選擇器 - 改用 Dialog */}
<Dialog open={showColumnDialog} onOpenChange={setShowColumnDialog}>
  <DialogTrigger asChild>
    <Button variant="outline" size="sm">
      <Settings2 className="mr-2 h-4 w-4" />
      欄位
    </Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>顯示欄位</DialogTitle>
      <DialogDescription>
        選擇要在表格中顯示的欄位
      </DialogDescription>
    </DialogHeader>
    
    <div className="grid gap-3 py-4 max-h-[400px] overflow-y-auto">
      {columns.map((column) => (
        <div key={column.id} className="flex items-center space-x-2">
          <Checkbox
            id={column.id}
            checked={localColumnVisibility[column.id] ?? false}
            onCheckedChange={(checked) =>
              setLocalColumnVisibility(prev => ({
                ...prev,
                [column.id]: checked
              }))
            }
          />
          <Label
            htmlFor={column.id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {column.header}
          </Label>
        </div>
      ))}
    </div>
    
    <DialogFooter>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          // 取消 - 恢復原始狀態
          setLocalColumnVisibility(columnVisibility)
          setShowColumnDialog(false)
        }}
      >
        取消
      </Button>
      <Button
        type="button"
        onClick={() => {
          // 套用 - 批次更新所有欄位
          Object.entries(localColumnVisibility).forEach(([columnId, visible]) => {
            if (columnVisibility[columnId] !== visible) {
              onColumnVisibilityChange(columnId, visible)
            }
          })
          setShowColumnDialog(false)
        }}
      >
        套用
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 🎯 這樣做的好處

### **Loading 遮罩**
- ✅ 換頁時會看到半透明遮罩
- ✅ 有轉圈圈動畫
- ✅ 顯示「載入中...」文字

### **欄位選擇 Dialog**
- ✅ 可以一次選好多個欄位
- ✅ 按「套用」才生效
- ✅ 按「取消」會恢復原狀
- ✅ **不會重新載入資料**（因為是前端篩選）

---

## 🧪 測試步驟

### 1. Loading 遮罩
1. 重新啟動 dev server
2. 載入頁面
3. 換頁或篩選
4. 應該會看到半透明遮罩

### 2. 欄位選擇
1. 點擊「欄位」按鈕
2. 勾選/取消勾選幾個欄位
3. 表格**不應該**立即變化
4. 點「套用」→ 欄位馬上切換
5. 點「取消」→ 恢復原狀

---

## 💡 如果還有問題

1. **useState 改 useEffect 錯誤還在**
   - 重啟 TypeScript 伺服器
   - 或重啟 VS Code

2. **Dialog 不顯示**
   - 檢查 imports 是否正確
   - 確認 `showColumnDialog` 狀態已加入

---

完成後享受絲滑體驗！🚀
