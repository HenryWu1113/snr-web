/**
 * 收藏選擇對話框組件
 * 類似 YouTube 的播放清單選擇功能
 */

'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Collection {
  id: string
  name: string
  description?: string | null
  _count?: {
    tradeCollections: number
  }
}

interface CollectionDialogProps {
  tradeId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CollectionDialog({
  tradeId,
  open,
  onOpenChange,
  onSuccess,
}: CollectionDialogProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(
    []
  )
  const [newCollectionName, setNewCollectionName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // 載入收藏分類
  useEffect(() => {
    if (open && tradeId) {
      loadData()
    }
  }, [open, tradeId])

  const loadData = async () => {
    if (!tradeId) return

    setIsLoading(true)
    try {
      // 載入所有收藏分類
      const collectionsRes = await fetch('/api/collections')
      if (!collectionsRes.ok) throw new Error('Failed to load collections')
      const collectionsData = await collectionsRes.json()

      // 載入該交易已加入的收藏分類
      const tradeCollectionsRes = await fetch(
        `/api/trades/${tradeId}/collections`
      )
      if (!tradeCollectionsRes.ok)
        throw new Error('Failed to load trade collections')
      const tradeCollectionsData = await tradeCollectionsRes.json()

      setCollections(collectionsData.data || [])
      setSelectedCollectionIds(
        tradeCollectionsData.data?.map((c: Collection) => c.id) || []
      )
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('載入收藏分類失敗')
    } finally {
      setIsLoading(false)
    }
  }

  // 切換收藏分類選擇
  const handleToggleCollection = (collectionId: string) => {
    setSelectedCollectionIds((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    )
  }

  // 建立新的收藏分類
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.error('請輸入收藏分類名稱')
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCollectionName.trim() }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create collection')
      }

      const data = await res.json()
      const newCollection = data.data

      // 更新列表並自動選中
      setCollections((prev) => [...prev, newCollection])
      setSelectedCollectionIds((prev) => [...prev, newCollection.id])
      setNewCollectionName('')
      toast.success('收藏分類建立成功')
    } catch (error: any) {
      console.error('Error creating collection:', error)
      toast.error(error.message || '建立收藏分類失敗')
    } finally {
      setIsCreating(false)
    }
  }

  // 儲存變更
  const handleSave = async () => {
    if (!tradeId) return

    setIsSaving(true)
    try {
      const res = await fetch(`/api/trades/${tradeId}/collections`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionIds: selectedCollectionIds }),
      })

      if (!res.ok) throw new Error('Failed to save collections')

      toast.success('儲存成功')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error saving collections:', error)
      toast.error('儲存失敗')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>將交易加入收藏</DialogTitle>
          <DialogDescription>選擇要加入的收藏分類</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* 收藏分類列表 */}
            <ScrollArea className="max-h-[300px] pr-4">
              {collections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  還沒有收藏分類，建立一個吧！
                </div>
              ) : (
                <div className="space-y-2">
                  {collections.map((collection) => (
                    <div
                      key={collection.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <Checkbox
                        id={collection.id}
                        checked={selectedCollectionIds.includes(collection.id)}
                        onCheckedChange={() =>
                          handleToggleCollection(collection.id)
                        }
                      />
                      <label
                        htmlFor={collection.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">{collection.name}</div>
                        {collection.description && (
                          <div className="text-xs text-muted-foreground">
                            {collection.description}
                          </div>
                        )}
                        {collection._count && (
                          <div className="text-xs text-muted-foreground">
                            {collection._count.tradeCollections} 筆交易
                          </div>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* 新增收藏分類 */}
            <div className="flex gap-2 pt-4 border-t">
              <Input
                placeholder="新增收藏分類..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isCreating) {
                    handleCreateCollection()
                  }
                }}
                disabled={isCreating}
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCreateCollection}
                disabled={isCreating || !newCollectionName.trim()}
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                儲存中...
              </>
            ) : (
              '儲存'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
