/**
 * 商品管理頁面
 */

import { OptionCrudTemplate } from '@/components/admin/option-crud-template'

export default function CommoditiesPage() {
  return (
    <OptionCrudTemplate
      title="商品管理"
      singularName="商品"
      apiEndpoint="/api/admin/commodities"
      description="管理交易商品選項（例如：台指、小道瓊等）"
    />
  )
}
