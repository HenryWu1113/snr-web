/**
 * 時間框架管理頁面
 */

import { OptionCrudTemplate } from '@/components/admin/option-crud-template'

export default function TimeframesPage() {
  return (
    <OptionCrudTemplate
      title="時間框架管理"
      singularName="時間框架"
      apiEndpoint="/api/admin/timeframes"
      description="管理時間框架選項（例如：1分、5分、15分等）"
    />
  )
}
