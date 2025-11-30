'use client'

import { useState } from 'react'
import { Image as ImageIcon, ImageOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageLightbox } from '@/components/ui/image-lightbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface TradeImageCellProps {
  images: any[] // CloudinaryImage[]
}

export function TradeImageCell({ images }: TradeImageCellProps) {
  const [open, setOpen] = useState(false)

  const hasImages = images && images.length > 0
  const imageUrls = hasImages ? images.map((img) => img.url || img.secureUrl) : []

  if (!hasImages) {
    return (
      <div className="flex justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="opacity-20 cursor-not-allowed">
                <ImageOff className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>無圖片</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(true)
                }}
              >
                <ImageIcon className="h-4 w-4" />
                <span className="sr-only">查看圖片 ({images.length})</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>查看 {images.length} 張圖片</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <ImageLightbox
        images={imageUrls}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
