"use client"

import { useEffect, useState } from "react"
import { Activity, Wifi, WifiOff } from "lucide-react"

type Tick = { price: number; change24h: number }

function MarketCard({
  label,
  tick,
  connected,
  connectingLabel = "CONNECTING",
}: {
  label: string
  tick: Tick | null
  connected: boolean
  connectingLabel?: string
}) {
  return (
    <div className="rounded-xl border border-spotify-grey bg-spotify-dark-grey/80 p-4 shadow-xl">
      <div className="flex items-center justify-between text-xs text-spotify-text-secondary">
        <span className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-spotify-green" /> LIVE MARKET · {label}
        </span>
        <span className="flex items-center gap-1">
          {connected ? <Wifi className="h-3 w-3 text-spotify-green" /> : <WifiOff className="h-3 w-3" />}
          {connected ? "STREAMING" : connectingLabel}
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-4">
        <span className="font-display text-3xl font-bold tabular-nums">
          {tick ? `$${tick.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"}
        </span>
        <span className={tick && tick.change24h >= 0 ? "text-spotify-green" : "text-red-400"}>
          {tick ? `${tick.change24h.toFixed(2)}%` : "—"} 24h
        </span>
      </div>
    </div>
  )
}

export function RealtimeMarket() {
  const [btc, setBtc] = useState<Tick | null>(null)
  const [btcLive, setBtcLive] = useState(false)
  const [gold, setGold] = useState<Tick | null>(null)
  const [goldLive, setGoldLive] = useState(false)

  useEffect(() => {
    let socket: WebSocket | null = null
    let cancelled = false
    const connect = async () => {
      try {
        const response = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT", {
          cache: "no-store",
        })
        const snapshot = await response.json()
        if (!cancelled)
          setBtc({ price: Number(snapshot.lastPrice), change24h: Number(snapshot.priceChangePercent) })
      } catch {}
      if (cancelled) return
      socket = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@ticker")
      socket.onopen = () => setBtcLive(true)
      socket.onclose = () => setBtcLive(false)
      socket.onerror = () => setBtcLive(false)
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setBtc({ price: Number(data.c), change24h: Number(data.P) })
      }
    }
    connect()
    return () => {
      cancelled = true
      socket?.close()
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const r = await fetch("/api/market/gold", { cache: "no-store" })
        const d = await r.json()
        if (!r.ok || cancelled) return
        setGold({ price: Number(d.price), change24h: Number(d.changePct) })
        setGoldLive(true)
      } catch {
        if (!cancelled) setGoldLive(false)
      }
    }
    load()
    const id = window.setInterval(load, 30_000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  return (
    <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-3">
      <MarketCard label="BTC/USDT" tick={btc} connected={btcLive} />
      <MarketCard label="XAU/USD" tick={gold} connected={goldLive} connectingLabel="REFRESHING" />
    </div>
  )
}
