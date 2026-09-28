"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Play, TrendingDown, TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { fetchBinanceCandles, runSmaRsiBacktest, type BacktestResult, type Candle } from "@/lib/botforge"

export default function BacktestingPage() {
  const [symbol, setSymbol] = useState("BTCUSDT")
  const [interval, setInterval] = useState("1h")
  const [limit, setLimit] = useState("500")
  const [balance, setBalance] = useState("10000")
  const [risk, setRisk] = useState("1")
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
      setResult(runSmaRsiBacktest(data, Number(balance), Number(risk)))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Backtest failed.")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { run() }, [])

  return (
    <div className="min-h-screen bg-spotify-black py-10 text-spotify-text-primary">
      <div className="container mx-auto max-w-6xl px-4">
        <h1 className="font-display text-3xl font-bold">Backtesting</h1>
        <p className="mb-8 mt-2 text-sm text-spotify-text-secondary">Run a deterministic SMA(50) + RSI(14) strategy against real Binance historical candles. No random results.</p>

        <Card className="border-spotify-grey bg-spotify-dark-grey">
          <CardHeader><CardTitle>Backtest Configuration</CardTitle><CardDescription>Public BTC/USDT market data is fetched when you run the test.</CardDescription></CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-5">
            <div><Label>Symbol</Label><Input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} className="mt-2 bg-spotify-black" /></div>
            <div><Label>Interval</Label><Select value={interval} onValueChange={setInterval}><SelectTrigger className="mt-2 bg-spotify-black"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="15m">15m</SelectItem><SelectItem value="1h">1h</SelectItem><SelectItem value="4h">4h</SelectItem><SelectItem value="1d">1d</SelectItem></SelectContent></Select></div>
            <div><Label>Candles</Label><Input type="number" min="100" max="1000" value={limit} onChange={e => setLimit(e.target.value)} className="mt-2 bg-spotify-black" /></div>
            <div><Label>Starting balance</Label><Input type="number" min="100" value={balance} onChange={e => setBalance(e.target.value)} className="mt-2 bg-spotify-black" /></div>
            <div><Label>Risk / trade %</Label><Input type="number" min="0.1" max="10" step="0.1" value={risk} onChange={e => setRisk(e.target.value)} className="mt-2 bg-spotify-black" /></div>
            <Button onClick={run} disabled={loading} className="md:col-span-5 bg-spotify-green text-spotify-black hover:bg-spotify-green/90">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Fetching candles and testing...</> : <><Play className="mr-2 h-4 w-4" />Run real backtest</>}
            </Button>
          </CardContent>
        </Card>

        {error && <div className="mt-5 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}

        {result && (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-6">
              {[
                ["Trades", result.trades.toString()],
                ["Win rate", `${result.winRate.toFixed(2)}%`],
                ["Net P/L", `${result.netPnl.toFixed(2)}`],
                ["Max DD", `${result.maxDrawdown.toFixed(2)}`],
                ["Profit factor", Number.isFinite(result.profitFactor) ? result.profitFactor.toFixed(2) : "∞"],
                ["Candles", candles.length.toString()],
              ].map(([label,value]) => (
                <Card key={label} className="border-spotify-grey bg-spotify-dark-grey p-4"><p className="text-xs text-spotify-text-secondary">{label}</p><p className={label === "Net P/L" ? result.netPnl >= 0 ? "mt-1 text-lg font-bold text-spotify-green" : "mt-1 text-lg font-bold text-red-400" : "mt-1 text-lg font-bold"}>{value}</p></Card>
              ))}
            </div>
            <Card className="mt-6 border-spotify-grey bg-spotify-dark-grey">
              <CardHeader><CardTitle className="flex items-center gap-2">{result.netPnl >= 0 ? <TrendingUp className="text-spotify-green" /> : <TrendingDown className="text-red-400" />} Equity curve</CardTitle></CardHeader>
              <CardContent><div className="h-80"><ResponsiveContainer width="100%" height="100%"><AreaChart data={result.equity}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--spotify-grey))" /><XAxis dataKey="time" hide /><YAxis domain={["auto","auto"]} /><Tooltip /><Area type="monotone" dataKey="equity" stroke="hsl(var(--spotify-green))" fill="hsl(var(--spotify-green))" fillOpacity={0.12} /></AreaChart></ResponsiveContainer></div></CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
