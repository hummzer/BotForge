import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import WebSocket from "ws"

/**
 * Deriv (classic WebSocket v3): authorize with API token from account settings.
 * Body: { token: string, appId?: string }
 * Docs: https://api.deriv.com / wss://ws.derivws.com/websockets/v3?app_id=
 */
function derivRequest(appId: string, messages: object[]): Promise<object[]> {
  return new Promise((resolve, reject) => {
    const url = `wss://ws.derivws.com/websockets/v3?app_id=${encodeURIComponent(appId)}`
    const ws = new WebSocket(url)
    const replies: object[] = []
    let i = 0
    const timeout = setTimeout(() => {
      try {
        ws.close()
      } catch {}
      reject(new Error("Deriv WebSocket timeout"))
    }, 15000)

    ws.on("open", () => {
      if (messages[0]) ws.send(JSON.stringify(messages[0]))
    })
    ws.on("message", (raw) => {
      try {
        const data = JSON.parse(String(raw))
        replies.push(data)
        i++
        if (i < messages.length) {
          ws.send(JSON.stringify(messages[i]))
        } else {
          clearTimeout(timeout)
          ws.close()
          resolve(replies)
        }
      } catch (e) {
        clearTimeout(timeout)
        reject(e)
      }
    })
    ws.on("error", (err) => {
      clearTimeout(timeout)
      reject(err)
    })
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const token = String(body.token || "").trim()
    const appId = String(body.appId || process.env.DERIV_APP_ID || "1089").trim()
    if (!token) {
      return NextResponse.json({ error: "Deriv API token required" }, { status: 400 })
    }

    const replies = await derivRequest(appId, [
      { authorize: token },
      { balance: 1, account: "all" },
      { statement: 1, limit: 30, description: 1 },
    ])

    const auth = replies.find((r: any) => r.authorize) as any
    const bal = replies.find((r: any) => r.balance) as any
    const stmt = replies.find((r: any) => r.statement) as any

    if (!auth?.authorize) {
      const err = (replies[0] as any)?.error?.message || "Authorize failed"
      return NextResponse.json({ error: err }, { status: 401 })
    }

    const a = auth.authorize
    const jar = await cookies()
    jar.set("botforge_deriv_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    jar.set("botforge_deriv_app", appId, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.json({
      ok: true,
      account: {
        loginid: a.loginid,
        email: a.email,
        currency: a.currency,
        balance: bal?.balance?.balance ?? a.balance,
        is_virtual: a.is_virtual,
        fullname: a.fullname,
        country: a.country,
      },
      statement: stmt?.statement?.transactions || [],
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Deriv connect failed" },
      { status: 500 },
    )
  }
}
