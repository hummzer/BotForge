"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const { user, loading, login } = useAuth()
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace("/")
  }, [user, loading, router])

  const handle = async (provider: "google" | "github") => {
    setBusy(true)
    try {
      await login(provider)
      router.replace("/strategies")
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-spotify-black">
        <p className="font-display text-2xl text-spotify-green animate-pulse">BotForge</p>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-spotify-black px-4 py-16">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-spotify-green">BotForge</h1>
          <p className="mt-2 text-sm text-spotify-text-secondary">
            Sign in to build strategies, backtest, journal trades and connect brokers.
          </p>
        </div>
        <Card className="border-spotify-grey bg-spotify-dark-grey shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-xl">Sign in to continue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              disabled={busy}
              onClick={() => handle("google")}
              className="w-full h-12 bg-white text-gray-900 hover:bg-gray-100 font-medium"
            >
              Continue with Google
            </Button>
            <Button
              disabled={busy}
              onClick={() => handle("github")}
              variant="outline"
              className="w-full h-12 border-spotify-grey bg-spotify-black text-white hover:bg-spotify-grey"
            >
              Continue with GitHub
            </Button>
            <p className="text-xs text-center text-spotify-text-secondary pt-2">
              By signing in you agree to BotForge Terms and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
