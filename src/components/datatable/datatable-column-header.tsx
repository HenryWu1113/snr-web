/**
 * DataTable 欄位標題組件（支援排序）
 */

'use client'

import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ColumnDef, MultiSortConfig } from '@/types/datatable'

interface DataTableColumnHeaderProps {
  column: ColumnDef
  sort: MultiSortConfig
  onSort: () => void
}

export function DataTableColumnHeader({ column, sort, onSort }: DataTableColumnHeaderProps) {
  if (!column.sortable) {
    return <div>{column.header}</div>
  }

  const sortState = sort.find((s) => s.field === column.id)
  const sortIndex = sort.findIndex((s) => s.field === column.id)

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={onSort}
    >
      <span>{column.header}</span>
      {sortState ? (
        <div className="ml-2 flex items-center gap-1">
          {sortState.direction === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
          {sort.length > 1 && (
            <span className="text-xs text-muted-foreground">
              {sortIndex + 1}
            </span>
          )}
        </div>
      ) : (
        <ChevronsUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  )
}
