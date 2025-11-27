/**
 * 圖片燈箱組件 - 支援放大預覽和左右切換
 */

'use client'

import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'
import { Dialog, DialogContent, DialogTitle } from './dialog'
import { VisuallyHidden } from './visually-hidden'

interface ImageLightboxProps {
  images: string[] // 圖片 URLs
  initialIndex?: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex, open])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  // 鍵盤快捷鍵
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, currentIndex])

  if (images.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
        <VisuallyHidden>
          <DialogTitle>圖片預覽</DialogTitle>
        </VisuallyHidden>
        <div className="relative w-full h-[95vh] flex items-center justify-center">
          {/* 關閉按鈕 */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* 圖片計數 */}
          {images.length > 1 && (
            <div className="absolute top-4 left-4 z-50 bg-black/60 text-white px-3 py-1 rounded text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* 上一張按鈕 */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-50 text-white hover:bg-white/20 h-12 w-12"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* 圖片 */}
          <img
            src={images[currentIndex]}
            alt={'Image ' + (currentIndex + 1)}
            className="max-w-full max-h-full object-contain"
          />

          {/* 下一張按鈕 */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-50 text-white hover:bg-white/20 h-12 w-12"
              onClick={handleNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          {/* 縮圖導航（如果有多張圖片）*/}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 bg-black/60 p-2 rounded">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={'w-16 h-16 rounded overflow-hidden border-2 transition-all ' + (
                    index === currentIndex
                      ? 'border-white scale-110'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                >
                  <img
                    src={img}
                    alt={'Thumbnail ' + (index + 1)}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
