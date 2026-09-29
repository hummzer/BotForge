"use client"

import type React from "react"
import { Chatbot } from "@/components/chatbot"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { inter, orbitron, firaCode } from "@/lib/fonts"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { XauusdTicker } from "@/components/xauusd-ticker"
import { Menu, X } from "lucide-react"

const publicLinks = [
  { name: "Home", href: "/" },
  { name: "Pricing", href: "/pricing" },
]

const privateLinks = [
  { name: "Strategies", href: "/strategies" },
  { name: "Bots", href: "/bots" },
  { name: "Backtest", href: "/backtest" },
  { name: "Chart", href: "/chart" },
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
  "/chart",
  "/settings",
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
      <div className="flex min-h-screen items-center justify-center bg-spotify-black">
        <p className="font-display text-2xl text-spotify-green animate-pulse">BotForge</p>
      </div>
    )
  }
  return <>{children}</>
}

function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const links = user ? [...publicLinks, ...privateLinks] : publicLinks

  return (
    <>
      <div className="border-b border-spotify-grey/60 bg-spotify-dark-grey/90">
        <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5">
          <XauusdTicker compact />
          <Link href="/chart" className="text-[11px] text-spotify-green hover:underline">
            Open chart →
          </Link>
        </div>
      </div>
      <header className="sticky top-0 z-50 w-full border-b border-spotify-grey bg-spotify-dark-grey/95 backdrop-blur">
        <div className="container mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="font-display text-xl font-bold text-spotify-green">
            BotForge
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-2.5 py-1.5 text-sm font-medium text-spotify-text-secondary transition hover:text-spotify-green",
                  (pathname === link.href || pathname.startsWith(link.href + "/")) &&
                    "bg-spotify-green/15 text-spotify-green",
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href="/settings" className="hidden text-sm text-spotify-text-secondary hover:text-spotify-green sm:inline">
                  {user.name}
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-red-400 hover:bg-red-400/10 hover:text-red-300"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm" className="rounded-full bg-spotify-green text-spotify-black hover:bg-spotify-green/90">
                  Sign in
                </Button>
              </Link>
            )}
            <button
              type="button"
              className="rounded-lg p-2 text-spotify-text-secondary lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-spotify-grey px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm text-spotify-text-secondary",
                    pathname === link.href && "bg-spotify-green/15 text-spotify-green",
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>
    </>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "flex min-h-screen flex-col bg-spotify-black font-sans text-spotify-text-primary antialiased",
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
