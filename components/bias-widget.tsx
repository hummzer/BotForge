"use client"

import { useEffect, useState } from "react"

type BiasData = {
  symbol: string
  interval: string
  price: number
  bias: "Bullish" | "Bearish" | "Neutral"
  sentiment: number
  metrics: { sma20: number; sma50: number; momentumPct: number }
}

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT"]
const TFS = [
  { id: "15m", label: "M15" },
  { id: "1h", label: "H1" },
  { id: "4h", label: "H4" },
  { id: "1d", label: "D1" },
]

export function BiasWidget() {
  const [symbol, setSymbol] = useState("BTCUSDT")
  const [interval, setIntervalTf] = useState("1h")
  const [data, setData] = useState<BiasData | null>(null)
  const [err, setErr] = useState("")

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const r = await fetch(`/api/market/bias?symbol=${symbol}&interval=${interval}`, { cache: "no-store" })
        const d = await r.json()
        if (!r.ok) throw new Error(d.error || "Failed")
        if (!cancelled) {
          setData(d)
          setErr("")
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Bias offline")
      }
    }
    load()
    const id = window.setInterval(load, 60_000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [symbol, interval])

  const color =
    data?.bias === "Bullish" ? "text-spotify-green" : data?.bias === "Bearish" ? "text-red-400" : "text-spotify-text-secondary"

  return (
    <div className="bf-card-pad">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="bf-kicker">Market bias</p>
          <h2 className="text-lg font-semibold">Sentiment</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="h-9 rounded-full border border-spotify-grey bg-spotify-black px-3 text-xs"
          >
            {SYMBOLS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <div className="flex gap-1">
            {TFS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setIntervalTf(t.id)}
                className={
                  interval === t.id
                    ? "rounded-full bg-spotify-green px-3 py-1.5 text-xs font-medium text-spotify-black"
                    : "rounded-full border border-spotify-grey px-3 py-1.5 text-xs text-spotify-text-secondary"
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
      {data && (
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-spotify-text-secondary">Bias</p>
            <p className={`font-display text-3xl font-bold ${color}`}>{data.bias}</p>
          </div>
          <div>
            <p className="text-xs text-spotify-text-secondary">Sentiment score</p>
            <p className="font-display text-3xl font-bold tabular-nums">{data.sentiment}</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-spotify-grey">
              <div
                className="h-full rounded-full bg-spotify-green transition-all"
                style={{ width: `${data.sentiment}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-spotify-text-secondary">Price · {data.interval}</p>
            <p className="font-display text-2xl font-bold tabular-nums">
              ${data.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-xs text-spotify-text-secondary">
              Mom {data.metrics.momentumPct.toFixed(2)}% · SMA20 {data.metrics.sma20.toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
