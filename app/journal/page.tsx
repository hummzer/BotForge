"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

type Trade = {
  id: string
  date: string
  symbol: string
  side: "BUY" | "SELL"
  entry: number
  exit: number
  size: number
  pnl: number
  strategy: string
  timeframe: string
  emotion: string
  notes: string
}

const KEY = "botforge:journal"

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [form, setForm] = useState({
    symbol: "BTCUSDT",
    side: "BUY" as "BUY" | "SELL",
    entry: "",
    exit: "",
    size: "0.01",
    strategy: "",
    timeframe: "H1",
    emotion: "",
    notes: "",
  })

  useEffect(() => {
    try {
      setTrades(JSON.parse(localStorage.getItem(KEY) || "[]"))
    } catch {}
  }, [])

  const save = (next: Trade[]) => {
    setTrades(next)
    localStorage.setItem(KEY, JSON.stringify(next))
  }

  const totalPnl = useMemo(() => trades.reduce((s, t) => s + t.pnl, 0), [trades])
  const wins = trades.filter((t) => t.pnl > 0).length
  const winRate = trades.length ? (wins / trades.length) * 100 : 0

  const equityData = useMemo(() => {
    let eq = 10000
    return [...trades].reverse().map((t, i) => {
      eq += t.pnl
      return { trade: i + 1, equity: Number(eq.toFixed(2)), pnl: t.pnl }
    })
  }, [trades])

  const add = () => {
    const entry = Number(form.entry)
    const exit = Number(form.exit)
    const size = Number(form.size)
    if (!entry || !exit || !size) return
    const pnl = form.side === "BUY" ? (exit - entry) * size : (entry - exit) * size
    save([
      {
        ...form,
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        entry,
        exit,
        size,
        pnl,
      },
      ...trades,
    ])
    setForm({ ...form, entry: "", exit: "", notes: "", emotion: "" })
  }

  return (
    <div className="min-h-screen bg-spotify-black py-10 text-spotify-text-primary">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.3em] text-spotify-green">BOTFORGE · JOURNAL</p>
            <h1 className="mt-2 font-display text-4xl font-bold">Trading Journal</h1>
            <p className="mt-2 text-sm text-spotify-text-secondary max-w-lg">
              Log every trade with context. Stats and equity update from your real entries — no mock data.
            </p>
          </div>
          <BookOpen className="h-10 w-10 text-spotify-green shrink-0" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {[
            { label: "Trades", value: String(trades.length) },
            { label: "Win rate", value: `${winRate.toFixed(1)}%` },
            {
              label: "Net P/L",
              value: `${totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}`,
              color: totalPnl >= 0 ? "text-spotify-green" : "text-red-400",
            },
            { label: "Wins / Losses", value: `${wins} / ${trades.length - wins}` },
          ].map((s) => (
            <Card key={s.label} className="border-spotify-grey bg-spotify-dark-grey">
              <CardContent className="p-6">
                <p className="text-xs text-spotify-text-secondary uppercase tracking-wide">{s.label}</p>
                <p className={`mt-2 text-3xl font-bold ${s.color || "text-spotify-text-primary"}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {equityData.length > 1 && (
          <Card className="border-spotify-grey bg-spotify-dark-grey mb-10">
            <CardHeader>
              <CardTitle className="text-lg">Equity progression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equityData}>
                    <defs>
                      <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1db954" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#1db954" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                    <XAxis dataKey="trade" stroke="#a0a0a0" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#a0a0a0" tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={{
                        background: "#121212",
                        border: "1px solid #282828",
                        borderRadius: 8,
                      }}
                    />
                    <Area type="monotone" dataKey="equity" stroke="#1db954" fill="url(#eqFill)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
          <Card className="border-spotify-grey bg-spotify-dark-grey h-fit">
            <CardHeader>
              <CardTitle>Log a trade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-spotify-text-secondary">Symbol</Label>
                  <Input
                    value={form.symbol}
                    onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                    className="mt-1.5 bg-spotify-black border-spotify-grey h-11"
                  />
                </div>
                <div>
                  <Label className="text-spotify-text-secondary">Side</Label>
                  <select
                    value={form.side}
                    onChange={(e) => setForm({ ...form, side: e.target.value as "BUY" | "SELL" })}
                    className="mt-1.5 h-11 w-full rounded-md border border-spotify-grey bg-spotify-black px-3 text-sm"
                  >
                    <option>BUY</option>
                    <option>SELL</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-spotify-text-secondary">Entry</Label>
                  <Input type="number" step="any" value={form.entry} onChange={(e) => setForm({ ...form, entry: e.target.value })} className="mt-1.5 bg-spotify-black border-spotify-grey h-11" />
                </div>
                <div>
                  <Label className="text-spotify-text-secondary">Exit</Label>
                  <Input type="number" step="any" value={form.exit} onChange={(e) => setForm({ ...form, exit: e.target.value })} className="mt-1.5 bg-spotify-black border-spotify-grey h-11" />
                </div>
                <div>
                  <Label className="text-spotify-text-secondary">Size</Label>
                  <Input type="number" step="any" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className="mt-1.5 bg-spotify-black border-spotify-grey h-11" />
                </div>
              </div>
              <div>
                <Label className="text-spotify-text-secondary">Strategy</Label>
                <Input value={form.strategy} onChange={(e) => setForm({ ...form, strategy: e.target.value })} placeholder="e.g. RSI + SMA" className="mt-1.5 bg-spotify-black border-spotify-grey h-11" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-spotify-text-secondary">Timeframe</Label>
                  <Input value={form.timeframe} onChange={(e) => setForm({ ...form, timeframe: e.target.value })} className="mt-1.5 bg-spotify-black border-spotify-grey h-11" />
                </div>
                <div>
                  <Label className="text-spotify-text-secondary">Emotion</Label>
                  <Input value={form.emotion} onChange={(e) => setForm({ ...form, emotion: e.target.value })} placeholder="Focused" className="mt-1.5 bg-spotify-black border-spotify-grey h-11" />
                </div>
              </div>
              <div>
                <Label className="text-spotify-text-secondary">Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="mt-1.5 bg-spotify-black border-spotify-grey" />
              </div>
              <Button onClick={add} className="w-full h-12 bg-spotify-green text-spotify-black hover:bg-spotify-green/90">
                <Plus className="mr-2 h-4 w-4" /> Save trade
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-5">
            {trades.length === 0 ? (
              <Card className="border-spotify-grey bg-spotify-dark-grey">
                <CardContent className="py-20 text-center text-sm text-spotify-text-secondary">
                  No trades yet. Log your first trade to start the equity curve.
                </CardContent>
              </Card>
            ) : (
              trades.map((t) => (
                <Card key={t.id} className="border-spotify-grey bg-spotify-dark-grey hover:border-spotify-green/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-3 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={t.side === "BUY" ? "bg-spotify-green/20 text-spotify-green" : "bg-red-400/20 text-red-400"}>
                            {t.side}
                          </Badge>
                          <span className="font-semibold text-lg">{t.symbol}</span>
                          {t.strategy && <span className="text-sm text-spotify-text-secondary">{t.strategy}</span>}
                          <Badge variant="outline" className="border-spotify-grey text-xs">{t.timeframe}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-6 text-sm">
                          <div>
                            <p className="text-xs text-spotify-text-secondary">Entry</p>
                            <p className="font-mono mt-0.5">{t.entry}</p>
                          </div>
                          <div>
                            <p className="text-xs text-spotify-text-secondary">Exit</p>
                            <p className="font-mono mt-0.5">{t.exit}</p>
                          </div>
                          <div>
                            <p className="text-xs text-spotify-text-secondary">Size</p>
                            <p className="font-mono mt-0.5">{t.size}</p>
                          </div>
                        </div>
                        {t.emotion && <p className="text-xs text-spotify-text-secondary">Emotion: {t.emotion}</p>}
                        {t.notes && <p className="text-sm text-spotify-text-secondary leading-relaxed">{t.notes}</p>}
                        <p className="text-xs text-spotify-text-secondary">{new Date(t.date).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <span className={`text-xl font-bold flex items-center gap-1 ${t.pnl >= 0 ? "text-spotify-green" : "text-red-400"}`}>
                          {t.pnl >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                          {t.pnl >= 0 ? "+" : ""}{t.pnl.toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400/80 hover:text-red-400"
                          onClick={() => save(trades.filter((x) => x.id !== t.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
