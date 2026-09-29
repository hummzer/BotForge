"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, Trash2, TrendingDown, TrendingUp, Sparkles } from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

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
  vibe: string
}

const KEY = "botforge:journal"

const VIBES = [
  { id: "sniper", label: "🎯 Sniper", tip: "Patient entry, clean exit" },
  { id: "flow", label: "🌊 Flow", tip: "In the zone" },
  { id: "revenge", label: "🔥 Revenge", tip: "Flag it — review later" },
  { id: "fomo", label: "😱 FOMO", tip: "Chased the move" },
  { id: "boss", label: "👑 Boss", tip: "Textbook setup" },
  { id: "meh", label: "😐 Meh", tip: "Flat energy" },
]

const QUIPS = [
  "Logged. Your future self says thanks.",
  "Another brick in the equity wall.",
  "Data > vibes — but vibes still count.",
  "Journal streak: keep it going.",
  "Risk managed. Story saved.",
]

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [toast, setToast] = useState("")
  const [form, setForm] = useState({
    symbol: "XAUUSD",
    side: "BUY" as "BUY" | "SELL",
    entry: "",
    exit: "",
    size: "0.1",
    strategy: "",
    timeframe: "H1",
    emotion: "",
    notes: "",
    vibe: "sniper",
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
    setToast(QUIPS[Math.floor(Math.random() * QUIPS.length)])
    window.setTimeout(() => setToast(""), 2800)
  }

  return (
    <div className="bf-page">
      <div className="bf-container bf-section-gap">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="bf-kicker">Journal</p>
            <h1 className="bf-title">Trade diary</h1>
            <p className="bf-sub">
              Log the setup, the size, and the vibe. Stats roll up from your entries only — nothing fake.
            </p>
          </div>
          <BookOpen className="h-10 w-10 shrink-0 text-spotify-green" />
        </div>

        {toast && (
          <div className="flex items-center gap-2 rounded-xl border border-spotify-green/40 bg-spotify-green/10 px-4 py-3 text-sm text-spotify-green">
            <Sparkles className="h-4 w-4" /> {toast}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Trades", value: String(trades.length) },
            { label: "Win rate", value: `${winRate.toFixed(1)}%` },
            {
              label: "Net P/L",
              value: `${totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}`,
              color: totalPnl >= 0 ? "text-spotify-green" : "text-red-400",
            },
            { label: "W / L", value: `${wins} / ${trades.length - wins}` },
          ].map((s) => (
            <div key={s.label} className="bf-stat">
              <p className="bf-stat-label">{s.label}</p>
              <p className={`bf-stat-value ${s.color || ""}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {equityData.length > 1 && (
          <div className="bf-card-pad">
            <p className="bf-stat-label mb-2">Equity from your journal</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData}>
                  <defs>
                    <linearGradient id="jEq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1db954" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#1db954" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                  <XAxis dataKey="trade" stroke="#a0a0a0" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#a0a0a0" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#121212", border: "1px solid #282828", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="equity" stroke="#1db954" fill="url(#jEq)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <Card className="h-fit border-spotify-grey bg-spotify-dark-grey">
            <CardHeader>
              <CardTitle>Drop a trade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-spotify-text-secondary">Vibe check</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {VIBES.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      title={v.tip}
                      onClick={() => setForm({ ...form, vibe: v.id })}
                      className={
                        form.vibe === v.id
                          ? "rounded-full bg-spotify-green px-3 py-1 text-xs font-medium text-spotify-black"
                          : "rounded-full border border-spotify-grey px-3 py-1 text-xs text-spotify-text-secondary"
                      }
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-spotify-text-secondary">Symbol</Label>
                  <Input
                    value={form.symbol}
                    onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                    className="mt-1.5 h-11 border-spotify-grey bg-spotify-black"
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
              <div className="grid grid-cols-3 gap-2">
                {(["entry", "exit", "size"] as const).map((k) => (
                  <div key={k}>
                    <Label className="text-spotify-text-secondary capitalize">{k}</Label>
                    <Input
                      type="number"
                      step="any"
                      value={form[k]}
                      onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                      className="mt-1.5 h-11 border-spotify-grey bg-spotify-black"
                    />
                  </div>
                ))}
              </div>
              <div>
                <Label className="text-spotify-text-secondary">Strategy tag</Label>
                <Input
                  value={form.strategy}
                  onChange={(e) => setForm({ ...form, strategy: e.target.value })}
                  placeholder="e.g. London sweep"
                  className="mt-1.5 h-11 border-spotify-grey bg-spotify-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-spotify-text-secondary">TF</Label>
                  <Input
                    value={form.timeframe}
                    onChange={(e) => setForm({ ...form, timeframe: e.target.value })}
                    className="mt-1.5 h-11 border-spotify-grey bg-spotify-black"
                  />
                </div>
                <div>
                  <Label className="text-spotify-text-secondary">Mood word</Label>
                  <Input
                    value={form.emotion}
                    onChange={(e) => setForm({ ...form, emotion: e.target.value })}
                    placeholder="Calm"
                    className="mt-1.5 h-11 border-spotify-grey bg-spotify-black"
                  />
                </div>
              </div>
              <div>
                <Label className="text-spotify-text-secondary">Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  placeholder="What did the chart say?"
                  className="mt-1.5 border-spotify-grey bg-spotify-black"
                />
              </div>
              <Button onClick={add} className="bf-btn-primary w-full">
                <Plus className="mr-2 h-4 w-4" /> Save trade
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {trades.length === 0 ? (
              <div className="bf-card-pad py-16 text-center text-sm text-spotify-text-secondary">
                Empty diary. First trade unlocks the equity curve ✨
              </div>
            ) : (
              trades.map((t) => {
                const vibe = VIBES.find((v) => v.id === t.vibe)
                return (
                  <div key={t.id} className="bf-card-pad transition hover:border-spotify-green/30">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            className={
                              t.side === "BUY"
                                ? "bg-spotify-green/20 text-spotify-green"
                                : "bg-red-400/20 text-red-400"
                            }
                          >
                            {t.side}
                          </Badge>
                          <span className="text-lg font-semibold">{t.symbol}</span>
                          {vibe && <span className="text-sm">{vibe.label}</span>}
                          <Badge variant="outline" className="border-spotify-grey text-xs">
                            {t.timeframe}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-spotify-text-secondary">Entry</p>
                            <p className="font-mono">{t.entry}</p>
                          </div>
                          <div>
                            <p className="text-xs text-spotify-text-secondary">Exit</p>
                            <p className="font-mono">{t.exit}</p>
                          </div>
                          <div>
                            <p className="text-xs text-spotify-text-secondary">Size</p>
                            <p className="font-mono">{t.size}</p>
                          </div>
                        </div>
                        {t.notes && <p className="text-sm text-spotify-text-secondary">{t.notes}</p>}
                        <p className="text-xs text-spotify-text-secondary">{new Date(t.date).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`flex items-center gap-1 text-xl font-bold ${t.pnl >= 0 ? "text-spotify-green" : "text-red-400"}`}
                        >
                          {t.pnl >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                          {t.pnl >= 0 ? "+" : ""}
                          {t.pnl.toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400/80"
                          onClick={() => save(trades.filter((x) => x.id !== t.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
