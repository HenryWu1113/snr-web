import { LoginForm } from '@/components/auth/login-form'
import { ThemeToggle } from '@/components/theme-toggle'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()

  // 如果已登入，重導向至主頁
  if (session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <LoginForm />
    </div>
  )
}
