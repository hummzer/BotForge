import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import ClientLayout from "./ClientLayout"

const site = "https://bot-forge-ten.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "BotForge | Build, Backtest & Deploy Trading Bots",
    template: "%s | BotForge",
  },
  description:
    "BotForge is an algorithmic trading workspace: compile strategies into Python, MQL4, MQL5, Pine Script and more, backtest real market candles, journal trades, connect OANDA, and monitor paper bots.",
  keywords: [
    "BotForge",
    "trading bot builder",
    "algorithmic trading",
    "MQL5 expert advisor",
    "Pine Script generator",
    "strategy backtesting",
    "crypto backtest",
    "forex bot",
    "OANDA API",
    "MetaTrader EA",
    "paper trading",
    "economic calendar",
  ],
  applicationName: "BotForge",
  category: "finance",
  authors: [{ name: "Hummzer", url: "https://hummzer.vercel.app" }],
  creator: "Hummzer",
  publisher: "BotForge",
  alternates: { canonical: "/" },
  openGraph: {
    title: "BotForge | Build, Backtest & Deploy Trading Bots",
    description:
      "Compile multi-language trading strategies, run a MetaTrader-style tester on real candles, journal, and connect brokers.",
    url: site,
    siteName: "BotForge",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BotForge | Algorithmic Trading Workspace",
    description: "Build, backtest and monitor trading bots with real market data.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: {},
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientLayout>
      {children}
      <Toaster />
    </ClientLayout>
  )
}
