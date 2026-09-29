"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type StrategyCard = {
  id: string
  pair: string
  tf: string
  version: string
  author: string
  netPnlPct: number
  maxDdPct: number
  winRate: number
  profitFactor: number
  trades: number
  equity: number[]
}

const DEMO: StrategyCard[] = [
  {
    id: "bnbusdt-2h-a",
    pair: "BNBUSDT",
    tf: "2h",
    version: "v1",
    author: "Anonymous",
    netPnlPct: 19978.73,
    maxDdPct: -6.48,
    winRate: 55.1,
    profitFactor: 10.35,
    trades: 1432,
    equity: [0, 2, 5, 8, 12, 18, 25, 40, 55, 72, 90, 110],
  },
  {
    id: "bnbusdt-2h-b",
    pair: "BNBUSDT",
    tf: "2h",
    version: "v1",
    author: "Anonymous",
    netPnlPct: 19978.73,
    maxDdPct: -6.48,
    winRate: 55.1,
    profitFactor: 10.35,
    trades: 1432,
    equity: [0, 3, 6, 9, 14, 20, 28, 42, 58, 75, 95, 115],
  },
  {
    id: "ltcusdt-1h-a",
    pair: "LTCUSDT",
    tf: "1h",
    version: "v1",
    author: "Anonymous",
    netPnlPct: 19972.77,
    maxDdPct: -21.93,
    winRate: 60.1,
    profitFactor: 2.77,
    trades: 2145,
    equity: [0, 1, 4, 7, 11, 16, 24, 35, 48, 62, 80, 100],
  },
  {
    id: "xauusd-h1-a",
    pair: "XAUUSD",
    tf: "1h",
    version: "v2",
    author: "BotForge",
    netPnlPct: 842.5,
    maxDdPct: -12.4,
    winRate: 58.2,
    profitFactor: 1.92,
    trades: 486,
    equity: [0, 2, 3, 5, 8, 10, 14, 18, 22, 28, 35, 42],
  },
]

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const w = 220
  const h = 56
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2
      return `${x},${y}`
    })
    .join(" ")
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full">
      <polyline fill="none" stroke="#34d399" strokeWidth="2" points={pts} />
    </svg>
  )
}

export default function StrategiesPage() {
  const [pair, setPair] = useState("all")
  const [tf, setTf] = useState("all")
  const [minPnl, setMinPnl] = useState("")
  const [minPf, setMinPf] = useState("")
  const [sort, setSort] = useState("profit")

  const filtered = useMemo(() => {
    let rows = [...DEMO]
    if (pair !== "all") rows = rows.filter((r) => r.pair === pair)
    if (tf !== "all") rows = rows.filter((r) => r.tf === tf)
    if (minPnl) rows = rows.filter((r) => r.netPnlPct >= Number(minPnl))
    if (minPf) rows = rows.filter((r) => r.profitFactor >= Number(minPf))
    rows.sort((a, b) => (sort === "pf" ? b.profitFactor - a.profitFactor : b.netPnlPct - a.netPnlPct))
    return rows
  }, [pair, tf, minPnl, minPf, sort])

  return (
    <div className="min-h-screen bg-[#070a0e] py-10 text-zinc-100">
      <div className="container mx-auto max-w-7xl px-4">
        <h1 className="text-3xl font-bold tracking-tight">Browse Strategies</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Public trading strategies, ranked by leaderboard performance. Filter by KPI, fork what catches your eye,
          iterate.
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-[#0d1218] px-6 py-8 text-center">
          <p className="text-4xl font-semibold tracking-tight text-violet-300 md:text-5xl">1,111,912</p>
          <p className="mt-2 text-xs uppercase tracking-[0.25em] text-zinc-500">Backtests</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Select value={pair} onValueChange={setPair}>
            <SelectTrigger className="w-[140px] border-zinc-700 bg-[#0d1218]">
              <SelectValue placeholder="All pairs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All pairs</SelectItem>
              <SelectItem value="BNBUSDT">BNBUSDT</SelectItem>
              <SelectItem value="LTCUSDT">LTCUSDT</SelectItem>
              <SelectItem value="XAUUSD">XAUUSD</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tf} onValueChange={setTf}>
            <SelectTrigger className="w-[120px] border-zinc-700 bg-[#0d1218]">
              <SelectValue placeholder="TF" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All TF</SelectItem>
              <SelectItem value="1h">1h</SelectItem>
              <SelectItem value="2h">2h</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Min P&L %"
            value={minPnl}
            onChange={(e) => setMinPnl(e.target.value)}
            className="w-[120px] border-zinc-700 bg-[#0d1218]"
          />
          <Input
            placeholder="Min PF"
            value={minPf}
            onChange={(e) => setMinPf(e.target.value)}
            className="w-[100px] border-zinc-700 bg-[#0d1218]"
          />
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[140px] border-zinc-700 bg-[#0d1218]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profit">Best profit</SelectItem>
              <SelectItem value="pf">Best PF</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-violet-600 hover:bg-violet-500">Filter</Button>
          <Button
            variant="outline"
            className="border-zinc-700"
            onClick={() => {
              setPair("all")
              setTf("all")
              setMinPnl("")
              setMinPf("")
              setSort("profit")
            }}
          >
            Clear
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((s) => (
            <Link
              key={s.id}
              href={`/backtest/report?id=${s.id}`}
              className="group rounded-2xl border border-zinc-800 bg-[#0d1218] p-4 transition hover:border-violet-500/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold">
                    {s.pair} {s.tf}
                  </p>
                  <p className="text-xs text-zinc-500">{s.version}</p>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-400 border-0">PUBLIC</Badge>
              </div>
              <p className="mt-2 text-xs text-zinc-500">by {s.author}</p>
              <div className="mt-3">
                <Sparkline data={s.equity} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-zinc-500">NET P&L %</p>
                  <p className="font-semibold text-emerald-400">+{s.netPnlPct.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-zinc-500">MAX DD %</p>
                  <p className="font-semibold text-red-400">{s.maxDdPct.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-zinc-500">WIN RATE</p>
                  <p className="font-semibold">{s.winRate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-zinc-500">PF / TRADES</p>
                  <p className="font-semibold">
                    {s.profitFactor.toFixed(2)} / {s.trades}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-800 bg-[#0d1218] p-6">
          <h2 className="text-lg font-semibold">Build your own</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Describe a strategy in plain English and compile to 8 languages via the engine.
          </p>
          <Link href="/bots/create">
            <Button className="mt-4 bg-violet-600 hover:bg-violet-500">Open strategy builder</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
