/**
 * 選項管理 CRUD 模板組件
 * 用於管理各種選項資料（商品、時間框架等）
 * 支援拖曳排序
 */

'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, GripVertical, PackageOpen } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export interface OptionItem {
  id: string
  name: string
  displayOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface OptionCrudTemplateProps {
  title: string
  singularName: string
  apiEndpoint: string
  description?: string
}

// 可拖曳的表格行組件
function SortableTableRow({
  item,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  item: OptionItem
  onEdit: (item: OptionItem) => void
  onDelete: (item: OptionItem) => void
  onToggleActive: (item: OptionItem) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>
        <Switch
          checked={item.isActive}
          onCheckedChange={() => onToggleActive(item)}
        />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(item.createdAt).toLocaleDateString('zh-TW')}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(item)}
          className="mr-2"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

export function OptionCrudTemplate({
  title,
  singularName,
  apiEndpoint,
  description,
}: OptionCrudTemplateProps) {
  const [items, setItems] = useState<OptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<OptionItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<OptionItem | null>(null)
  const [formData, setFormData] = useState({ name: '', isActive: true })
  const { toast } = useToast()

  // 拖曳感應器設定
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 載入資料
  const loadItems = async () => {
    try {
      setLoading(true)
      const response = await fetch(apiEndpoint)
      if (!response.ok) throw new Error('載入失敗')
      const data = await response.json()
      setItems(data.data || [])
    } catch (error) {
      toast({
        title: '載入失敗',
        description: error instanceof Error ? error.message : '未知錯誤',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [apiEndpoint])

  // 處理拖曳結束
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)

    const newItems = arrayMove(items, oldIndex, newIndex)

    // 更新本地狀態（樂觀更新）
    setItems(newItems)

    // 批量更新 displayOrder（一次 API 請求）
    try {
      const updates = newItems.map((item, index) => ({
        id: item.id,
        displayOrder: index + 1,
      }))

      // 使用 PATCH 方法批量更新
      const response = await fetch(apiEndpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })

      if (!response.ok) {
        throw new Error('批量更新失敗')
      }

      toast({
        title: '排序更新成功',
        description: '選項順序已更新',
      })
    } catch (error) {
      toast({
        title: '排序更新失敗',
        description: error instanceof Error ? error.message : '未知錯誤',
        variant: 'destructive',
      })
      // 失敗時重新載入資料
      loadItems()
    }
  }

  // 開啟新增對話框
  const handleAdd = () => {
    setEditingItem(null)
    setFormData({ name: '', isActive: true })
    setDialogOpen(true)
  }

  // 開啟編輯對話框
  const handleEdit = (item: OptionItem) => {
    setEditingItem(item)
    setFormData({ name: item.name, isActive: item.isActive })
    setDialogOpen(true)
  }

  // 提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingItem ? `${apiEndpoint}/${editingItem.id}` : apiEndpoint
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error(editingItem ? '更新失敗' : '新增失敗')

      toast({
        title: editingItem ? '更新成功' : '新增成功',
        description: `${singularName}已${editingItem ? '更新' : '新增'}`,
      })

      setDialogOpen(false)
      loadItems()
    } catch (error) {
      toast({
        title: editingItem ? '更新失敗' : '新增失敗',
        description: error instanceof Error ? error.message : '未知錯誤',
        variant: 'destructive',
      })
    }
  }

  // 刪除項目
  const handleDelete = async () => {
    if (!deletingItem) return

    try {
      const response = await fetch(`${apiEndpoint}/${deletingItem.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('刪除失敗')

      toast({
        title: '刪除成功',
        description: `${singularName}已刪除`,
      })

      setDeleteDialogOpen(false)
      setDeletingItem(null)
      loadItems()
    } catch (error) {
      toast({
        title: '刪除失敗',
        description: error instanceof Error ? error.message : '未知錯誤',
        variant: 'destructive',
      })
    }
  }

  // 切換啟用狀態
  const handleToggleActive = async (item: OptionItem) => {
    try {
      const response = await fetch(`${apiEndpoint}/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      })

      if (!response.ok) throw new Error('更新失敗')

      toast({
        title: '更新成功',
        description: `${singularName}已${!item.isActive ? '啟用' : '停用'}`,
      })

      loadItems()
    } catch (error) {
      toast({
        title: '更新失敗',
        description: error instanceof Error ? error.message : '未知錯誤',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground mt-2">{description}</p>}
          <p className="text-sm text-muted-foreground mt-1">
            💡 提示：拖曳項目可以調整順序，此順序會影響表單和表格中的顯示順序
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          新增{singularName}
        </Button>
      </div>

      {loading ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">排序</TableHead>
                <TableHead>名稱</TableHead>
                <TableHead className="w-[100px]">狀態</TableHead>
                <TableHead className="w-[180px]">建立時間</TableHead>
                <TableHead className="w-[120px] text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-6 w-6" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-28" />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-md border">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">排序</TableHead>
                  <TableHead>名稱</TableHead>
                  <TableHead className="w-[100px]">狀態</TableHead>
                  <TableHead className="w-[180px]">建立時間</TableHead>
                  <TableHead className="w-[120px] text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48">
                      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <PackageOpen className="h-16 w-16 opacity-30" />
                        <div className="text-center">
                          <p className="font-semibold text-lg">尚無{singularName}</p>
                          <p className="text-sm">點擊上方「新增{singularName}」按鈕來建立第一筆資料</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <SortableContext
                    items={items.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {items.map((item) => (
                      <SortableTableRow
                        key={item.id}
                        item={item}
                        onEdit={handleEdit}
                        onDelete={(item) => {
                          setDeletingItem(item)
                          setDeleteDialogOpen(true)
                        }}
                        onToggleActive={handleToggleActive}
                      />
                    ))}
                  </SortableContext>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
      )}

      {/* 新增/編輯對話框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? '編輯' : '新增'}{singularName}</DialogTitle>
            <DialogDescription>
              填寫{singularName}資訊
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">名稱 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">啟用狀態</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit">{editingItem ? '更新' : '新增'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 刪除確認對話框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              確定要刪除「{deletingItem?.name}」嗎？此操作無法復原。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeletingItem(null)
              }}
            >
              取消
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              確認刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
