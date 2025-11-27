/**
 * 可收合的側邊欄導航組件
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  ListChecks,
  BarChart3,
  Settings,
  LogOut,
  Package,
  Clock,
  TrendingUp,
  Circle,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  title: string
  href?: string
  icon: LucideIcon
  badge?: string | number
  disabled?: boolean
  external?: boolean
  children?: NavItem[]
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

// 導航選單配置
const NAV_GROUPS: NavGroup[] = [
  {
    title: '主要功能',
    items: [
      {
        title: '儀表板',
        href: '/',
        icon: LayoutDashboard,
      },
      {
        title: '交易紀錄',
        href: '/trades',
        icon: ListChecks,
      },
      {
        title: '統計分析',
        href: '/analytics',
        icon: BarChart3,
        disabled: true, // 示範：未完成的功能
      },
    ],
  },
  {
    title: '系統',
    items: [
      {
        title: '設定',
        icon: Settings,
        children: [
          {
            title: '交易類型',
            href: '/settings/trade-types',
            icon: Circle,
          },
          {
            title: '商品',
            href: '/settings/commodities',
            icon: Package,
          },
          {
            title: '時間框架',
            href: '/settings/timeframes',
            icon: Clock,
          },
          {
            title: '趨勢線類型',
            href: '/settings/trendline-types',
            icon: TrendingUp,
          },
          {
            title: '進場類型',
            href: '/settings/entry-types',
            icon: ArrowRight,
          },
        ],
      },
    ],
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  // 避免 hydration 錯誤：先設置 mounted 狀態
  useEffect(() => {
    setMounted(true)
  }, [])

  // 從 localStorage 載入收合狀態（只在客戶端執行）
  useEffect(() => {
    if (!mounted) return

    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      setCollapsed(JSON.parse(saved))
    }

    // 展開包含當前路徑的選單項
    NAV_GROUPS.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children) {
          const hasActiveChild = item.children.some((child) => child.href === pathname)
          if (hasActiveChild) {
            setExpandedItems((prev) => new Set(prev).add(item.title))
          }
        }
      })
    })
  }, [pathname, mounted])

  // 儲存收合狀態
  const toggleCollapsed = () => {
    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState))
  }

  // 切換展開/收合子選單
  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(title)) {
        next.delete(title)
      } else {
        next.add(title)
      }
      return next
    })
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold">
              S
            </div>
            <span className="font-semibold text-lg">SNR Web</span>
          </Link>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className={cn('h-8 w-8', collapsed && 'mx-auto')}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {NAV_GROUPS.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Group Title */}
              {!collapsed && (
                <h4 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.title}
                </h4>
              )}

              {collapsed && groupIndex > 0 && (
                <Separator className="my-2" />
              )}

              {/* Group Items */}
              <div className="space-y-1">
                {group.items.map((item, itemIndex) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  const isExpanded = expandedItems.has(item.title)
                  const hasChildren = item.children && item.children.length > 0

                  return (
                    <div key={itemIndex}>
                      {/* Parent Item */}
                      {hasChildren ? (
                        <button
                          onClick={() => toggleExpanded(item.title)}
                          className={cn(
                            'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            'hover:bg-accent hover:text-accent-foreground',
                            item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                            collapsed && 'justify-center'
                          )}
                          title={collapsed ? item.title : undefined}
                          disabled={item.disabled}
                        >
                          <Icon className={cn('h-5 w-5', collapsed && 'h-6 w-6')} />

                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left">{item.title}</span>
                              <ChevronDown
                                className={cn(
                                  'h-4 w-4 transition-transform',
                                  isExpanded && 'rotate-180'
                                )}
                              />
                            </>
                          )}
                        </button>
                      ) : (
                        <Link
                          href={item.disabled ? '#' : item.href!}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            'hover:bg-accent hover:text-accent-foreground',
                            isActive && 'bg-accent text-accent-foreground',
                            item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                            collapsed && 'justify-center'
                          )}
                          title={collapsed ? item.title : undefined}
                        >
                          <Icon className={cn('h-5 w-5', collapsed && 'h-6 w-6')} />

                          {!collapsed && (
                            <>
                              <span className="flex-1">{item.title}</span>
                              {item.badge && (
                                <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </Link>
                      )}

                      {/* Child Items */}
                      {hasChildren && isExpanded && !collapsed && (
                        <div className="mt-1 space-y-1 pl-9">
                          {item.children!.map((child, childIndex) => {
                            const ChildIcon = child.icon
                            const isChildActive = pathname === child.href

                            return (
                              <Link
                                key={childIndex}
                                href={child.disabled ? '#' : child.href!}
                                className={cn(
                                  'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
                                  'hover:bg-accent hover:text-accent-foreground',
                                  isChildActive && 'bg-accent text-accent-foreground',
                                  child.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                                )}
                              >
                                <ChildIcon className="h-4 w-4" />
                                <span>{child.title}</span>
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom Section (User / Logout) */}
      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          onClick={() => setShowLogoutDialog(true)}
          className={cn(
            'w-full justify-start gap-3 cursor-pointer hover:bg-accent hover:text-accent-foreground',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className={cn('h-5 w-5', collapsed && 'h-6 w-6')} />
          {!collapsed && <span>登出</span>}
        </Button>

        {/* 登出確認對話框 */}
        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>確認登出</AlertDialogTitle>
              <AlertDialogDescription>
                確定要登出嗎？您需要重新登入才能繼續使用。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction asChild>
                <form action="/auth/logout" method="post">
                  <button type="submit" className="w-full">
                    確認登出
                  </button>
                </form>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  )
}
