"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pause, Play, Radio, Square, Wifi, WifiOff } from "lucide-react"
import Link from "next/link"
import { readBots, writeBots, type Bot } from "@/lib/botforge"

export default function LiveBotsPage() {
  const [bots, setBots] = useState<Bot[]>([])
  const [price, setPrice] = useState<number | null>(null)
  const [change, setChange] = useState(0)
  const [connected, setConnected] = useState(false)
  const [paperEquity, setPaperEquity] = useState(10000)
  const [entry, setEntry] = useState<number | null>(null)

  useEffect(() => {
    setBots(readBots())
    const onUp = () => setBots(readBots())
    window.addEventListener("botforge-workspace-updated", onUp)

    const socket = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@ticker")
    socket.onopen = () => setConnected(true)
    socket.onclose = () => setConnected(false)
    socket.onerror = () => setConnected(false)
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setPrice(Number(data.c))
      setChange(Number(data.P))
    }
    return () => {
      socket.close()
      window.removeEventListener("botforge-workspace-updated", onUp)
    }
  }, [])

  useEffect(() => {
    if (price === null || entry === null) return
    const positionPnl = ((price - entry) / entry) * 1000
    setPaperEquity(10000 + positionPnl)
  }, [price, entry])

  const running = useMemo(() => bots.filter((b) => b.status === "Running"), [bots])
  const update = (next: Bot[]) => {
    setBots(next)
    writeBots(next)
  }

  return (
    <div className="bf-page">
      <div className="bf-container bf-section-gap">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="bf-kicker">Live monitor</p>
            <h1 className="bf-title">Paper stream</h1>
            <p className="bf-sub">
              BTC/USDT public WebSocket marks a paper long. Running bots below share the same status as My Bots — no
              live orders are sent.
            </p>
          </div>
          <Badge className="gap-2 border-0 bg-spotify-grey">
            {connected ? (
              <>
                <Wifi className="h-3 w-3 text-spotify-green" /> LIVE
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" /> OFFLINE
              </>
            )}
          </Badge>
        </div>

        <div className="bf-grid-stats">
          <div className="bf-stat">
            <p className="bf-stat-label">BTC/USDT</p>
            <p className="bf-stat-value">
              {price ? `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"}
            </p>
            <p className={`text-xs ${change >= 0 ? "text-spotify-green" : "text-red-400"}`}>{change.toFixed(2)}% 24h</p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Running bots</p>
            <p className="bf-stat-value text-spotify-green">{running.length}</p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Paper equity</p>
            <p className="bf-stat-value">{paperEquity.toFixed(2)}</p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Position</p>
            <p className="bf-stat-value">{entry ? "LONG" : "FLAT"}</p>
          </div>
        </div>

        <Card className="border-spotify-grey bg-spotify-dark-grey">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="text-spotify-green" /> Paper execution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-spotify-text-secondary">
              Enter marks a long at the stream price (~$1000 notional). Equity marks to market until you close.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                onClick={() => price !== null && setEntry(price)}
                disabled={!price || entry !== null}
                className="bf-btn-primary"
              >
                <Play className="mr-2 h-4 w-4" /> Enter long
              </Button>
              <Button
                onClick={() => {
                  setEntry(null)
                  setPaperEquity(10000)
                }}
                variant="outline"
                disabled={entry === null}
                className="border-spotify-grey"
              >
                <Square className="mr-2 h-4 w-4" /> Close paper
              </Button>
              <Link href="/bots">
                <Button variant="outline" className="border-spotify-grey">
                  Manage bots
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {bots.length === 0 ? (
          <div className="bf-card-pad text-center text-sm text-spotify-text-secondary">
            No bots yet. Create one and set status to Running to see it here.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {bots.map((bot) => (
              <div key={bot.id} className="bf-card-pad">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{bot.name}</p>
                    <p className="text-xs text-spotify-text-secondary">
                      {bot.symbol} · {bot.timeframe} · {bot.language}
                    </p>
                  </div>
                  <Badge
                    className={
                      bot.status === "Running"
                        ? "bg-spotify-green/20 text-spotify-green border-0"
                        : "bg-spotify-grey text-spotify-text-secondary border-0"
                    }
                  >
                    {bot.status}
                  </Badge>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    className="bg-spotify-green text-spotify-black"
                    onClick={() =>
                      update(
                        bots.map((b) =>
                          b.id === bot.id
                            ? { ...b, status: "Running", lastRun: new Date().toISOString() }
                            : b,
                        ),
                      )
                    }
                  >
                    <Play className="mr-1 h-3.5 w-3.5" /> Run
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-spotify-grey"
                    onClick={() =>
                      update(bots.map((b) => (b.id === bot.id ? { ...b, status: "Paused" } : b)))
                    }
                  >
                    <Pause className="mr-1 h-3.5 w-3.5" /> Pause
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
