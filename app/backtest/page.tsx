"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Play, FlaskConical, Gauge, ArrowRight } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  fetchBinanceCandles,
  runSmaRsiBacktest,
  optimizeSmaRsi,
  saveBacktestResult,
  type BacktestResult,
  type Candle,
} from "@/lib/botforge"

export default function BacktestingPage() {
  const [symbol, setSymbol] = useState("BTCUSDT")
  const [interval, setInterval] = useState("1h")
  const [limit, setLimit] = useState("500")
  const [balance, setBalance] = useState("10000")
  const [risk, setRisk] = useState("1")
  const [smaPeriod, setSmaPeriod] = useState("50")
  const [rsiPeriod, setRsiPeriod] = useState("14")
  const [rsiBuy, setRsiBuy] = useState("30")
  const [rsiSell, setRsiSell] = useState("70")
  const [stopPct, setStopPct] = useState("1")
  const [takePct, setTakePct] = useState("2")
  const [mode, setMode] = useState<"backtest" | "forward" | "optimize">("backtest")
  const [loading, setLoading] = useState(false)
  const [candles, setCandles] = useState<Candle[]>([])
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [error, setError] = useState("")

  const run = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await fetchBinanceCandles(symbol, interval, Math.min(1000, Math.max(100, Number(limit))))
      setCandles(data)
      const base = {
        startingBalance: Number(balance),
        riskPercent: Number(risk),
        smaPeriod: Number(smaPeriod),
        rsiPeriod: Number(rsiPeriod),
        rsiBuy: Number(rsiBuy),
        rsiSell: Number(rsiSell),
        stopPct: Number(stopPct),
        takePct: Number(takePct),
      }
      let out: BacktestResult
      if (mode === "optimize") {
        out = optimizeSmaRsi(data, base).best
      } else {
        out = runSmaRsiBacktest(data, { ...base, mode: mode === "forward" ? "forward" : "backtest" })
      }
      out.symbol = symbol
      out.interval = interval
      saveBacktestResult(out)
      setResult(out)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Backtest failed.")
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
          <h1 className="bf-title">Backtest · Forward · Optimize</h1>
          <p className="bf-sub">
            Real Binance candles. Tunable SMA/RSI, stop/take, risk. Results are saved and open in the full report.
          </p>
        </div>

        <Card className="border-spotify-grey bg-spotify-dark-grey">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>All fields feed the deterministic tester — no random fills.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>Mode</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
                <SelectTrigger className="mt-2 bg-spotify-black border-spotify-grey">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backtest">Backtest (full sample)</SelectItem>
                  <SelectItem value="forward">Forward test (last 20%)</SelectItem>
                  <SelectItem value="optimize">Optimize (grid search)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Symbol</Label>
              <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} className="mt-2 bg-spotify-black border-spotify-grey" />
            </div>
            <div>
              <Label>Interval</Label>
              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger className="mt-2 bg-spotify-black border-spotify-grey">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15m">15m</SelectItem>
                  <SelectItem value="1h">1h</SelectItem>
                  <SelectItem value="4h">4h</SelectItem>
                  <SelectItem value="1d">1d</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Candles</Label>
              <Input type="number" min={100} max={1000} value={limit} onChange={(e) => setLimit(e.target.value)} className="mt-2 bg-spotify-black border-spotify-grey" />
            </div>
            <div>
              <Label>Balance</Label>
              <Input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} className="mt-2 bg-spotify-black border-spotify-grey" />
            </div>
            <div>
              <Label>Risk %</Label>
              <Input type="number" step="0.1" value={risk} onChange={(e) => setRisk(e.target.value)} className="mt-2 bg-spotify-black border-spotify-grey" />
            </div>
            <div>
              <Label>SMA period</Label>
              <Input type="number" value={smaPeriod} onChange={(e) => setSmaPeriod(e.target.value)} className="mt-2 bg-spotify-black border-spotify-grey" />
            </div>
            <div>
              <Label>RSI period</Label>
              <Input type="number" value={rsiPeriod} onChange={(e) => setRsiPeriod(e.target.value)} className="mt-2 bg-spotify-black border-spotify-grey" />
            </div>
            <div>
              <Label>RSI buy &lt;</Label>
              <Input type="number" value={rsiBuy} onChange={(e) => setRsiBuy(e.target.value)} className="mt-2 bg-spotify-black border-spotify-grey" />
            </div>
            <div>
              <Label>RSI sell &gt;</Label>
              <Input type="number" value={rsiSell} onChange={(e) => setRsiSell(e.target.value)} className="mt-2 bg-spotify-black border-spotify-grey" />
            </div>
            <div>
              <Label>Stop %</Label>
              <Input type="number" step="0.1" value={stopPct} onChange={(e) => setStopPct(e.target.value)} className="mt-2 bg-spotify-black border-spotify-grey" />
            </div>
            <div>
              <Label>Take %</Label>
              <Input type="number" step="0.1" value={takePct} onChange={(e) => setTakePct(e.target.value)} className="mt-2 bg-spotify-black border-spotify-grey" />
            </div>
            <Button onClick={run} disabled={loading} className="sm:col-span-2 lg:col-span-4 bf-btn-primary">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running…
                </>
              ) : mode === "optimize" ? (
                <>
                  <FlaskConical className="mr-2 h-4 w-4" /> Optimize
                </>
              ) : mode === "forward" ? (
                <>
                  <Gauge className="mr-2 h-4 w-4" /> Forward test
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> Run backtest
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}

        {result && (
          <>
            <div className="bf-grid-stats">
              {[
                ["Mode", result.mode],
                ["Trades", String(result.trades)],
                ["Win rate", `${result.winRate.toFixed(1)}%`],
                ["Net P/L", result.netPnl.toFixed(2)],
                ["Max DD", result.maxDrawdown.toFixed(2)],
                ["Sharpe", result.sharpe.toFixed(2)],
              ].map(([label, value]) => (
                <div key={label} className="bf-stat">
                  <p className="bf-stat-label">{label}</p>
                  <p
                    className={`bf-stat-value ${label === "Net P/L" ? (result.netPnl >= 0 ? "text-spotify-green" : "text-red-400") : ""}`}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
            {result.optimized && (
              <p className="text-sm text-spotify-text-secondary">
                Best params: SMA {result.optimized.smaPeriod}, RSI buy {result.optimized.rsiBuy}, sell{" "}
                {result.optimized.rsiSell}
              </p>
            )}
            <Card className="border-spotify-grey bg-spotify-dark-grey">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Equity</CardTitle>
                <Link href={`/backtest/report?id=${result.id}`} className="text-sm text-spotify-green hover:underline">
                  Full report <ArrowRight className="ml-1 inline h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent>
                <div className="h-72">
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
                <p className="mt-2 text-xs text-spotify-text-secondary">{candles.length} candles · {result.strategy}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
