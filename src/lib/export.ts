/**
 * 資料匯出工具函數
 * 支援 CSV 和 Excel 格式
 */

import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import type { ColumnDef } from '@/types/datatable'

/**
 * 將資料轉換為匯出格式
 */
function prepareDataForExport<T>(data: T[], columns: ColumnDef<T>[]): any[] {
  return data.map((row) => {
    const exportRow: any = {}

    columns.forEach((column) => {
      const value = (row as any)[column.field]

      // 處理不同資料類型
      if (value === null || value === undefined) {
        exportRow[column.header] = ''
      } else if (column.type === 'date') {
        exportRow[column.header] = value instanceof Date
          ? format(value, 'yyyy/MM/dd HH:mm')
          : value
      } else if (typeof value === 'object') {
        // 處理關聯資料
        if (Array.isArray(value)) {
          exportRow[column.header] = value.map((v: any) => v.name || v).join(', ')
        } else {
          exportRow[column.header] = value.name || JSON.stringify(value)
        }
      } else {
        exportRow[column.header] = value
      }
    })

    return exportRow
  })
}

/**
 * 匯出為 CSV
 */
export function exportToCSV<T>(data: T[], columns: ColumnDef<T>[], filename: string) {
  const exportData = prepareDataForExport(data, columns)

  const csv = Papa.unparse(exportData, {
    header: true,
  })

  // 加上 BOM 以支援中文
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 匯出為 Excel
 */
export function exportToExcel<T>(data: T[], columns: ColumnDef<T>[], filename: string) {
  const exportData = prepareDataForExport(data, columns)

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Trades')

  // 設定欄位寬度
  const maxWidth = 30
  const columnWidths = columns.map((col) => ({
    wch: Math.min(col.width ? col.width / 10 : 15, maxWidth),
  }))
  worksheet['!cols'] = columnWidths

  XLSX.writeFile(workbook, `${filename}_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`)
}
