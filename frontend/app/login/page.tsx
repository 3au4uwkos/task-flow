"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { AuthForm } from "@/components/auth-form"
import { useAuth } from "@/lib/auth"

export default function LoginPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/kanban")
    }
  }, [user, router])

  if (user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid-pattern min-h-screen">
        <Navigation />

        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <AuthForm />
          </div>
        </div>
      </div>
    </div>
  )
}
