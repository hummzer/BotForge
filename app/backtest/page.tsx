"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Play, Settings2, FileBarChart, Gauge, FlaskConical } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  fetchBinanceCandles,
  runSmaRsiBacktest,
  optimizeSmaRsi,
  saveBacktestResult,
  type BacktestResult,
} from "@/lib/botforge"

/**
 * Strategy Tester layout inspired by MetaTrader:
 * Expert / Symbol / Period / Dates / Deposit / Leverage · Start / Stop · Report
 * Indicator knobs stay internal to the engine — not exposed as a chart indicator panel.
 */
export default function BacktestingPage() {
  const [expert, setExpert] = useState("SMA+RSI mean-reversion (built-in)")
  const [symbol, setSymbol] = useState("BTCUSDT")
  const [period, setPeriod] = useState("1h")
  const [deposit, setDeposit] = useState("10000")
  const [leverage, setLeverage] = useState("100")
  const [bars, setBars] = useState("500")
  const [model, setModel] = useState<"backtest" | "forward" | "optimize">("backtest")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [error, setError] = useState("")

  const start = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await fetchBinanceCandles(symbol, period, Math.min(1000, Math.max(100, Number(bars))))
      const base = {
        startingBalance: Number(deposit),
        riskPercent: 1,
        stopPct: 1,
        takePct: 2,
      }
      let out: BacktestResult =
        model === "optimize"
          ? optimizeSmaRsi(data, base).best
          : runSmaRsiBacktest(data, {
              ...base,
              mode: model === "forward" ? "forward" : "backtest",
            })
      out.symbol = symbol
      out.interval = period
      out.strategy = expert
      saveBacktestResult(out)
      setResult(out)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Test failed")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bf-page">
      <div className="bf-container bf-section-gap">
        <div>
          <p className="bf-kicker">Strategy tester</p>
          <h1 className="bf-title">Tester</h1>
          <p className="bf-sub">
            MetaTrader-style controls: expert, symbol, period, deposit, model. Engine runs on real candles — no indicator
            toolbox clutter.
          </p>
        </div>

        <div className="bf-card overflow-hidden">
          <div className="border-b border-spotify-grey bg-spotify-black/50 px-4 py-2 text-xs font-medium uppercase tracking-wider text-spotify-text-secondary">
            Settings
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-3">
              <Label className="text-xs text-spotify-text-secondary">Expert Advisor</Label>
              <Input value={expert} onChange={(e) => setExpert(e.target.value)} className="mt-1.5 border-spotify-grey bg-spotify-black" />
            </div>
            <div>
              <Label className="text-xs text-spotify-text-secondary">Symbol</Label>
              <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} className="mt-1.5 border-spotify-grey bg-spotify-black" />
            </div>
            <div>
              <Label className="text-xs text-spotify-text-secondary">Period</Label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-md border border-spotify-grey bg-spotify-black px-3 text-sm"
              >
                <option value="15m">M15</option>
                <option value="1h">H1</option>
                <option value="4h">H4</option>
                <option value="1d">D1</option>
              </select>
            </div>
            <div>
              <Label className="text-xs text-spotify-text-secondary">Bars (history depth)</Label>
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
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as typeof model)}
                className="mt-1.5 h-10 w-full rounded-md border border-spotify-grey bg-spotify-black px-3 text-sm"
              >
                <option value="backtest">Every tick (full sample)</option>
                <option value="forward">Forward (last 20%)</option>
                <option value="optimize">Optimization</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-spotify-grey bg-spotify-dark-grey/80 px-5 py-4">
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
                  <FileBarChart className="mr-2 h-4 w-4" /> Report
                </Button>
              </Link>
            )}
            <Button variant="outline" className="border-spotify-grey" disabled title="Inputs fixed to built-in expert">
              <Settings2 className="mr-2 h-4 w-4" /> Expert properties
            </Button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}

        {result && (
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
                  <p
                    className={`bf-stat-value text-lg ${k === "Total net profit" ? (result.netPnl >= 0 ? "text-spotify-green" : "text-red-400") : ""}`}
                  >
                    {v}
                  </p>
                </div>
              ))}
            </div>
            <div className="bf-card-pad">
              <p className="bf-stat-label mb-2">Balance / equity graph</p>
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
      </div>
    </div>
  )
}
