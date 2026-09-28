"use client"

import type React from "react"
import { Chatbot } from "@/components/chatbot"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { inter, orbitron, firaCode } from "@/lib/fonts"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

const publicLinks = [
  { name: "Home", href: "/" },
  { name: "Pricing", href: "/pricing" },
]

const privateLinks = [
  { name: "Strategies", href: "/strategies" },
  { name: "My Bots", href: "/bots" },
  { name: "Backtesting", href: "/backtest" },
  { name: "Journal", href: "/journal" },
  { name: "Brokers", href: "/brokers" },
  { name: "Market Data", href: "/data" },
  { name: "Settings", href: "/settings" },
]

const protectedPaths = [
  "/strategies",
  "/bots",
  "/live-bots",
  "/backtest",
  "/journal",
  "/brokers",
  "/data",
  "/settings",
  "/chart",
]

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    const needsAuth = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))
    if (needsAuth && !user) {
      router.replace("/login")
    }
  }, [user, loading, pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-spotify-black flex items-center justify-center">
        <p className="font-display text-2xl text-spotify-green animate-pulse">BotForge</p>
      </div>
    )
  }

  return <>{children}</>
}

function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const links = user ? [...publicLinks, ...privateLinks] : publicLinks

  return (
    <header className="sticky top-0 z-50 w-full border-b border-spotify-grey bg-spotify-dark-grey/95 py-3 backdrop-blur">
      <div className="container mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 md:flex-row md:justify-between">
        <Link href="/" className="font-display text-2xl font-bold text-spotify-green">
          BotForge
        </Link>
        <nav className="flex flex-wrap justify-center gap-4 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-medium text-spotify-text-secondary transition-colors hover:text-spotify-green",
                pathname === link.href && "text-spotify-green",
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-spotify-text-secondary sm:inline">{user.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" className="bg-spotify-green text-spotify-black hover:bg-spotify-green/90">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-spotify-black font-sans antialiased text-spotify-text-primary flex flex-col",
          inter.variable,
          orbitron.variable,
          firaCode.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <AuthGate>
              <Navigation />
              <main className="flex-1">{children}</main>
              <Chatbot />
            </AuthGate>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
