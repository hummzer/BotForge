import { NextResponse } from "next/server"

/**
 * Real-time directional bias from Binance klines (close vs SMAs).
 * GET ?symbol=BTCUSDT&interval=1h
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const symbol = (searchParams.get("symbol") || "BTCUSDT").toUpperCase()
    const interval = searchParams.get("interval") || "1h"
    const allowed = ["15m", "1h", "4h", "1d"]
    const iv = allowed.includes(interval) ? interval : "1h"

    const r = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${iv}&limit=120`,
      { cache: "no-store" },
    )
    if (!r.ok) return NextResponse.json({ error: `HTTP ${r.status}` }, { status: 502 })
    const rows = await r.json()
    const closes: number[] = rows.map((x: (string | number)[]) => Number(x[4]))
    const last = closes[closes.length - 1]
    const sma = (n: number) => {
      const slice = closes.slice(-n)
      return slice.reduce((a, b) => a + b, 0) / slice.length
    }
    const s20 = sma(20)
    const s50 = sma(50)
    const prev = closes[closes.length - 2]
    const momentum = ((last - prev) / prev) * 100
    const vs20 = ((last - s20) / s20) * 100
    const vs50 = ((last - s50) / s50) * 100

    let bias: "Bullish" | "Bearish" | "Neutral" = "Neutral"
    let score = 0
    if (last > s20) score += 1
    if (last > s50) score += 1
    if (s20 > s50) score += 1
    if (momentum > 0) score += 1
    if (score >= 3) bias = "Bullish"
    else if (score <= 1) bias = "Bearish"

    const sentiment =
      bias === "Bullish" ? Math.min(95, 50 + score * 12 + Math.abs(vs20))
      : bias === "Bearish" ? Math.max(5, 50 - score * 12 - Math.abs(vs20))
      : 50

    return NextResponse.json({
      symbol,
      interval: iv,
      price: last,
      bias,
      score,
      sentiment: Math.round(sentiment),
      metrics: {
        sma20: s20,
        sma50: s50,
        momentumPct: momentum,
        vsSma20Pct: vs20,
        vsSma50Pct: vs50,
      },
      fetchedAt: new Date().toISOString(),
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Bias failed" },
      { status: 500 },
    )
  }
}
