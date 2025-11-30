/**
 * 自製圖片燈箱組件
 * 功能:縮放、旋轉、拖拽、左右切換、鍵盤導航、下載
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download, RotateCcw } from 'lucide-react'
import { Button } from './button'
import { Dialog, DialogContent, DialogTitle } from './dialog'
import { VisuallyHidden } from './visually-hidden'

interface ImageLightboxProps {
  images: string[]
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
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const dragStartPositionRef = useRef({ x: 0, y: 0 })

  // 重置狀態（平滑旋轉到最近的 0 度）
  const resetImageState = useCallback(() => {
    setScale(1)
    // 找到最近的 0 度（360 的倍數）
    const nearestZero = Math.round(rotation / 360) * 360
    setRotation(nearestZero)
    setPosition({ x: 0, y: 0 })
    setIsDragging(false)
  }, [rotation])

  // 當打開或切換圖片時重置狀態
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex)
      // 切換圖片時立即重置到 0
      setScale(1)
      setRotation(0)
      setPosition({ x: 0, y: 0 })
      setIsDragging(false)
    }
  }, [open, initialIndex])

  // 關閉圖片預覽
  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  // 切換到上一張
  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    // 切換圖片時立即重置
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    setIsDragging(false)
  }, [images.length])

  // 切換到下一張
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    // 切換圖片時立即重置
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    setIsDragging(false)
  }, [images.length])

  // 放大
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, 5))
  }, [])

  // 縮小
  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.5, 0.5))
  }, [])

  // 順時針旋轉（累加，不回到 0）
  const handleRotateRight = useCallback(() => {
    setRotation((prev) => prev + 90)
  }, [])

  // 逆時針旋轉（累加，不回到 0）
  const handleRotateLeft = useCallback(() => {
    setRotation((prev) => prev - 90)
  }, [])

  // 下載圖片
  const handleDownload = useCallback(async () => {
    try {
      const imageUrl = images[currentIndex]
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `image-${currentIndex + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('下載圖片失敗:', error)
    }
  }, [images, currentIndex])

  // 雙擊切換縮放
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (scale === 1) {
      setScale(2)
    } else {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    }
  }, [scale])

  // 鼠標/觸控拖拽開始
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (scale > 1) {
      setIsDragging(true)
      dragStartRef.current = { x: clientX, y: clientY }
      dragStartPositionRef.current = { x: position.x, y: position.y }
    }
  }, [scale, position])

  // 鼠標/觸控拖拽移動
  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return
    
    // 計算滑鼠移動量
    const deltaX = clientX - dragStartRef.current.x
    const deltaY = clientY - dragStartRef.current.y
    
    // 根據旋轉角度調整座標（反向旋轉）
    const angleInRadians = (-rotation * Math.PI) / 180
    const adjustedDeltaX = deltaX * Math.cos(angleInRadians) - deltaY * Math.sin(angleInRadians)
    const adjustedDeltaY = deltaX * Math.sin(angleInRadians) + deltaY * Math.cos(angleInRadians)
    
    // 加上起始位置
    setPosition({
      x: dragStartPositionRef.current.x + adjustedDeltaX,
      y: dragStartPositionRef.current.y + adjustedDeltaY,
    })
  }, [isDragging, rotation])

  // 鼠標/觸控拖拽結束
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // 鍵盤事件監聽
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          handleClose()
          break
        case 'ArrowLeft':
          handlePrevious()
          break
        case 'ArrowRight':
          handleNext()
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
        case 'r':
        case 'R':
          handleRotateRight()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, handleClose, handlePrevious, handleNext, handleZoomIn, handleZoomOut, handleRotateRight])

  if (images.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!max-w-none w-screen h-screen p-0 bg-black/95 border-none [&>button]:hidden"
        onWheel={(e) => {
          e.preventDefault()
          const delta = e.deltaY > 0 ? -0.1 : 0.1
          setScale((prev) => Math.max(0.5, Math.min(5, prev + delta)))
        }}
      >
        <VisuallyHidden>
          <DialogTitle>圖片預覽</DialogTitle>
        </VisuallyHidden>
        
        <div className="relative w-full h-full flex items-center justify-center">
          {/* 頂部工具欄 */}
          <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            {/* 圖片計數 */}
            {images.length > 1 ? (
              <div className="bg-black/60 text-white px-3 py-1 rounded text-sm font-medium pointer-events-auto">
                {currentIndex + 1} / {images.length}
              </div>
            ) : (
              <div />
            )}

            {/* 工具按鈕組 */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* 縮放控制 */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-10 w-10"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <span className="text-white text-sm font-medium min-w-[4rem] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-10 w-10"
                onClick={handleZoomIn}
                disabled={scale >= 5}
              >
                <ZoomIn className="h-5 w-5" />
              </Button>

              {/* 旋轉控制 */}
              <div className="w-px h-6 bg-white/20 mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-10 w-10"
                onClick={handleRotateLeft}
                title="逆時針旋轉"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-10 w-10"
                onClick={handleRotateRight}
                title="順時針旋轉"
              >
                <RotateCw className="h-5 w-5" />
              </Button>

              {/* 重置 */}
              <div className="w-px h-6 bg-white/20 mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-10 px-3"
                onClick={resetImageState}
                title="重置"
              >
                重置
              </Button>

              {/* 下載 */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-10 w-10"
                onClick={handleDownload}
                title="下載圖片"
              >
                <Download className="h-5 w-5" />
              </Button>
            </div>

            {/* 關閉按鈕 */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-10 w-10 pointer-events-auto"
              onClick={handleClose}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* 左箭頭 - 加大 */}
          {images.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-4 z-50 text-white hover:bg-white/20 h-16 w-16"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-10 w-10" />
            </Button>
          )}

          {/* 圖片容器 */}
          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={(e) => {
              const touch = e.touches[0]
              handleDragStart(touch.clientX, touch.clientY)
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0]
              handleDragMove(touch.clientX, touch.clientY)
            }}
            onTouchEnd={handleDragEnd}
            onDoubleClick={handleDoubleClick}
          >
            <img
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain select-none"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              }}
              draggable={false}
            />
          </div>

          {/* 右箭頭 - 加大 */}
          {images.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-4 z-50 text-white hover:bg-white/20 h-16 w-16"
              onClick={handleNext}
            >
              <ChevronRight className="h-10 w-10" />
            </Button>
          )}

          {/* 縮圖導航 */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 bg-black/60 p-2 rounded max-w-[90vw] overflow-x-auto">
              {images.map((img, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index)
                    // 切換圖片時立即重置
                    setScale(1)
                    setRotation(0)
                    setPosition({ x: 0, y: 0 })
                    setIsDragging(false)
                  }}
                  className={`w-16 h-16 rounded overflow-hidden border-2 transition-all flex-shrink-0 ${
                    index === currentIndex
                      ? 'border-white scale-110'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
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
