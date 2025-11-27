'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Github } from 'lucide-react'
import { useState } from 'react'

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleGitHubLogin = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('Login error:', error.message)
      }
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-4 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight">
          SNR Trading Journal
        </CardTitle>
        <CardDescription className="text-base">
          使用 GitHub 帳號登入以管理交易紀錄
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Button
          variant="outline"
          className="w-full h-12 text-base font-medium"
          onClick={handleGitHubLogin}
          disabled={isLoading}
        >
          <Github className="mr-2 h-5 w-5" />
          {isLoading ? '登入中...' : '使用 GitHub 登入'}
        </Button>
      </CardContent>
    </Card>
  )
}
