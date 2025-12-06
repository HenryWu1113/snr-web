/**
 * 交易紀錄 DataTable 主組件
 * 整合分頁、排序、篩選、欄位選擇等功能
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Inbox, SearchX, Pencil, Trash2, Heart, Bookmark } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  TradeDataTableRequest,
  TradeDataTableResponse,
  MultiSortConfig,
  TradeFilters,
  ColumnVisibility,
  TradeWithRelations,
} from '@/types/datatable'
import { TRADE_COLUMNS, DEFAULT_VISIBLE_COLUMNS, DEFAULT_SORT } from '@/config/trade-columns'
import { DataTableToolbar } from './datatable-toolbar'
import { DataTableColumnHeader } from './datatable-column-header'
import { TradeModal } from '@/components/forms/trade-modal'
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirm-dialog'
import { CollectionDialog } from '@/components/dialogs/collection-dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface TradeDataTableProps {
  fixedFilters?: TradeFilters  // 固定過濾條件，不會被清空篩選器影響
  defaultFilters?: TradeFilters
  onTradeUpdate?: () => void
  onTradeDelete?: () => void
}

export function TradeDataTable({ 
  fixedFilters = {},
  defaultFilters = {},
  onTradeUpdate,
  onTradeDelete 
}: TradeDataTableProps = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 狀態管理
  const [data, setData] = useState<TradeDataTableResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [preferencesLoaded, setPreferencesLoaded] = useState(false)

  // DataTable 參數
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sort, setSort] = useState<MultiSortConfig>(DEFAULT_SORT)
  const [filters, setFilters] = useState<TradeFilters>(defaultFilters)
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(
    DEFAULT_VISIBLE_COLUMNS.reduce((acc, id) => ({ ...acc, [id]: true }), {})
  )

  // 編輯和刪除相關狀態
  const [editingTrade, setEditingTrade] = useState<TradeWithRelations | null>(null)
  const [deletingTradeId, setDeletingTradeId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [collectionTradeId, setCollectionTradeId] = useState<string | null>(null)

  // 從資料庫載入使用者設定
  useEffect(() => {
    async function loadPreferences() {
      try {
        const [columnsRes, filtersRes] = await Promise.all([
          fetch('/api/preferences?type=datatable_columns'),
          fetch('/api/preferences?type=datatable_filters'),
        ])

        if (columnsRes.ok) {
          const { settings } = await columnsRes.json()
          if (settings) {
            setColumnVisibility(settings)
          }
        }

        if (filtersRes.ok) {
          const { settings } = await filtersRes.json()
          // 合併 defaultFilters 和儲存的 settings，defaultFilters 優先
          if (settings) {
            setFilters({ ...settings, ...defaultFilters })
          } else {
            setFilters(defaultFilters)
          }
        } else {
          setFilters(defaultFilters)
        }
      } catch (err) {
        console.error('Failed to load preferences:', err)
      } finally {
        // 標記偏好設定已載入完成
        setPreferencesLoaded(true)
      }
    }

    loadPreferences()
  }, [])

  // 將 defaultFilters 和 fixedFilters 序列化以穩定依賴
  const defaultFiltersKey = JSON.stringify(defaultFilters)
  const fixedFiltersKey = JSON.stringify(fixedFilters)

  // 當 defaultFilters 變化時，更新 filters
  useEffect(() => {
    if (preferencesLoaded) {
      setFilters((prev) => ({ ...prev, ...defaultFilters }))
      setPage(1) // 重置到第一頁
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultFiltersKey, preferencesLoaded])

  // 儲存欄位可見性設定
  const saveColumnVisibility = useCallback(async (visibility: ColumnVisibility) => {
    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'datatable_columns',
          settings: visibility,
        }),
      })
    } catch (err) {
      console.error('Failed to save column visibility:', err)
    }
  }, [])

  // 儲存篩選條件設定
  const saveFilters = useCallback(async (filters: TradeFilters) => {
    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'datatable_filters',
          settings: filters,
        }),
      })
    } catch (err) {
      console.error('Failed to save filters:', err)
    }
  }, [])

  // 載入資料
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    // 合併 filters 和 fixedFilters，fixedFilters 優先（不會被清空）
    const mergedFilters = { ...filters, ...fixedFilters }

    const request: TradeDataTableRequest = {
      pagination: { page, pageSize },
      sort,
      filters: mergedFilters,
      columnVisibility,
    }

    try {
      const response = await fetch('/api/trades/datatable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }

      const result: TradeDataTableResponse = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, sort, filters, fixedFiltersKey, columnVisibility])

  // 當參數變化時重新載入資料（等待偏好設定載入完成）
  useEffect(() => {
    if (preferencesLoaded) {
      fetchData()
    }
  }, [fetchData, preferencesLoaded])

  // 處理排序
  const handleSort = (field: string) => {
    const column = TRADE_COLUMNS.find((col) => col.id === field)
    if (!column?.sortable) return

    setSort((prev) => {
      const existing = prev.find((s) => s.field === field)

      if (existing) {
        // 切換排序方向：asc -> desc -> remove
        if (existing.direction === 'asc') {
          return prev.map((s) => (s.field === field ? { ...s, direction: 'desc' as const } : s))
        } else {
          return prev.filter((s) => s.field !== field)
        }
      } else {
        // 新增排序
        return [...prev, { field, direction: 'asc' as const }]
      }
    })

    setPage(1) // 重置到第一頁
  }

  // 處理欄位可見性切換
  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    const newVisibility = { ...columnVisibility, [columnId]: visible }
    setColumnVisibility(newVisibility)
    saveColumnVisibility(newVisibility)
  }

  // 處理篩選器變更
  const handleFiltersChange = (newFilters: TradeFilters) => {
    setFilters(newFilters)
    setPage(1)
    saveFilters(newFilters)
  }

  // 處理編輯
  const handleEdit = (trade: TradeWithRelations) => {
    setEditingTrade(trade)
  }

  // 處理刪除
  const handleDelete = async () => {
    if (!deletingTradeId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/trades/${deletingTradeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete trade')
      }

      // 刪除成功，重新載入資料
      await fetchData()
      setDeletingTradeId(null)
      onTradeDelete?.()
    } catch (error) {
      console.error('Delete error:', error)
      alert('刪除失敗')
    } finally {
      setIsDeleting(false)
    }
  }

  // 處理頁面大小變更
  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize))
    setPage(1) // 重置到第一頁
  }

  // 可見欄位
  const visibleColumns = TRADE_COLUMNS.filter((col) => columnVisibility[col.id])

  return (
    <div className="space-y-4">
      {/* 工具列（篩選器、欄位選擇、匯出） */}
      <DataTableToolbar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        columns={TRADE_COLUMNS}
        data={data?.data || []}
        sort={sort}
      />

      {/* 表格 */}
      <Card className="py-2 gap-0">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                {visibleColumns.map((column) => (
                  <TableHead key={column.id} style={{ width: column.width }}>
                    <DataTableColumnHeader
                      column={column}
                      sort={sort}
                      onSort={() => handleSort(column.id)}
                    />
                  </TableHead>
                ))}
                <TableHead style={{ width: 140 }}>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Skeleton loading rows
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {visibleColumns.map((column) => (
                      <TableCell key={column.id}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                    <TableCell>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length + 1} className="h-48">
                    <div className="flex flex-col items-center justify-center gap-3 text-destructive">
                      <SearchX className="h-12 w-12 opacity-50" />
                      <div className="text-center">
                        <p className="font-semibold">載入失敗</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data && data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length + 1} className="h-48">
                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <Inbox className="h-16 w-16 opacity-30" />
                      <div className="text-center">
                        <p className="font-semibold text-lg">沒有符合條件的資料</p>
                        <p className="text-sm">
                          {Object.keys(filters).length > 0 
                            ? '嘗試調整篩選條件，或新增您的第一筆交易紀錄'
                            : '開始記錄您的交易，建立專業的交易日誌'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((row) => (
                  <TableRow key={row.id}>
                    {visibleColumns.map((column) => (
                      <TableCell key={column.id}>
                        {column.format
                          ? column.format((row as any)[column.field], row)
                          : String((row as any)[column.field] ?? '-')}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* 喜歡按鈕 */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/trades/${row.id}/favorite`, {
                                method: 'PATCH',
                              })
                              if (!res.ok) throw new Error('Failed to toggle favorite')
                              await fetchData()
                              toast.success(
                                row.isFavorite ? '已取消喜歡' : '已加入喜歡'
                              )
                              onTradeUpdate?.()
                            } catch (error) {
                              toast.error('操作失敗')
                            }
                          }}
                          className="h-8 w-8 p-0"
                          title={row.isFavorite ? '取消喜歡' : '加入喜歡'}
                        >
                          <Heart
                            className={cn(
                              'h-4 w-4',
                              row.isFavorite && 'fill-red-500 text-red-500'
                            )}
                          />
                        </Button>
                        {/* 收藏按鈕 */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCollectionTradeId(row.id)}
                          className="h-8 w-8 p-0"
                          title="加入收藏"
                        >
                          <Bookmark
                            className={cn(
                              'h-4 w-4',
                              row.collectionCount > 0 && 'fill-yellow-500 text-yellow-500'
                            )}
                          />
                        </Button>
                        {/* 編輯按鈕 */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(row)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {/* 刪除按鈕 */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingTradeId(row.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 分頁控制 */}
        {data && (
          <div className="flex items-center justify-between px-4 py-2 border-t">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                顯示第 {(data.meta.currentPage - 1) * data.meta.pageSize + 1} -{' '}
                {Math.min(data.meta.currentPage * data.meta.pageSize, data.meta.totalRecords)} 筆，
                共 {data.meta.totalRecords} 筆
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">每頁顯示</span>
                <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-[70px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">筆</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(1)}
                disabled={!data.meta.hasPreviousPage}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={!data.meta.hasPreviousPage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm">
                第 {data.meta.currentPage} / {data.meta.totalPages} 頁
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.meta.hasNextPage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(data.meta.totalPages)}
                disabled={!data.meta.hasNextPage}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 編輯對話框 */}
      <TradeModal
        open={!!editingTrade}
        onOpenChange={(open) => !open && setEditingTrade(null)}
        onSuccess={() => {
          fetchData()
          setEditingTrade(null)
          onTradeUpdate?.()
        }}
        trade={editingTrade}
      />

      {/* 刪除確認對話框 */}
      <DeleteConfirmDialog
        open={!!deletingTradeId}
        onOpenChange={(open) => !open && setDeletingTradeId(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="確定要刪除這筆交易紀錄嗎？"
        description="刪除後將無法復原，所有相關的交易數據都會被永久刪除。"
      />

      {/* 收藏選擇對話框 */}
      <CollectionDialog
        tradeId={collectionTradeId}
        open={!!collectionTradeId}
        onOpenChange={(open) => !open && setCollectionTradeId(null)}
        onSuccess={() => {
          fetchData()
          onTradeUpdate?.()
        }}
      />
    </div>
  )
}
