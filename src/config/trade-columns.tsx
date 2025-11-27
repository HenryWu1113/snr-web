/**
 * 交易紀錄 DataTable 欄位定義
 */

import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import type { ColumnDef } from '@/types/datatable'
import type { TradeWithRelations } from '@/types/datatable'

export const TRADE_COLUMNS: ColumnDef<TradeWithRelations>[] = [
  {
    id: 'tradeDate',
    field: 'tradeDate',
    header: '交易日',
    sortable: true,
    filterable: true,
    type: 'date',
    visible: true,
    width: 120,
    format: (value: Date) => format(new Date(value), 'yyyy/MM/dd', { locale: zhTW }),
  },
  {
    id: 'orderDate',
    field: 'orderDate',
    header: '下單日',
    sortable: true,
    filterable: true,
    type: 'date',
    visible: true,
    width: 120,
    format: (value: Date) => format(new Date(value), 'yyyy/MM/dd', { locale: zhTW }),
  },
  {
    id: 'tradeType',
    field: 'tradeType',
    header: '交易類型',
    sortable: true,
    filterable: true,
    type: 'string',
    visible: true,
    width: 100,
    format: (value: { name: string } | null) => value?.name || '-',
  },
  {
    id: 'commodity',
    field: 'commodity',
    header: '商品',
    sortable: true,
    filterable: true,
    type: 'string',
    visible: true,
    width: 100,
    format: (value: { name: string } | null) => value?.name || '-',
  },
  {
    id: 'timeframe',
    field: 'timeframe',
    header: '時間框架',
    sortable: true,
    filterable: true,
    type: 'string',
    visible: true,
    width: 100,
    format: (value: { name: string } | null) => value?.name || '-',
  },
  {
    id: 'entryTypes',
    field: 'entryTypes',
    header: '進場模式',
    sortable: false,
    filterable: true,
    type: 'string',
    visible: true,
    width: 150,
    format: (value: Array<{ name: string }>) =>
      value.map((e) => e.name).join(', ') || '-',
  },
  {
    id: 'trendlineType',
    field: 'trendlineType',
    header: '趨勢線',
    sortable: true,
    filterable: true,
    type: 'string',
    visible: false,
    width: 100,
    format: (value: { name: string } | null) => value?.name || '-',
  },
  {
    id: 'stopLossTicks',
    field: 'stopLossTicks',
    header: '止損 Ticks',
    sortable: true,
    filterable: false,
    type: 'number',
    visible: true,
    width: 100,
  },
  {
    id: 'targetRRatio',
    field: 'targetRRatio',
    header: '目標 RR',
    sortable: false,
    filterable: false,
    type: 'string',
    visible: true,
    width: 100,
  },
  {
    id: 'actualRMultiple',
    field: 'actualRMultiple',
    header: '實際 R',
    sortable: true,
    filterable: false,
    type: 'number',
    visible: true,
    width: 100,
    format: (value: number) => {
      const formatted = value.toFixed(2) + 'R'
      if (value > 0) {
        return <span className="text-green-600 dark:text-green-400 font-medium">{formatted}</span>
      } else if (value < 0) {
        return <span className="text-red-600 dark:text-red-400 font-medium">{formatted}</span>
      }
      return <span className="text-muted-foreground">{formatted}</span>
    },
  },
  {
    id: 'profitLoss',
    field: 'profitLoss',
    header: '損益',
    sortable: true,
    filterable: false,
    type: 'number',
    visible: true,
    width: 100,
    format: (value: number) => {
      const formatted = value >= 0 ? `+${value.toFixed(0)}` : value.toFixed(0)
      if (value > 0) {
        return <span className="text-green-600 dark:text-green-400 font-medium">{formatted}</span>
      } else if (value < 0) {
        return <span className="text-red-600 dark:text-red-400 font-medium">{formatted}</span>
      }
      return <span className="text-muted-foreground">{formatted}</span>
    },
  },
  {
    id: 'winLoss',
    field: 'winLoss',
    header: '結果',
    sortable: true,
    filterable: true,
    type: 'enum',
    visible: true,
    width: 80,
    filterOptions: [
      { label: '勝', value: 'win' },
      { label: '敗', value: 'loss' },
      { label: '平', value: 'breakeven' },
    ],
    format: (value: 'win' | 'loss' | 'breakeven') => {
      const labels = {
        win: '勝',
        loss: '敗',
        breakeven: '平',
      }
      const colors = {
        win: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950',
        loss: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950',
        breakeven: 'text-muted-foreground bg-muted',
      }
      return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${colors[value]}`}>
          {labels[value]}
        </span>
      )
    },
  },
  {
    id: 'actualExitTicks',
    field: 'actualExitTicks',
    header: '出場 Ticks',
    sortable: true,
    filterable: false,
    type: 'number',
    visible: false,
    width: 100,
  },
  {
    id: 'targetTicks',
    field: 'targetTicks',
    header: '目標 Ticks',
    sortable: false,
    filterable: false,
    type: 'number',
    visible: false,
    width: 100,
  },
  {
    id: 'notes',
    field: 'notes',
    header: '備註',
    sortable: false,
    filterable: false,
    type: 'string',
    visible: false,
    width: 200,
    format: (value: string | undefined) =>
      value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : '-',
  },
  {
    id: 'createdAt',
    field: 'createdAt',
    header: '建立時間',
    sortable: true,
    filterable: false,
    type: 'date',
    visible: false,
    width: 150,
    format: (value: Date) => format(new Date(value), 'yyyy/MM/dd HH:mm', { locale: zhTW }),
  },
]

// 預設可見欄位
export const DEFAULT_VISIBLE_COLUMNS = TRADE_COLUMNS.filter((col) => col.visible).map(
  (col) => col.id
)

// 預設排序
export const DEFAULT_SORT = [
  { field: 'tradeDate', direction: 'desc' as const },
]
