import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import ClientLayout from "./ClientLayout"

export const metadata: Metadata = {
  metadataBase: new URL("https://bot-forge-ten.vercel.app"),
  title: {
    default: "BotForge | Build, Backtest & Monitor Trading Bots",
    template: "%s | BotForge",
  },
  description: "BotForge is an algorithmic trading workspace for building trading bots, generating strategy code, backtesting real market data and monitoring live paper execution.",
  keywords: [
    "BotForge", "trading bot builder", "algorithmic trading", "AI trading bot",
    "trading strategy backtesting", "crypto backtesting", "paper trading",
    "real time market data", "Python trading bot", "MQL5", "Pine Script",
  ],
  applicationName: "BotForge",
  category: "finance",
  alternates: { canonical: "/" },
  openGraph: {
    title: "BotForge | Build, Backtest & Monitor Trading Bots",
    description: "Build trading strategies, test them against market data and monitor real-time paper execution.",
    url: "https://bot-forge-ten.vercel.app",
    siteName: "BotForge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BotForge | Algorithmic Trading Workspace",
    description: "Build, backtest and monitor trading bots with real-time market data.",
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientLayout>
      {children}
      <Toaster />
    </ClientLayout>
  )
}
