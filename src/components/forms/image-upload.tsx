/**
 * 圖片上傳元件
 * 支援多圖上傳、預覽、刪除、貼上（Ctrl+V）
 * 圖片不會立即上傳，而是在表單提交時統一上傳
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Upload, Clipboard, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageLightbox } from '@/components/ui/image-lightbox'

interface ImageFile {
  id: string
  file: File
  preview: string
}

interface ImageUploadProps {
  value: File[]
  onChange: (files: File[]) => void
  maxImages?: number
  disabled?: boolean
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  disabled = false,
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<ImageFile[]>([])
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 從 File[] 生成預覽
  useEffect(() => {
    // 清理舊的預覽 URL
    previews.forEach((p) => URL.revokeObjectURL(p.preview))

    // 生成新的預覽
    const newPreviews = value.map((file) => ({
      id: file.name + '-' + file.lastModified,
      file,
      preview: URL.createObjectURL(file),
    }))
    setPreviews(newPreviews)

    // Cleanup function
    return () => {
      newPreviews.forEach((p) => URL.revokeObjectURL(p.preview))
    }
  }, [value])

  // 處理貼上事件（Ctrl+V）
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled || value.length >= maxImages) return

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
      // 讓容器可以接收 focus 以捕獲 paste 事件
      container.setAttribute('tabindex', '0')
    }

    return () => {
      if (container) {
        container.removeEventListener('paste', handlePaste as any)
      }
    }
  }, [disabled, value.length, maxImages])

  const handleFiles = (files: File[]) => {
    // 檢查是否超過最大數量
    const remainingSlots = maxImages - value.length
    if (remainingSlots <= 0) {
      alert('最多只能上傳 ' + maxImages + ' 張圖片')
      return
    }

    const filesToAdd = files.slice(0, remainingSlots)

    // 過濾出圖片檔案
    const imageFiles = filesToAdd.filter((file) =>
      file.type.startsWith('image/')
    )

    if (imageFiles.length === 0) {
      alert('請選擇圖片檔案')
      return
    }

    // 更新 value
    onChange([...value, ...imageFiles])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    handleFiles(files)

    // 清空 input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemove = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index)
    onChange(newFiles)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div ref={containerRef} className="space-y-4">
      {/* 上傳按鈕 */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={disabled || value.length >= maxImages}
          className="hidden"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={disabled || value.length >= maxImages}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            選擇圖片 ({value.length}/{maxImages})
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={disabled || value.length >= maxImages}
            className="px-3"
            title="點擊此區域後按 Ctrl+V 貼上截圖"
          >
            <Clipboard className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          支援 JPG、PNG、GIF 格式，最多 {maxImages} 張。可以直接按 Ctrl+V 貼上截圖
        </p>
      </div>

      {/* 圖片預覽 */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((imageFile, index) => (
            <div
              key={imageFile.id}
              className="relative group aspect-video rounded-lg overflow-hidden border border-border bg-muted"
            >
              <img
                src={imageFile.preview}
                alt={'Screenshot ' + (index + 1)}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => {
                  setLightboxIndex(index)
                  setLightboxOpen(true)
                }}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {(imageFile.file.size / 1024).toFixed(0)} KB
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 圖片燈箱 */}
      <ImageLightbox
        images={previews.map((p) => p.preview)}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </div>
  )
}
