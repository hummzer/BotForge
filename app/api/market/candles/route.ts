import { NextResponse } from "next/server"

/**
 * Server-side Binance klines proxy — avoids browser CORS and keeps one data path.
 * GET /api/market/candles?symbol=BTCUSDT&interval=1h&limit=500
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const symbol = (searchParams.get("symbol") || "BTCUSDT").toUpperCase().replace(/[^A-Z0-9]/g, "")
    const interval = searchParams.get("interval") || "1h"
    const allowed = ["1m", "5m", "15m", "30m", "1h", "4h", "1d"]
    const iv = allowed.includes(interval) ? interval : "1h"
    const limit = Math.min(1000, Math.max(50, Number(searchParams.get("limit") || 500)))

    const url = `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(iv)}&limit=${limit}`
    const r = await fetch(url, { cache: "no-store", next: { revalidate: 0 } })
    if (!r.ok) {
      return NextResponse.json({ error: `Binance HTTP ${r.status}` }, { status: 502 })
    }
    const rows = await r.json()
    const candles = rows.map((row: (string | number)[]) => ({
      time: Number(row[0]),
      open: Number(row[1]),
      high: Number(row[2]),
      low: Number(row[3]),
      close: Number(row[4]),
      volume: Number(row[5]),
    }))
    return NextResponse.json({
      symbol,
      interval: iv,
      count: candles.length,
      candles,
      source: "binance",
      fetchedAt: new Date().toISOString(),
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Market data failed" },
      { status: 500 },
    )
  }
}
