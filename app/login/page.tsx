"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const { user, loading, login } = useAuth()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [mql5Login, setMql5Login] = useState("")
  const [mql5Password, setMql5Password] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard")
  }, [user, loading, router])

  const handle = async (provider: "google" | "github") => {
    setBusy(true)
    setError("")
    try {
      await login(provider)
      router.replace("/dashboard")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed")
    } finally {
      setBusy(false)
    }
  }

  const handleMql5 = async () => {
    setBusy(true)
    setError("")
    try {
      await login("mql5", { mql5Login, mql5Password })
      router.replace("/dashboard")
    } catch (e) {
      setError(e instanceof Error ? e.message : "MQL5 login failed")
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-spotify-black">
        <p className="font-display text-2xl text-spotify-green animate-pulse">BotForge</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-spotify-black px-4 py-16">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold text-spotify-green">BotForge</h1>
          <p className="mt-2 text-sm text-spotify-text-secondary">
            Google, GitHub, or MQL5 Community credentials.
          </p>
        </div>
        <Card className="border-spotify-grey bg-spotify-dark-grey shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-xl">Sign in</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              disabled={busy}
              onClick={() => handle("google")}
              className="h-12 w-full bg-white font-medium text-gray-900 hover:bg-gray-100"
            >
              Continue with Google
            </Button>
            <Button
              disabled={busy}
              onClick={() => handle("github")}
              variant="outline"
              className="h-12 w-full border-spotify-grey bg-spotify-black text-white hover:bg-spotify-grey"
            >
              Continue with GitHub
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-spotify-grey" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-spotify-dark-grey px-2 text-spotify-text-secondary">or MQL5 Community</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-spotify-text-secondary">MQL5 login</Label>
                <Input
                  value={mql5Login}
                  onChange={(e) => setMql5Login(e.target.value)}
                  className="mt-1.5 border-spotify-grey bg-spotify-black"
                  placeholder="Community login"
                  autoComplete="username"
                />
              </div>
              <div>
                <Label className="text-spotify-text-secondary">Password</Label>
                <Input
                  type="password"
                  value={mql5Password}
                  onChange={(e) => setMql5Password(e.target.value)}
                  className="mt-1.5 border-spotify-grey bg-spotify-black"
                  autoComplete="current-password"
                />
              </div>
              <Button disabled={busy} onClick={handleMql5} className="bf-btn-primary w-full">
                Sign in with MQL5
              </Button>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
