/**
 * 趨勢線類型管理頁面
 */

import { OptionCrudTemplate } from '@/components/admin/option-crud-template'

export default function TrendlineTypesPage() {
  return (
    <OptionCrudTemplate
      title="趨勢線類型管理"
      singularName="趨勢線類型"
      apiEndpoint="/api/admin/trendline-types"
      description="管理趨勢線類型選項（例如：上升趨勢、下降趨勢等）"
    />
  )
}
