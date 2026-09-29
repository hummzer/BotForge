import { NextResponse } from "next/server"
import crypto from "crypto"

/**
 * Validate Binance API key (read-only account endpoint).
 * Body: { apiKey, apiSecret }
 * Never logs secrets.
 */
export async function POST(req: Request) {
  try {
    const { apiKey, apiSecret } = await req.json()
    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "apiKey and apiSecret required" }, { status: 400 })
    }
    const timestamp = Date.now()
    const query = `timestamp=${timestamp}`
    const signature = crypto.createHmac("sha256", String(apiSecret)).update(query).digest("hex")
    const r = await fetch(`https://api.binance.com/api/v3/account?${query}&signature=${signature}`, {
      headers: { "X-MBX-APIKEY": String(apiKey) },
      cache: "no-store",
    })
    const data = await r.json()
    if (!r.ok) {
      return NextResponse.json(
        { error: data.msg || `Binance HTTP ${r.status}`, code: data.code },
        { status: 502 },
      )
    }
    const usdt = (data.balances || []).find((b: { asset: string }) => b.asset === "USDT")
    return NextResponse.json({
      ok: true,
      canTrade: data.canTrade,
      accountType: data.accountType,
      usdtFree: usdt ? Number(usdt.free) : 0,
      permissions: data.permissions || [],
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Binance validate failed" },
      { status: 500 },
    )
  }
}
