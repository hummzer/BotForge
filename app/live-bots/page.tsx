"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pause, Play, Radio, Square, Wifi, WifiOff } from "lucide-react"
import { readBots, writeBots, type Bot } from "@/lib/botforge"

export default function LiveBotsPage() {
  const [bots, setBots] = useState<Bot[]>([])
  const [price, setPrice] = useState<number | null>(null)
  const [change, setChange] = useState(0)
  const [connected, setConnected] = useState(false)
  const [paperEquity, setPaperEquity] = useState(10000)
  const [entry, setEntry] = useState<number | null>(null)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    setBots(readBots())
    const socket = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@ticker")
    socketRef.current = socket
    socket.onopen = () => setConnected(true)
    socket.onclose = () => setConnected(false)
    socket.onerror = () => setConnected(false)
    socket.onmessage = event => {
      const data = JSON.parse(event.data)
      setPrice(Number(data.c))
      setChange(Number(data.P))
    }
    return () => socket.close()
  }, [])

  useEffect(() => {
    if (price === null || entry === null) return
    const positionPnl = ((price - entry) / entry) * 1000
    setPaperEquity(10000 + positionPnl)
  }, [price, entry])

  const running = useMemo(() => bots.filter(b => b.status === "Running").length, [bots])
  const update = (next: Bot[]) => { setBots(next); writeBots(next) }

  const startPaper = () => { if (price !== null && entry === null) setEntry(price) }
  const stopPaper = () => { setEntry(null); setPaperEquity(10000) }

  return (
    <div className="min-h-screen bg-spotify-black py-10 text-spotify-text-primary">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="font-display text-3xl font-bold">Live Bots</h1><p className="mt-2 text-sm text-spotify-text-secondary">Real-time paper execution using a public BTC/USDT market stream. No live orders are sent.</p></div>
          <Badge className="gap-2">{connected ? <><Wifi className="h-3 w-3" /> LIVE</> : <><WifiOff className="h-3 w-3" /> OFFLINE</>}</Badge>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Card className="border-spotify-grey bg-spotify-dark-grey p-4"><p className="text-xs text-spotify-text-secondary">BTC/USDT</p><p className="mt-1 text-2xl font-bold">{price ? `$${price.toLocaleString(undefined,{maximumFractionDigits:2})}` : "—"}</p><p className={change >= 0 ? "text-spotify-green" : "text-red-400"}>{change.toFixed(2)}% 24h</p></Card>
          <Card className="border-spotify-grey bg-spotify-dark-grey p-4"><p className="text-xs text-spotify-text-secondary">Running bots</p><p className="mt-1 text-2xl font-bold">{running}</p></Card>
          <Card className="border-spotify-grey bg-spotify-dark-grey p-4"><p className="text-xs text-spotify-text-secondary">Paper equity</p><p className="mt-1 text-2xl font-bold">{paperEquity.toFixed(2)}</p></Card>
          <Card className="border-spotify-grey bg-spotify-dark-grey p-4"><p className="text-xs text-spotify-text-secondary">Position</p><p className="mt-1 text-2xl font-bold">{entry ? "LONG" : "FLAT"}</p></Card>
        </div>

        <Card className="mt-6 border-spotify-grey bg-spotify-dark-grey">
          <CardHeader><CardTitle className="flex items-center gap-2"><Radio className="text-spotify-green" /> Paper execution</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-spotify-text-secondary">The paper engine marks a long entry at the current stream price and continuously marks it to market. It is deliberately isolated from real broker execution.</p>
            <div className="mt-5 flex gap-3">
              <Button onClick={startPaper} disabled={!price || entry !== null} className="bg-spotify-green text-spotify-black"><Play className="mr-2 h-4 w-4" />Enter long</Button>
              <Button onClick={stopPaper} variant="outline" disabled={entry === null}><Square className="mr-2 h-4 w-4" />Close paper position</Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {bots.map(bot => <Card key={bot.id} className="border-spotify-grey bg-spotify-dark-grey"><CardHeader><CardTitle>{bot.name}</CardTitle><p className="text-xs text-spotify-text-secondary">{bot.symbol} · {bot.timeframe}</p></CardHeader><CardContent><Badge>{bot.status}</Badge><div className="mt-4 flex gap-2"><Button size="sm" onClick={() => update(bots.map(b => b.id === bot.id ? {...b,status:"Running"} : b))} className="bg-spotify-green text-spotify-black"><Play className="mr-1 h-4 w-4" />Run</Button><Button size="sm" variant="outline" onClick={() => update(bots.map(b => b.id === bot.id ? {...b,status:"Paused"} : b))}><Pause className="mr-1 h-4 w-4" />Pause</Button></div></CardContent></Card>)}
        </div>
      </div>
    </div>
  )
}
