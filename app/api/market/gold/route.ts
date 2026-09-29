import { NextResponse } from "next/server"

/** Live gold proxy (Yahoo GC=F) for the XAUUSD banner. */
export async function GET() {
  try {
    const r = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1m&range=1d",
      {
        cache: "no-store",
        headers: { "User-Agent": "BotForge/1.0" },
      },
    )
    if (!r.ok) {
      return NextResponse.json({ error: `Yahoo HTTP ${r.status}` }, { status: 502 })
    }
    const d = await r.json()
    const meta = d?.chart?.result?.[0]?.meta
    const price = Number(meta?.regularMarketPrice)
    const prev = Number(meta?.previousClose || meta?.chartPreviousClose)
    if (!price) {
      return NextResponse.json({ error: "No price in response" }, { status: 502 })
    }
    const changePct = prev ? ((price - prev) / prev) * 100 : 0
    return NextResponse.json({
      symbol: "XAUUSD",
      proxy: "GC=F",
      price,
      previousClose: prev,
      changePct,
      currency: meta?.currency || "USD",
      fetchedAt: new Date().toISOString(),
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gold quote failed" },
      { status: 500 },
    )
  }
}
