/**
 * 收藏分類頁面內容
 * 左側顯示收藏分類列表，右側顯示選中分類的交易
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Bookmark, Plus, Trash2, Edit2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { TradeDataTable } from '@/components/datatable/trade-datatable'
import { cn } from '@/lib/utils'

interface Collection {
  id: string
  name: string
  description?: string | null
  displayOrder: number
  _count?: {
    tradeCollections: number
  }
}

export function CollectionsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCollectionId = searchParams.get('collection')

  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >(initialCollectionId)
  const [isLoading, setIsLoading] = useState(true)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [collectionToDelete, setCollectionToDelete] =
    useState<Collection | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/collections')
      if (!res.ok) throw new Error('Failed to load collections')
      const data = await res.json()
      setCollections(data.data || [])
    } catch (error) {
      console.error('Error loading collections:', error)
      toast.error('載入收藏分類失敗')
    } finally {
      setIsLoading(false)
    }
  }

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
      setCollections((prev) => [...prev, data.data])
      setNewCollectionName('')
      toast.success('收藏分類建立成功')
    } catch (error: any) {
      console.error('Error creating collection:', error)
      toast.error(error.message || '建立收藏分類失敗')
    } finally {
      setIsCreating(false)
    }
  }

  const confirmDeleteCollection = (collection: Collection) => {
    setCollectionToDelete(collection)
    setDeleteDialogOpen(true)
  }

  const handleDeleteCollection = async () => {
    if (!collectionToDelete) return

    try {
      const res = await fetch(`/api/collections/${collectionToDelete.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete collection')

      toast.success('收藏分類已刪除')
      setCollections((prev) =>
        prev.filter((c) => c.id !== collectionToDelete.id)
      )
      if (selectedCollectionId === collectionToDelete.id) {
        setSelectedCollectionId(null)
      }
    } catch (error) {
      console.error('Error deleting collection:', error)
      toast.error('刪除收藏分類失敗')
    } finally {
      setDeleteDialogOpen(false)
      setCollectionToDelete(null)
    }
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
    loadCollections()
    router.refresh()
  }

  const selectedCollection = collections.find(
    (c) => c.id === selectedCollectionId
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Bookmark className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">收藏分類</h1>
        </div>
        <p className="text-muted-foreground">
          管理您的收藏分類並查看收藏的交易
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 左側：收藏分類列表 */}
        <div className="col-span-12 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>收藏分類</CardTitle>
              <CardDescription>點擊分類來查看交易</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 新增收藏分類 */}
              <div className="flex gap-2">
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

              {/* 收藏分類列表 */}
              <ScrollArea className="h-[500px]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : collections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    還沒有收藏分類
                  </div>
                ) : (
                  <div className="space-y-2">
                    {collections.map((collection) => (
                      <div
                        key={collection.id}
                        className={cn(
                          'p-3 rounded-lg border transition-colors cursor-pointer',
                          selectedCollectionId === collection.id
                            ? 'border-primary bg-primary/10'
                            : 'hover:bg-accent'
                        )}
                        onClick={() => setSelectedCollectionId(collection.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-medium">
                              {collection.name}
                            </div>
                            {collection._count && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {collection._count.tradeCollections} 筆交易
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              confirmDeleteCollection(collection)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* 右側：交易列表 */}
        <div className="col-span-12 lg:col-span-8">
          {selectedCollection ? (
            <div>
              <div className="mb-4">
                <h2 className="text-2xl font-bold">{selectedCollection.name}</h2>
                {selectedCollection.description && (
                  <p className="text-muted-foreground">
                    {selectedCollection.description}
                  </p>
                )}
              </div>
              <TradeDataTable
                key={`${selectedCollectionId}-${refreshKey}`}
                onTradeUpdate={handleRefresh}
                onTradeDelete={handleRefresh}
                fixedFilters={{ collectionId: selectedCollection.id }}
              />
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">選擇收藏分類</h3>
                <p className="text-muted-foreground">
                  從左側選擇一個收藏分類來查看交易
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 刪除確認對話框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除收藏分類「{collectionToDelete?.name}」嗎？
              {collectionToDelete?._count &&
                collectionToDelete._count.tradeCollections > 0 && (
                  <>
                    <br />
                    <strong className="text-foreground">
                      此分類包含{' '}
                      {collectionToDelete._count.tradeCollections} 筆交易
                    </strong>
                    ，刪除後這些交易不會被刪除，只會從此分類中移除。
                  </>
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCollection}
              className="bg-destructive hover:bg-destructive/90"
            >
              確認刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
