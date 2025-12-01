/**
 * 交易紀錄 DataTable 欄位定義
 */

import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { ColumnDef } from '@/types/datatable'
import type { TradeWithRelations } from '@/types/datatable'

import { TradeImageCell } from '@/components/trades/trade-image-cell'
import { getTradingSessionLabel, getTradingSessionColor } from '@/lib/trading-session'
import { Badge } from '@/components/ui/badge'

export const TRADE_COLUMNS: ColumnDef<TradeWithRelations>[] = [
  {
    id: 'id',
    field: 'id',
    header: 'ID',
    sortable: true,
    filterable: true,
    type: 'string',
    visible: false, // 預設隱藏，因為通常不需要看 UUID
    width: 80,
    format: (value: string) => (
      <span className="font-mono text-xs text-muted-foreground" title={value}>
        {value.substring(0, 8)}...
      </span>
    ),
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
    id: 'tradeDate',
    field: 'tradeDate',
    header: '交易日(圖表日期)',
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
    id: 'position',
    field: 'position',
    header: '做多/做空',
    sortable: true,
    filterable: true,
    type: 'enum',
    visible: true,
    width: 100,
    filterOptions: [
      { label: '做多', value: 'LONG' },
      { label: '做空', value: 'SHORT' },
    ],
    format: (value: 'LONG' | 'SHORT') => {
      if (value === 'LONG') {
        return (
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">做多</span>
          </div>
        )
      } else {
        return (
          <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
            <TrendingDown className="h-4 w-4" />
            <span className="text-xs font-medium">做空</span>
          </div>
        )
      }
    },
  },
  {
    id: 'tradingSession',
    field: 'tradingSession',
    header: '交易時段',
    sortable: true,
    filterable: true,
    type: 'enum',
    visible: true,
    width: 100,
    filterOptions: [
      { label: '亞洲盤', value: 'ASIAN' },
      { label: '倫敦盤', value: 'LONDON' },
      { label: '紐約盤', value: 'NEWYORK' },
      { label: '重疊時段', value: 'OVERLAP' },
    ],
    format: (value: 'ASIAN' | 'LONDON' | 'NEWYORK' | 'OVERLAP' | null) => {
      if (!value) return <span className="text-muted-foreground">-</span>
      return (
        <Badge variant="outline" className="text-xs font-medium">
          {getTradingSessionLabel(value)}
        </Badge>
      )
    },
  },
  {
    id: 'holdingTime',
    field: 'holdingTimeMinutes',
    header: '持倉時間',
    sortable: true,
    filterable: false,
    type: 'number',
    visible: true,
    width: 110,
    format: (value: number | null) => {
      if (!value) return <span className="text-muted-foreground">-</span>
      const hours = Math.floor(value / 60)
      const mins = value % 60
      if (hours > 0) {
        return <span className="text-xs">{hours}h {mins}m</span>
      }
      return <span className="text-xs">{mins}m</span>
    },
  },
  {
    id: 'tags',
    field: 'tradeTags',
    header: '標籤',
    sortable: false,
    filterable: false,
    type: 'string',
    visible: true,
    width: 150,
    format: (value: Array<{ tag: { name: string } }>) => {
      if (!value || value.length === 0) {
        return <span className="text-muted-foreground text-xs">-</span>
      }
      return (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((tt, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {tt.tag.name}
            </Badge>
          ))}
          {value.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{value.length - 2}
            </Badge>
          )}
        </div>
      )
    },
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
    id: 'targetR',
    field: 'targetR',
    header: '目標 R',
    sortable: true,
    filterable: false,
    type: 'number',
    visible: true,
    width: 100,
    format: (value: number) => value.toFixed(2) + 'R',
  },
  {
    id: 'actualExitR',
    field: 'actualExitR',
    header: '實際出場 R',
    sortable: true,
    filterable: false,
    type: 'number',
    visible: true,
    width: 120,
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
    id: 'leverage',
    field: 'leverage',
    header: '槓桿倍數',
    sortable: true,
    filterable: false,
    type: 'number',
    visible: true,
    width: 100,
    format: (value: number) => value.toFixed(0) + 'x',
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
    width: 160,
    format: (value: Date) => format(new Date(value), 'yyyy/MM/dd HH:mm:ss', { locale: zhTW }),
  },
  {
    id: 'updatedAt',
    field: 'updatedAt',
    header: '更新時間',
    sortable: true,
    filterable: false,
    type: 'date',
    visible: false,
    width: 160,
    format: (value: Date) => format(new Date(value), 'yyyy/MM/dd HH:mm:ss', { locale: zhTW }),
  },
  {
    id: 'images',
    field: 'screenshotUrls',
    header: '圖片',
    sortable: false,
    filterable: false,
    type: 'string', // 雖然是陣列，但這裡主要用於渲染
    visible: true,
    width: 60,
    format: (value: any[]) => <TradeImageCell images={value} />,
  },
]

// 預設可見欄位
export const DEFAULT_VISIBLE_COLUMNS = TRADE_COLUMNS.filter((col) => col.visible).map(
  (col) => col.id
)

// 預設排序
export const DEFAULT_SORT = [
  { field: 'orderDate', direction: 'desc' as const },
]
