"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { LogOut, CheckCircle } from "lucide-react"

export default function LogoutPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Auto logout if user is logged in
    if (user) {
      logout()
    }
  }, [user, logout])

  const handleGoHome = () => {
    router.push("/")
  }

  const handleLogin = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid-pattern min-h-screen">
        <Navigation />

        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-border/50 text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl">Successfully Logged Out</CardTitle>
                <CardDescription>You have been safely logged out of your TaskFlow account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Thank you for using TaskFlow! Your session has been ended and all data has been cleared.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleGoHome} className="flex-1">
                    Go to Home
                  </Button>
                  <Button variant="outline" onClick={handleLogin} className="flex-1 bg-transparent">
                    <LogOut className="h-4 w-4 mr-2" />
                    Login Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
