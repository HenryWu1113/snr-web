/**
 * 交易類型管理頁面
 * /settings/trade-types
 */

import { OptionCrudTemplate } from '@/components/admin/option-crud-template'

export default function TradeTypesPage() {
  return (
    <OptionCrudTemplate
      title="交易類型管理"
      singularName="交易類型"
      apiEndpoint="/api/admin/trade-types"
      description="管理交易類型選項（例如：實盤、回測等）"
    />
  )
}
