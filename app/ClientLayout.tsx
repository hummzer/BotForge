"use client"

import type React from "react"
import { Chatbot } from "@/components/chatbot"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { inter, orbitron, firaCode } from "@/lib/fonts" // Import fonts here

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // This is a client component to use usePathname
  function NavigationLinks() {
    const pathname = usePathname()
    const navLinks = [
      { name: "Home", href: "/" },
      { name: "My Bots", href: "/bots" },
      { name: "Live Bots", href: "/live-bots" }, // New link for live bots dashboard
      { name: "Backtesting", href: "/backtest" },
      { name: "Market Data", href: "/data" },
      { name: "Settings", href: "/settings" },
    ]

    return (
      <nav className="flex space-x-8 text-sm animate-fade-in-up animation-delay-100">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "text-spotify-text-secondary font-medium hover:text-spotify-green transition-colors duration-200",
              pathname === link.href && "text-spotify-green border-b-2 border-spotify-green pb-1",
            )}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    )
  }

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
          <header className="w-full bg-spotify-dark-grey py-4 shadow-lg sticky top-0 z-50">
            <div className="container mx-auto max-w-6xl px-4 flex flex-col items-center justify-center">
              <Link href="/" className="font-display text-2xl font-bold text-spotify-green animate-fade-in-up mb-4">
                Momo
              </Link>
              <NavigationLinks />
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <Chatbot />
        </ThemeProvider>
      </body>
    </html>
  )
}
