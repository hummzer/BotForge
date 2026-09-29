"use client"

import { useEffect, useState } from "react"
import { TradingViewChart } from "@/components/tradingview-chart"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { readTradingViewUsername, writeTradingViewUsername } from "@/lib/botforge"
import { ExternalLink } from "lucide-react"

const presets = [
  "OANDA:XAUUSD",
  "OANDA:EURUSD",
  "OANDA:GBPUSD",
  "BINANCE:BTCUSDT",
  "BINANCE:ETHUSDT",
  "NASDAQ:NDX",
]

export default function ChartPage() {
  const [symbol, setSymbol] = useState("OANDA:XAUUSD")
  const [tvUser, setTvUser] = useState("")
  const [saved, setSaved] = useState("")

  useEffect(() => {
    setTvUser(readTradingViewUsername())
  }, [])

  const saveTv = () => {
    writeTradingViewUsername(tvUser.trim())
    setSaved(tvUser.trim())
  }

  return (
    <div className="bf-page">
      <div className="bf-container-wide bf-section-gap">
        <div>
          <p className="bf-kicker">Chart lab</p>
          <h1 className="bf-title">Market preview</h1>
          <p className="bf-sub">
            Full TradingView advanced chart. Link your username for a quick jump to your saved layouts on TradingView.
          </p>
        </div>

        <div className="bf-card-pad grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Label className="text-spotify-text-secondary">TradingView username</Label>
            <Input
              value={tvUser}
              onChange={(e) => setTvUser(e.target.value)}
              placeholder="your_tv_handle"
              className="mt-2 max-w-sm border-spotify-grey bg-spotify-black"
            />
            <p className="mt-1 text-xs text-spotify-text-secondary">
              Stored in this browser. Open your profile to use drawings/layouts you already own on TradingView.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={saveTv} className="bf-btn-primary">
              Save username
            </Button>
            {(saved || tvUser) && (
              <a
                href={`https://www.tradingview.com/u/${encodeURIComponent(saved || tvUser)}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="bf-btn-ghost inline-flex items-center gap-1"
              >
                Open profile <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <a
              href="https://www.tradingview.com/accounts/signin/"
              target="_blank"
              rel="noopener noreferrer"
              className="bf-btn-ghost inline-flex items-center gap-1"
            >
              Sign in on TV <ExternalLink className="h-3.5 w-3.5" />
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
