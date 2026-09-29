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
  { name: "Browse Strategies", href: "/strategies" },
  { name: "Strategy Report", href: "/backtest/report" },
  { name: "My Bots", href: "/bots" },
  { name: "Backtesting", href: "/backtest" },
  { name: "Journal", href: "/journal" },
  { name: "Brokers", href: "/brokers" },
  { name: "Settings", href: "/settings" },
]

const protectedPaths = [
  "/strategies",
  "/bots",
  "/live-bots",
  "/backtest",
  "/journal",
  "/brokers",
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
    if (needsAuth && !user) router.replace("/login")
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
    <header className="sticky top-0 z-50 w-full border-b border-spotify-grey bg-[#0b0f14]/95 py-3 backdrop-blur">
      <div className="container mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 md:flex-row md:justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-white">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm">BF</span>
          BotForge
        </Link>
        <nav className="flex flex-wrap justify-center gap-4 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-1.5 font-medium text-zinc-400 transition-colors hover:text-white",
                (pathname === link.href || pathname.startsWith(link.href + "/")) &&
                  "bg-violet-600/20 text-violet-300",
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-zinc-400 sm:inline">{user.name}</span>
              <Button variant="ghost" size="sm" onClick={logout} className="text-red-400 hover:text-red-300">
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" className="bg-violet-600 text-white hover:bg-violet-500">
                Account
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
          "min-h-screen bg-[#070a0e] font-sans antialiased text-zinc-100 flex flex-col",
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
