import { NextResponse } from "next/server"

/**
 * PayPal Orders API v2 — production.
 * Env: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET
 * Merchant email (display / payouts): salimhamza371@gmail.com
 */

const PAYPAL_API = "https://api-m.paypal.com"
const MERCHANT_EMAIL = "salimhamza371@gmail.com"

async function paypalToken() {
  const id = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!id || !secret) throw new Error("PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET not configured")
  const basic = Buffer.from(`${id}:${secret}`).toString("base64")
  const r = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })
  if (!r.ok) throw new Error(`PayPal token failed: ${r.status}`)
  const d = await r.json()
  return d.access_token as string
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const amount = Number(body.amount)
    const currency = String(body.currency || "USD").toUpperCase()
    const description = String(body.description || "BotForge subscription")
    const returnUrl = String(body.returnUrl || "https://bot-forge.vercel.app/pricing?paid=1")
    const cancelUrl = String(body.cancelUrl || "https://bot-forge.vercel.app/pricing?cancelled=1")

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount required" }, { status: 400 })
    }

    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      return NextResponse.json(
        {
          ok: false,
          mode: "manual",
          merchantEmail: MERCHANT_EMAIL,
          message: `Send $${amount} ${currency} to ${MERCHANT_EMAIL} via PayPal, then email the receipt.`,
        },
        { status: 503 },
      )
    }

    const token = await paypalToken()
    const r = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description,
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: "BotForge",
          landing_page: "LOGIN",
          user_action: "PAY_NOW",
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      }),
    })
    const data = await r.json()
    if (!r.ok) {
      return NextResponse.json({ error: data.message || "PayPal order failed", data }, { status: 502 })
    }
    const approve = (data.links || []).find((l: { rel: string }) => l.rel === "approve")?.href
    return NextResponse.json({
      ok: true,
      orderId: data.id,
      approveUrl: approve,
      merchantEmail: MERCHANT_EMAIL,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "PayPal error" },
      { status: 500 },
    )
  }
}
