import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  const jar = await cookies()
  jar.delete("botforge_deriv_token")
  jar.delete("botforge_deriv_app")
  return NextResponse.json({ ok: true })
}
