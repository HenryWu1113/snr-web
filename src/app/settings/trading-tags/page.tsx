/**
 * 自定義標籤管理頁面
 */

import { OptionCrudTemplate } from '@/components/admin/option-crud-template'

export default function TradingTagsPage() {
  return (
    <OptionCrudTemplate
      title="自定義標籤管理"
      singularName="標籤"
      apiEndpoint="/api/admin/trading-tags"
      description="管理交易標籤選項（例如：#追單、#情緒差、#重倉、#完美執行等）"
    />
  )
}
