import { cookies } from "next/headers"

const BASE = "https://api-fxpractice.oanda.com"

/** Recent transactions for the connected OANDA practice account. */
export async function GET() {
  try {
    const jar = await cookies()
    const accountId = jar.get("botforge_oanda_account")?.value
    const token = jar.get("botforge_oanda_token")?.value
    if (!accountId || !token) {
      return Response.json({ error: "Not connected", connected: false }, { status: 401 })
    }
    const r = await fetch(
      `${BASE}/v3/accounts/${encodeURIComponent(accountId)}/transactions?count=50`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    )
    const data = await r.json()
    if (!r.ok) {
      return Response.json(
        { error: data.errorMessage || `OANDA HTTP ${r.status}` },
        { status: r.status },
      )
    }
    const transactions = (data.transactions || []).map(
      (t: {
        id?: string
        time?: string
        type?: string
        instrument?: string
        units?: string
        pl?: string
        price?: string
      }) => ({
        id: t.id,
        time: t.time,
        type: t.type,
        instrument: t.instrument,
        units: t.units,
        pl: t.pl,
        price: t.price,
      }),
    )
    return Response.json({ connected: true, accountId, transactions })
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "History failed" },
      { status: 500 },
    )
  }
}
