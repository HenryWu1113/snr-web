/**
 * 圖片上傳元件（支援現有圖片）
 * 支援多圖上傳、預覽、刪除、貼上（Ctrl+V）
 * 可顯示已存在的圖片（編輯模式）
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Upload, Clipboard, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageLightbox } from '@/components/ui/image-lightbox'
import type { CloudinaryImage } from '@/lib/validations/trade'
import { useIsTouchDevice } from '@/hooks/use-is-touch-device'

interface ImageFile {
  id: string
  file: File
  preview: string
  type: 'file'
}

interface ExistingImage {
  id: string
  url: string
  type: 'existing'
  data: CloudinaryImage
}

type ImageItem = ImageFile | ExistingImage

export interface ImageUploadValue {
  newFiles: File[]
  existingImages: CloudinaryImage[]
}

interface ImageUploadWithExistingProps {
  value: ImageUploadValue
  onChange: (value: ImageUploadValue) => void
  maxImages?: number
  disabled?: boolean
}

export function ImageUploadWithExisting({
  value = { newFiles: [], existingImages: [] },
  onChange,
  maxImages = 5,
  disabled = false,
}: ImageUploadWithExistingProps) {
  const [previews, setPreviews] = useState<ImageItem[]>([])
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isTouchDevice = useIsTouchDevice()

  // 生成預覽（包含新檔案和現有圖片）
  useEffect(() => {
    // 清理舊的預覽 URL
    previews.forEach((p) => {
      if (p.type === 'file') {
        URL.revokeObjectURL(p.preview)
      }
    })

    // 生成新的預覽
    const newPreviews: ImageItem[] = [
      // 現有圖片
      ...value.existingImages.map((img) => ({
        id: img.publicId,
        url: img.url,
        type: 'existing' as const,
        data: img,
      })),
      // 新上傳的檔案
      ...value.newFiles.map((file) => ({
        id: file.name + '-' + file.lastModified,
        file,
        preview: URL.createObjectURL(file),
        type: 'file' as const,
      })),
    ]
    setPreviews(newPreviews)

    // Cleanup function
    return () => {
      newPreviews.forEach((p) => {
        if (p.type === 'file') {
          URL.revokeObjectURL(p.preview)
        }
      })
    }
  }, [value.newFiles, value.existingImages])

  // 處理貼上事件（Ctrl+V）
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const totalImages = value.newFiles.length + value.existingImages.length
      if (disabled || totalImages >= maxImages) return

      const items = e.clipboardData?.items
      if (!items) return

      const imageFiles: File[] = []

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile()
          if (file) {
            imageFiles.push(file)
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault()
        handleFiles(imageFiles)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('paste', handlePaste as any)
      container.setAttribute('tabindex', '0')
    }

    return () => {
      if (container) {
        container.removeEventListener('paste', handlePaste as any)
      }
    }
  }, [disabled, value.newFiles.length, value.existingImages.length, maxImages])

  const handleFiles = (files: File[]) => {
    const totalImages = value.newFiles.length + value.existingImages.length
    const remainingSlots = maxImages - totalImages
    if (remainingSlots <= 0) {
      alert('最多只能上傳 ' + maxImages + ' 張圖片')
      return
    }

    const filesToAdd = files.slice(0, remainingSlots)
    const imageFiles = filesToAdd.filter((file) =>
      file.type.startsWith('image/')
    )

    if (imageFiles.length === 0) {
      alert('請選擇圖片檔案')
      return
    }

    onChange({
      ...value,
      newFiles: [...value.newFiles, ...imageFiles],
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    handleFiles(files)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemove = (index: number) => {
    const item = previews[index]
    if (item.type === 'existing') {
      // 移除現有圖片
      const newExisting = value.existingImages.filter((img) => img.publicId !== item.id)
      onChange({
        ...value,
        existingImages: newExisting,
      })
    } else {
      // 移除新檔案
      const fileIndex = index - value.existingImages.length
      const newFiles = value.newFiles.filter((_, i) => i !== fileIndex)
      onChange({
        ...value,
        newFiles,
      })
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const totalImages = value.newFiles.length + value.existingImages.length

  return (
    <div ref={containerRef} className="space-y-4 border-2 border-dashed border-muted-foreground/20 rounded-lg p-4 hover:border-muted-foreground/40 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      {/* 上傳按鈕 */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={disabled || totalImages >= maxImages}
          className="hidden"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={disabled || totalImages >= maxImages}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            選擇圖片 ({totalImages}/{maxImages})
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={disabled || totalImages >= maxImages}
            className="px-3"
            title="在此區域內按 Ctrl+V 貼上截圖"
          >
            <Clipboard className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground text-center">
          💡 支援 JPG、PNG、GIF 格式，最多 {maxImages} 張<br/>
          <span className="font-medium">在此虛線框內任意位置按 Ctrl+V 即可貼上截圖</span>
        </p>
      </div>

      {/* 圖片預覽 */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((item, index) => {
            const imageUrl = item.type === 'existing' ? item.url : item.preview
            const isExisting = item.type === 'existing'

            return (
              <div
                key={item.id}
                className="relative group aspect-video rounded-lg overflow-hidden border border-border bg-muted"
              >
                <img
                  src={imageUrl}
                  alt={'Screenshot ' + (index + 1)}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => {
                    setLightboxIndex(index)
                    setLightboxOpen(true)
                  }}
                />
                {/* 操作按鈕覆蓋層 - 觸控設備永久顯示，桌面設備 hover 顯示 */}
                <div 
                  className={`absolute inset-0 transition-opacity flex items-center justify-center gap-2 ${
                    isTouchDevice 
                      ? 'bg-black/40' 
                      : 'bg-black/60 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={() => {
                      setLightboxIndex(index)
                      setLightboxOpen(true)
                    }}
                    disabled={disabled}
                    className="h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemove(index)}
                    disabled={disabled}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
                {isExisting ? (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    已上傳
                  </div>
                ) : (
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {(item.file.size / 1024).toFixed(0)} KB
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 圖片燈箱 */}
      <ImageLightbox
        images={previews.map((p) => p.type === 'existing' ? p.url : p.preview)}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </div>
  )
}
