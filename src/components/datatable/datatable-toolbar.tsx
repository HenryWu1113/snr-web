/**
 * DataTable 工具列組件
 * 包含篩選器、欄位選擇器、匯出功能
 */

'use client'

import { useState, useEffect } from 'react'
import { Download, Settings2, Filter, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { DataTableFilters } from './datatable-filters'
import { exportToCSV, exportToExcel } from '@/lib/export'
import { toast } from 'sonner'
import type { TradeFilters, ColumnVisibility, ColumnDef, TradeWithRelations, MultiSortConfig } from '@/types/datatable'

interface DataTableToolbarProps {
  filters: TradeFilters
  onFiltersChange: (filters: TradeFilters) => void
  columnVisibility: ColumnVisibility
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void
  columns: ColumnDef<TradeWithRelations>[]
  data: TradeWithRelations[]
  sort: MultiSortConfig
  onRefresh?: () => void
  isLoading?: boolean  // ⚡ 新增：讓 refresh 按鈕旋轉
}

export function DataTableToolbar({
  filters,
  onFiltersChange,
  columnVisibility,
  onColumnVisibilityChange,
  columns,
  data,
  sort,
  onRefresh,
  isLoading,
}: DataTableToolbarProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showColumnDialog, setShowColumnDialog] = useState(false)  // ⚡ Dialog 狀態
  const [localColumnVisibility, setLocalColumnVisibility] = useState(columnVisibility)  // ⚡ 本地狀態

  // 當外部 columnVisibility 變更時同步
  useEffect(() => {
    setLocalColumnVisibility(columnVisibility)
  }, [columnVisibility])

  // 計算啟用的篩選器數量
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (Array.isArray(value)) return value.length > 0
    return value !== undefined && value !== null && value !== ''
  }).length

  // 處理匯出
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      setIsExporting(true)
      toast.info('正在準備匯出檔案...', { duration: 2000 })

      // 呼叫匯出 API 取得所有符合條件的資料
      const response = await fetch('/api/trades/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters, sort }),
      })

      if (!response.ok) {
        throw new Error('匯出失敗')
      }

      const { data: allData } = await response.json()
      
      if (!allData || allData.length === 0) {
        toast.warning('沒有可匯出的資料')
        return
      }

      const visibleCols = columns.filter((col) => columnVisibility[col.id])

      if (format === 'csv') {
        exportToCSV(allData, visibleCols, 'trades_export')
      } else {
        exportToExcel(allData, visibleCols, 'trades_export')
      }
      
      toast.success(`成功匯出 ${allData.length} 筆資料`)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('匯出失敗，請稍後再試')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 上方工具列 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* ⚡ 手動刷新按鈕 */}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              title="重新載入資料"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}

          {/* 篩選器按鈕 */}
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            篩選器
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* 清除所有篩選 */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFiltersChange({})}
            >
              <X className="mr-2 h-4 w-4" />
              清除篩選
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
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
                  onSelect={(e) => e.preventDefault()}
                >
                  {column.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 匯出功能 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isExporting}>
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? '匯出中...' : '匯出'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>選擇格式</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem onClick={() => handleExport('csv')}>
                匯出為 CSV
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem onClick={() => handleExport('excel')}>
                匯出為 Excel
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 篩選器面板 */}
      {showFilters && (
        <DataTableFilters filters={filters} onFiltersChange={onFiltersChange} />
      )}
    </div>
  )
}
