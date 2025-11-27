/**
 * DataTable 工具列組件
 * 包含篩選器、欄位選擇器、匯出功能
 */

'use client'

import { useState } from 'react'
import { Download, Settings2, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { DataTableFilters } from './datatable-filters'
import { exportToCSV, exportToExcel } from '@/lib/export'
import type { TradeFilters, ColumnVisibility, ColumnDef, TradeWithRelations } from '@/types/datatable'

interface DataTableToolbarProps {
  filters: TradeFilters
  onFiltersChange: (filters: TradeFilters) => void
  columnVisibility: ColumnVisibility
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void
  columns: ColumnDef<TradeWithRelations>[]
  data: TradeWithRelations[]
}

export function DataTableToolbar({
  filters,
  onFiltersChange,
  columnVisibility,
  onColumnVisibilityChange,
  columns,
  data,
}: DataTableToolbarProps) {
  const [showFilters, setShowFilters] = useState(false)

  // 計算啟用的篩選器數量
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (Array.isArray(value)) return value.length > 0
    return value !== undefined && value !== null && value !== ''
  }).length

  // 處理匯出
  const handleExport = async (format: 'csv' | 'excel') => {
    const visibleCols = columns.filter((col) => columnVisibility[col.id])

    if (format === 'csv') {
      exportToCSV(data, visibleCols, 'trades')
    } else {
      exportToExcel(data, visibleCols, 'trades')
    }
  }

  return (
    <div className="space-y-4">
      {/* 上方工具列 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
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
                >
                  {column.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 匯出功能 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                匯出
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
