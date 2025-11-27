/**
 * 進場類型管理頁面
 */

import { OptionCrudTemplate } from '@/components/admin/option-crud-template'

export default function EntryTypesPage() {
  return (
    <OptionCrudTemplate
      title="進場類型管理"
      singularName="進場類型"
      apiEndpoint="/api/admin/entry-types"
      description="管理進場類型選項（例如：突破進場、回調進場等）"
    />
  )
}
