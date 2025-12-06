'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { ShieldX, LogOut } from 'lucide-react'

export default function UnauthorizedPage() {
  const handleLogout = async () => {
    // 呼叫登出 API
    const response = await fetch('/auth/logout', {
      method: 'POST',
    })
    
    if (response.redirected) {
      window.location.href = response.url
    } else {
      window.location.href = '/login'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-[400px] shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">
            存取被拒絕
          </CardTitle>
          <CardDescription className="text-base">
            您的帳號沒有權限存取此系統。
            <br />
            此系統僅供授權使用者使用。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            如果您認為這是一個錯誤，請聯繫系統管理員。
          </p>
          <Button
            variant="outline"
            className="w-full h-12 text-base font-medium"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            登出並返回登入頁面
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
