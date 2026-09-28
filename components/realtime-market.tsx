"use client"

import { useEffect, useState } from "react"
import { Activity, Wifi, WifiOff } from "lucide-react"

type Tick = { price: number; change24h: number }

export function RealtimeMarket() {
  const [tick, setTick] = useState<Tick | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    let socket: WebSocket | null = null
    let cancelled = false
    const connect = async () => {
      try {
        const response = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT", { cache: "no-store" })
        const snapshot = await response.json()
        if (!cancelled) setTick({ price: Number(snapshot.lastPrice), change24h: Number(snapshot.priceChangePercent) })
      } catch {}
      if (cancelled) return
      socket = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@ticker")
      socket.onopen = () => setConnected(true)
      socket.onclose = () => setConnected(false)
      socket.onerror = () => setConnected(false)
      socket.onmessage = event => {
        const data = JSON.parse(event.data)
        setTick({ price: Number(data.c), change24h: Number(data.P) })
      }
    }
    connect()
    return () => {
      cancelled = true
      socket?.close()
    }
  }, [])

  return (
    <div className="mx-auto mt-10 max-w-3xl rounded-xl border border-spotify-grey bg-spotify-dark-grey/80 p-4 shadow-xl">
      <div className="flex items-center justify-between text-xs text-spotify-text-secondary">
        <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-spotify-green" /> LIVE MARKET · BTC/USDT</span>
        <span className="flex items-center gap-1">{connected ? <Wifi className="h-3 w-3 text-spotify-green" /> : <WifiOff className="h-3 w-3" />}{connected ? "STREAMING" : "CONNECTING"}</span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-4">
        <span className="font-display text-3xl font-bold">{tick ? `$${tick.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"}</span>
        <span className={tick && tick.change24h >= 0 ? "text-spotify-green" : "text-red-400"}>{tick ? `${tick.change24h.toFixed(2)}%` : "—"} 24h</span>
      </div>
    </div>
  )
}
