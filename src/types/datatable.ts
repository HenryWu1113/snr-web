/**
 * DataTable 系統的 TypeScript 類型定義
 * 用於 server-side 分頁、篩選、排序的標準化格式
 */

// ==========================================
// 排序相關
// ==========================================

export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  field: string
  direction: SortDirection
}

// 支援多重排序
export type MultiSortConfig = SortConfig[]

// ==========================================
// 篩選相關
// ==========================================

export type FilterOperator =
  | 'eq'        // 等於
  | 'ne'        // 不等於
  | 'gt'        // 大於
  | 'gte'       // 大於等於
  | 'lt'        // 小於
  | 'lte'       // 小於等於
  | 'in'        // 包含於（陣列）
  | 'notIn'     // 不包含於（陣列）
  | 'contains'  // 包含（字串）
  | 'startsWith'// 開頭為
  | 'endsWith'  // 結尾為
  | 'between'   // 區間

export interface FilterCondition {
  field: string
  operator: FilterOperator
  value: string | number | boolean | Date | (string | number)[] | null
}

// 支援組合篩選條件（AND/OR）
export type FilterGroup = {
  logic: 'AND' | 'OR'
  conditions: (FilterCondition | FilterGroup)[]
}

// ==========================================
// 欄位可見性
// ==========================================

export interface ColumnVisibility {
  [columnId: string]: boolean
}

// ==========================================
// 分頁相關
// ==========================================

export interface PaginationConfig {
  page: number      // 當前頁碼（從 1 開始）
  pageSize: number  // 每頁筆數
}

export interface PaginationMeta {
  currentPage: number
  pageSize: number
  totalPages: number
  totalRecords: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// ==========================================
// DataTable 請求格式
// ==========================================

export interface DataTableRequest {
  // 分頁
  pagination: PaginationConfig

  // 排序（支援多重排序）
  sort?: MultiSortConfig

  // 篩選條件
  filters?: FilterGroup

  // 欄位可見性（前端用，後端可選擇性回傳欄位）
  columnVisibility?: ColumnVisibility

  // 關鍵字搜尋（全文搜尋）
  search?: string
}

// ==========================================
// DataTable 回應格式
// ==========================================

export interface DataTableResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// ==========================================
// 欄位定義（用於前端渲染）
// ==========================================

export interface ColumnDef<T = any> {
  id: string
  field: keyof T | string // 對應的資料欄位
  header: string          // 顯示標題
  sortable: boolean       // 是否可排序
  filterable: boolean     // 是否可篩選
  type: 'string' | 'number' | 'date' | 'boolean' | 'enum' // 欄位類型
  visible: boolean        // 預設是否可見
  width?: number          // 欄位寬度（px）

  // 篩選器選項（用於 enum 類型）
  filterOptions?: Array<{
    label: string
    value: string | number
  }>

  // 格式化函數（前端渲染用）
  format?: (value: any, row: T) => string | React.ReactNode
}

// ==========================================
// 交易紀錄專用篩選器
// ==========================================

export interface TradeFilters {
  // 日期區間
  dateFrom?: string  // ISO 8601 格式
  dateTo?: string

  // 下單日區間
  orderDateFrom?: string
  orderDateTo?: string

  // 時間區間（chartTime）
  chartTimeFrom?: string
  chartTimeTo?: string

  // 商品（多選）
  commodityIds?: string[]

  // 時間框架（多選）
  timeframeIds?: string[]

  // 進場模式（多選）
  entryTypeIds?: string[]

  // 交易類型（多選）
  tradeTypeIds?: string[]

  // 趨勢線類型（多選）
  trendlineTypeIds?: string[]

  // 做多/做空（多選）
  positions?: ('LONG' | 'SHORT')[]

  // 盤勢判斷（多選）
  sessionTypes?: ('ASIAN' | 'LONDON' | 'AMERICAN')[]

  // 勝敗篩選
  winLoss?: 'win' | 'loss' | 'breakeven' | 'all'

  // 交易時段
  tradingSession?: 'ASIAN' | 'LONDON' | 'NEWYORK' | 'OVERLAP'

  // 自定義標籤（多選）
  tagIds?: string[]

  // 持倉時間範圍（分鐘）
  holdingTimeMin?: number
  holdingTimeMax?: number

  // 實際出場 R 區間
  actualExitRMin?: number
  actualExitRMax?: number

  // 關鍵字搜尋（搜尋 notes 欄位）
  keyword?: string

  // 喜歡篩選
  isFavorite?: boolean

  // 收藏分類篩選
  collectionId?: string
}

// ==========================================
// 交易紀錄 DataTable 請求（簡化版）
// ==========================================

export interface TradeDataTableRequest {
  pagination: PaginationConfig
  sort?: MultiSortConfig
  filters?: TradeFilters
  columnVisibility?: ColumnVisibility
}

// ==========================================
// 交易紀錄回應（包含關聯資料）
// ==========================================

export interface TradeWithRelations {
  id: string
  userId: string
  tradeDate: Date
  orderDate: Date

  // 關聯資料（已 populate）
  tradeType: {
    id: string
    name: string
  } | null

  commodity: {
    id: string
    name: string
  } | null

  timeframe: {
    id: string
    name: string
  } | null

  trendlineType: {
    id: string
    name: string
  } | null

  entryTypes: Array<{
    id: string
    name: string
  }>

  // 做多/做空
  position: 'LONG' | 'SHORT'

  // 新增欄位
  tradingSession: 'ASIAN' | 'LONDON' | 'NEWYORK' | 'OVERLAP' | null
  holdingTimeMinutes: number | null
  tradeTags: Array<{
    id: string
    tag: {
      id: string
      name: string
    }
  }>

  // 喜歡和收藏
  isFavorite: boolean
  collectionCount: number  // 所屬收藏分類數量

  // 交易數據
  stopLossTicks: number
  targetR: number
  actualExitR: number
  leverage: number
  profitLoss: number
  winLoss: 'win' | 'loss' | 'breakeven'

  notes?: string
  screenshotUrls?: any[] // JSON 格式

  createdAt: Date
  updatedAt: Date
}

export type TradeDataTableResponse = DataTableResponse<TradeWithRelations>
