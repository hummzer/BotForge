"use client"

import { useEffect, useState } from "react"
import { Activity } from "lucide-react"

type Quote = { price: number; changePct: number; source: string }

/** Live XAUUSD-style gold quote from public endpoints (no API key). */
export function XauusdTicker({ compact = false }: { compact?: boolean }) {
  const [q, setQ] = useState<Quote | null>(null)
  const [err, setErr] = useState("")

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        // Gold futures via Yahoo chart API (public, no key)
        const r = await fetch(
          "https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1m&range=1d",
          { cache: "no-store" },
        )
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const d = await r.json()
        const meta = d?.chart?.result?.[0]?.meta
        const price = Number(meta?.regularMarketPrice)
        const prev = Number(meta?.previousClose || meta?.chartPreviousClose)
        if (!price || cancelled) return
        const changePct = prev ? ((price - prev) / prev) * 100 : 0
        setQ({ price, changePct, source: "GC=F" })
        setErr("")
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "quote failed")
      }
    }
    load()
    const id = window.setInterval(load, 30_000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs tabular-nums">
        <Activity className="h-3.5 w-3.5 text-spotify-green" />
        <span className="font-medium text-spotify-text-secondary">XAUUSD</span>
        <span className="font-semibold text-spotify-text-primary">
          {q ? `$${q.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "…"}
        </span>
        <span className={q && q.changePct >= 0 ? "text-spotify-green" : "text-red-400"}>
          {q ? `${q.changePct >= 0 ? "+" : ""}${q.changePct.toFixed(2)}%` : ""}
        </span>
        {err && <span className="text-spotify-text-secondary/60">offline</span>}
      </div>
    )
  }

  return (
    <div className="bf-card-pad flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-spotify-green/15">
          <Activity className="h-5 w-5 text-spotify-green" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-spotify-text-secondary">Live gold · XAUUSD proxy</p>
          <p className="font-display text-2xl font-bold tabular-nums">
            {q ? `$${q.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Loading…"}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-lg font-semibold tabular-nums ${q && q.changePct >= 0 ? "text-spotify-green" : "text-red-400"}`}>
          {q ? `${q.changePct >= 0 ? "+" : ""}${q.changePct.toFixed(2)}%` : "—"}
        </p>
        <p className="text-[11px] text-spotify-text-secondary">source {q?.source || "…"} · 30s refresh</p>
      </div>
    </div>
  )
}
