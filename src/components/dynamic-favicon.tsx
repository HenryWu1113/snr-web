'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

/**
 * 動態 Favicon 組件
 * 根據當前主題切換 favicon
 */
export function DynamicFavicon() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!resolvedTheme) return

    // 移除所有現有的 favicon
    const existingLinks = document.querySelectorAll("link[rel*='icon']")
    existingLinks.forEach(link => link.remove())

    // 根據主題設定 favicon 路徑
    const faviconPath = resolvedTheme === 'dark' 
      ? '/images/logo/dark-logo.png' 
      : '/images/logo/light-logo.png'
    
    // 創建新的 favicon link
    const link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/png'
    link.href = faviconPath
    document.head.appendChild(link)

    // 同時添加 apple-touch-icon
    const appleTouchIcon = document.createElement('link')
    appleTouchIcon.rel = 'apple-touch-icon'
    appleTouchIcon.href = faviconPath
    document.head.appendChild(appleTouchIcon)
  }, [resolvedTheme])

  return null
}
