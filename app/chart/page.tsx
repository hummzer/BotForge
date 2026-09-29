"use client"

import { useEffect, useState } from "react"
import { TradingViewChart } from "@/components/tradingview-chart"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, LogIn } from "lucide-react"

const presets = [
  "OANDA:XAUUSD",
  "OANDA:EURUSD",
  "OANDA:GBPUSD",
  "BINANCE:BTCUSDT",
  "BINANCE:ETHUSDT",
  "NASDAQ:NDX",
]

const TV_SESSION = "botforge:tv_session"

export default function ChartPage() {
  const [symbol, setSymbol] = useState("OANDA:XAUUSD")
  const [tvLinked, setTvLinked] = useState(false)

  useEffect(() => {
    setTvLinked(localStorage.getItem(TV_SESSION) === "1")
  }, [])

  const openTradingViewAuth = () => {
    // TradingView does not expose a public OAuth client for third-party apps without a partner agreement.
    // Real sign-in happens on tradingview.com; after login, widgets respect the browser session cookies.
    window.open("https://www.tradingview.com/accounts/signin/", "tv_auth", "noopener,noreferrer,width=520,height=720")
    localStorage.setItem(TV_SESSION, "1")
    setTvLinked(true)
  }

  return (
    <div className="bf-page">
      <div className="bf-container-wide bf-section-gap">
        <div>
          <p className="bf-kicker">Chart lab</p>
          <h1 className="bf-title">Market preview</h1>
          <p className="bf-sub">
            Advanced chart widget. Sign in on TradingView in a secure popup so drawings and saved layouts from your TV
            account can apply in-browser (requires TradingView session cookies).
          </p>
        </div>

        <div className="bf-card-pad flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">TradingView account</p>
            <p className="mt-1 text-xs text-spotify-text-secondary">
              {tvLinked
                ? "Sign-in window was opened — complete login on TradingView, then reload the chart if needed."
                : "No session marked yet. Use Sign in to authenticate on TradingView.com."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={openTradingViewAuth} className="bf-btn-primary">
              <LogIn className="mr-2 h-4 w-4" /> Sign in to TradingView
            </Button>
            <a
              href="https://www.tradingview.com/chart/"
              target="_blank"
              rel="noopener noreferrer"
              className="bf-btn-ghost inline-flex items-center gap-1"
            >
              Open TV chart <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <Card className="border-spotify-grey bg-spotify-dark-grey">
          <CardContent className="p-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {presets.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={s === symbol ? "default" : "outline"}
                  className={s === symbol ? "bg-spotify-green text-spotify-black" : "border-spotify-grey"}
                  onClick={() => setSymbol(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
            <div className="h-[680px] w-full">
              <TradingViewChart symbol={symbol} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
