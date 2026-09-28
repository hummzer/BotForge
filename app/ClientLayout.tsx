"use client"

import type React from "react"
import { Chatbot } from "@/components/chatbot"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { inter, orbitron, firaCode } from "@/lib/fonts"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "My Bots", href: "/bots" },
    { name: "Live Bots", href: "/live-bots" },
    { name: "Backtesting", href: "/backtest" },
    { name: "Strategies", href: "/strategies" },
    { name: "Journal", href: "/journal" },
    { name: "Brokers", href: "/brokers" },
    { name: "Pricing", href: "/pricing" },
    { name: "Market Data", href: "/data" },
    { name: "Settings", href: "/settings" },
  ]

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-spotify-black font-sans antialiased text-spotify-text-primary flex flex-col", inter.variable, orbitron.variable, firaCode.variable)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <header className="sticky top-0 z-50 w-full border-b border-spotify-grey bg-spotify-dark-grey/95 py-4 backdrop-blur">
            <div className="container mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 px-4 md:flex-row md:justify-between">
              <Link href="/" className="font-display text-2xl font-bold text-spotify-green">BotForge</Link>
              <nav className="flex flex-wrap justify-center gap-5 text-sm">
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href} className={cn("font-medium text-spotify-text-secondary transition-colors hover:text-spotify-green", pathname === link.href && "text-spotify-green")}>{link.name}</Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <Chatbot />
        </ThemeProvider>
      </body>
    </html>
  )
}
