import { NextResponse } from "next/server"

/**
 * Safaricom Daraja STK Push — production endpoints.
 * Env: MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY,
 *      MPESA_SHORTCODE, MPESA_CALLBACK_URL
 * Docs: https://developer.safaricom.co.ke
 */

const TOKEN_URL = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
const STK_URL = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

function timestamp() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

async function getAccessToken() {
  const key = process.env.MPESA_CONSUMER_KEY
  const secret = process.env.MPESA_CONSUMER_SECRET
  if (!key || !secret) throw new Error("MPESA_CONSUMER_KEY / MPESA_CONSUMER_SECRET not configured")
  const basic = Buffer.from(`${key}:${secret}`).toString("base64")
  const r = await fetch(TOKEN_URL, {
    headers: { Authorization: `Basic ${basic}` },
    cache: "no-store",
  })
  if (!r.ok) throw new Error(`Daraja token failed: ${r.status}`)
  const d = await r.json()
  return d.access_token as string
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const phone = String(body.phone || "").replace(/\D/g, "")
    const amount = Math.max(1, Math.floor(Number(body.amount) || 0))
    const accountRef = String(body.accountRef || "BotForge").slice(0, 12)
    const description = String(body.description || "BotForge subscription").slice(0, 20)

    if (!phone || phone.length < 9) {
      return NextResponse.json({ error: "Valid M-Pesa phone required (e.g. 2547XXXXXXXX)" }, { status: 400 })
    }
    if (!amount) {
      return NextResponse.json({ error: "Amount required" }, { status: 400 })
    }

    const shortcode = process.env.MPESA_SHORTCODE
    const passkey = process.env.MPESA_PASSKEY
    const callback = process.env.MPESA_CALLBACK_URL || "https://bot-forge.vercel.app/api/payments/mpesa/callback"

    if (!shortcode || !passkey) {
      // Soft-fail with instructions when secrets not yet set
      return NextResponse.json(
        {
          ok: false,
          mode: "unconfigured",
          message:
            "Set MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY, MPESA_SHORTCODE on Vercel for production STK.",
          phone,
          amount,
        },
        { status: 503 },
      )
    }

    const ts = timestamp()
    const password = Buffer.from(`${shortcode}${passkey}${ts}`).toString("base64")
    const token = await getAccessToken()

    // Normalize KE numbers to 2547...
    let msisdn = phone
    if (msisdn.startsWith("0")) msisdn = `254${msisdn.slice(1)}`
    if (msisdn.startsWith("7")) msisdn = `254${msisdn}`

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: ts,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: msisdn,
      PartyB: shortcode,
      PhoneNumber: msisdn,
      CallBackURL: callback,
      AccountReference: accountRef,
      TransactionDesc: description,
    }

    const r = await fetch(STK_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    const data = await r.json()
    if (!r.ok) {
      return NextResponse.json({ error: data.errorMessage || "STK push failed", data }, { status: 502 })
    }
    return NextResponse.json({
      ok: true,
      checkoutRequestId: data.CheckoutRequestID,
      merchantRequestId: data.MerchantRequestID,
      customerMessage: data.CustomerMessage,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "M-Pesa error" },
      { status: 500 },
    )
  }
}
