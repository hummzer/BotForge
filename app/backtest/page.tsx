"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Play, FileBarChart, Gauge, FlaskConical } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  fetchBinanceCandles,
  runSmaRsiBacktest,
  optimizeSmaRsi,
  saveBacktestResult,
  readBots,
  readBacktestResults,
  type BacktestResult,
  type Bot,
} from "@/lib/botforge"
import { tryListBot } from "@/lib/marketplace"
import { useAuth } from "@/lib/auth-context"

type Tab = "settings" | "results" | "journal" | "history"

export default function BacktestingPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>("settings")
  const [bots, setBots] = useState<Bot[]>([])
  const [expertId, setExpertId] = useState("builtin")
  const [symbol, setSymbol] = useState("BTCUSDT")
  const [period, setPeriod] = useState("1h")
  const [deposit, setDeposit] = useState("10000")
  const [leverage, setLeverage] = useState("100")
  const [bars, setBars] = useState("500")
  const [model, setModel] = useState<"backtest" | "forward" | "optimize">("backtest")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [history, setHistory] = useState<BacktestResult[]>([])
  const [error, setError] = useState("")
  const [listMsg, setListMsg] = useState("")

  useEffect(() => {
    setBots(readBots())
    setHistory(readBacktestResults())
  }, [])

  const expertLabel = useMemo(() => {
    if (expertId === "builtin") return "SMA+RSI mean-reversion (built-in)"
    return bots.find((b) => b.id === expertId)?.name || "Expert"
  }, [expertId, bots])

  const start = async () => {
    setLoading(true)
    setError("")
    setListMsg("")
    try {
      const data = await fetchBinanceCandles(symbol, period, Math.min(1000, Math.max(100, Number(bars))))
      const base = { startingBalance: Number(deposit), riskPercent: 1, stopPct: 1, takePct: 2 }
      let out: BacktestResult =
        model === "optimize"
          ? optimizeSmaRsi(data, base).best
          : runSmaRsiBacktest(data, { ...base, mode: model === "forward" ? "forward" : "backtest" })
      out.symbol = symbol
      out.interval = period
      out.strategy = expertLabel
      saveBacktestResult(out)
      setResult(out)
      setHistory(readBacktestResults())
      setTab("results")

      const bot = bots.find((b) => b.id === expertId)
      if (bot && user) {
        const listing = tryListBot(bot, out, user.name)
        if (listing) setListMsg(`Marketplace: “${bot.name}” auto-listed (metrics passed).`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Test failed")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "settings", label: "Settings" },
    { id: "results", label: "Results" },
    { id: "journal", label: "Journal" },
    { id: "history", label: "History" },
  ]

  return (
    <div className="bf-page">
      <div className="bf-container bf-section-gap">
        <div>
          <p className="bf-kicker">Strategy tester</p>
          <h1 className="bf-title">Tester</h1>
          <p className="bf-sub">
            MetaTrader-style Settings · Results · Journal · History. Expert list includes bots you created.
          </p>
        </div>

        <div className="flex flex-wrap gap-1 rounded-xl border border-spotify-grey bg-spotify-dark-grey p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={
                tab === t.id
                  ? "rounded-lg bg-spotify-green px-4 py-2 text-sm font-medium text-spotify-black"
                  : "rounded-lg px-4 py-2 text-sm text-spotify-text-secondary hover:text-spotify-green"
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "settings" && (
          <div className="bf-card overflow-hidden">
            <div className="border-b border-spotify-grey bg-spotify-black/50 px-4 py-2 text-xs font-medium uppercase tracking-wider text-spotify-text-secondary">
              Settings
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-2 lg:col-span-3">
                <Label className="text-xs text-spotify-text-secondary">Expert Advisor</Label>
                <select
                  value={expertId}
                  onChange={(e) => {
                    setExpertId(e.target.value)
                    const b = bots.find((x) => x.id === e.target.value)
                    if (b?.symbol) setSymbol(b.symbol.includes("USDT") ? b.symbol : "BTCUSDT")
                  }}
                  className="mt-1.5 h-10 w-full rounded-md border border-spotify-grey bg-spotify-black px-3 text-sm"
                >
                  <option value="builtin">SMA+RSI mean-reversion (built-in)</option>
                  {bots.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} · {b.symbol} · {b.runLanguage || b.language}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs text-spotify-text-secondary">Symbol</Label>
                <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} className="mt-1.5 border-spotify-grey bg-spotify-black" />
              </div>
              <div>
                <Label className="text-xs text-spotify-text-secondary">Period</Label>
                <select value={period} onChange={(e) => setPeriod(e.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-spotify-grey bg-spotify-black px-3 text-sm">
                  <option value="15m">M15</option>
                  <option value="1h">H1</option>
                  <option value="4h">H4</option>
                  <option value="1d">D1</option>
                </select>
              </div>
              <div>
                <Label className="text-xs text-spotify-text-secondary">Bars</Label>
                <Input type="number" value={bars} onChange={(e) => setBars(e.target.value)} className="mt-1.5 border-spotify-grey bg-spotify-black" />
              </div>
              <div>
                <Label className="text-xs text-spotify-text-secondary">Deposit</Label>
                <Input type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} className="mt-1.5 border-spotify-grey bg-spotify-black" />
              </div>
              <div>
                <Label className="text-xs text-spotify-text-secondary">Leverage</Label>
                <Input value={leverage} onChange={(e) => setLeverage(e.target.value)} className="mt-1.5 border-spotify-grey bg-spotify-black" />
              </div>
              <div>
                <Label className="text-xs text-spotify-text-secondary">Model</Label>
                <select value={model} onChange={(e) => setModel(e.target.value as typeof model)} className="mt-1.5 h-10 w-full rounded-md border border-spotify-grey bg-spotify-black px-3 text-sm">
                  <option value="backtest">Every tick (full sample)</option>
                  <option value="forward">Forward (last 20%)</option>
                  <option value="optimize">Optimization</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-spotify-grey px-5 py-4">
              <Button onClick={start} disabled={loading} className="bf-btn-primary">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running…
                  </>
                ) : model === "optimize" ? (
                  <>
                    <FlaskConical className="mr-2 h-4 w-4" /> Start optimization
                  </>
                ) : model === "forward" ? (
                  <>
                    <Gauge className="mr-2 h-4 w-4" /> Start forward test
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" /> Start
                  </>
                )}
              </Button>
              {result && (
                <Link href={`/backtest/report?id=${result.id}`}>
                  <Button variant="outline" className="border-spotify-grey">
                    <FileBarChart className="mr-2 h-4 w-4" /> Open report
                  </Button>
                </Link>
              )}
            </div>
            {error && <p className="px-5 pb-4 text-sm text-red-400">{error}</p>}
            {listMsg && <p className="px-5 pb-4 text-sm text-spotify-green">{listMsg}</p>}
          </div>
        )}

        {tab === "results" && result && (
          <>
            <div className="bf-grid-stats">
              {[
                ["Total net profit", result.netPnl.toFixed(2)],
                ["Profit factor", Number.isFinite(result.profitFactor) ? result.profitFactor.toFixed(2) : "∞"],
                ["Total trades", String(result.trades)],
                ["Win rate", `${result.winRate.toFixed(1)}%`],
                ["Max drawdown", result.maxDrawdown.toFixed(2)],
                ["Sharpe", result.sharpe.toFixed(2)],
              ].map(([k, v]) => (
                <div key={k} className="bf-stat">
                  <p className="bf-stat-label">{k}</p>
                  <p className={`bf-stat-value text-lg ${k === "Total net profit" ? (result.netPnl >= 0 ? "text-spotify-green" : "text-red-400") : ""}`}>{v}</p>
                </div>
              ))}
            </div>
            <div className="bf-card-pad">
              <p className="bf-stat-label mb-2">Balance graph</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.equity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--spotify-grey))" />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={["auto", "auto"]} stroke="hsl(var(--spotify-text-secondary))" fontSize={11} />
                    <Tooltip contentStyle={{ background: "#121212", border: "1px solid #282828" }} />
                    <Area type="monotone" dataKey="equity" stroke="#1db954" fill="#1db954" fillOpacity={0.12} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
        {tab === "results" && !result && (
          <div className="bf-card-pad text-sm text-spotify-text-secondary">Run a test from Settings to see results.</div>
        )}

        {tab === "journal" && (
          <div className="bf-card overflow-hidden">
            <div className="border-b border-spotify-grey px-4 py-2 text-xs uppercase text-spotify-text-secondary">Trade journal</div>
            {!result?.tradeList?.length ? (
              <p className="p-5 text-sm text-spotify-text-secondary">No trades in the last run.</p>
            ) : (
              <div className="max-h-96 overflow-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-spotify-black text-spotify-text-secondary">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Side</th>
                      <th className="p-3">Entry</th>
                      <th className="p-3">Exit</th>
                      <th className="p-3">P/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.tradeList.map((t) => (
                      <tr key={t.i} className="border-t border-spotify-grey/50">
                        <td className="p-3">{t.i}</td>
                        <td className="p-3">{t.side}</td>
                        <td className="p-3 font-mono">{t.entry.toFixed(4)}</td>
                        <td className="p-3 font-mono">{t.exit.toFixed(4)}</td>
                        <td className={`p-3 font-mono ${t.pnl >= 0 ? "text-spotify-green" : "text-red-400"}`}>{t.pnl.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "history" && (
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="bf-card-pad text-sm text-spotify-text-secondary">No stored tests yet.</div>
            ) : (
              history.map((h) => (
                <Link key={h.id} href={`/backtest/report?id=${h.id}`} className="bf-card-pad block hover:border-spotify-green/40">
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="font-medium">
                      {h.symbol} · {h.interval} · {h.mode}
                    </p>
                    <p className={h.netPnl >= 0 ? "text-spotify-green" : "text-red-400"}>{h.netPnl.toFixed(2)}</p>
                  </div>
                  <p className="mt-1 text-xs text-spotify-text-secondary">{h.strategy}</p>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
