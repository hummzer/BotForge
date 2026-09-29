import { NextResponse } from "next/server"

/** Daraja STK callback — production. Log / persist ResultCode 0 as paid. */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = body?.Body?.stkCallback
    const code = result?.ResultCode
    const desc = result?.ResultDesc
    const meta = result?.CallbackMetadata?.Item || []
    const amount = meta.find((i: { Name: string }) => i.Name === "Amount")?.Value
    const receipt = meta.find((i: { Name: string }) => i.Name === "MpesaReceiptNumber")?.Value
    const phone = meta.find((i: { Name: string }) => i.Name === "PhoneNumber")?.Value

    console.log("[mpesa-callback]", { code, desc, amount, receipt, phone, checkout: result?.CheckoutRequestID })

    // Acknowledge always so Safaricom does not retry endlessly
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" })
  } catch {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" })
  }
}
