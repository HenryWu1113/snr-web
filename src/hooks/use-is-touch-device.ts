/**
 * 檢測觸控設備的 Hook
 * 使用 matchMedia 和 touch 事件檢測
 */

'use client'

import { useState, useEffect } from 'react'

export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    // 多種方法檢測觸控設備
    const checkTouchDevice = () => {
      // 方法 1: 檢查 maxTouchPoints
      if (navigator.maxTouchPoints > 0) {
        return true
      }

      // 方法 2: 檢查 ontouchstart 事件
      if ('ontouchstart' in window) {
        return true
      }

      // 方法 3: 使用 CSS media query (hover: none) 表示沒有 hover 能力（觸控設備）
      if (window.matchMedia && window.matchMedia('(hover: none)').matches) {
        return true
      }

      // 方法 4: 檢查 pointer: coarse（粗糙指針，如觸控）
      if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
        return true
      }

      return false
    }

    setIsTouchDevice(checkTouchDevice())
  }, [])

  return isTouchDevice
}
