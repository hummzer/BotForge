"use client"

import { Check, Copy, Smartphone, WalletCards, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"

const plans = [
  {
    name: "Free",
    price: 0,
    priceLabel: "$0",
    desc: "Explore BotForge",
    features: ["Browse strategies", "MQL4/5 + Pine generation", "2 saved bots", "Basic backtesting", "Trading journal"],
  },
  {
    name: "Pro",
    price: 19,
    priceLabel: "$19",
    desc: "Build seriously",
    features: [
      "Everything in Free",
      "8-language generation",
      "Unlimited bots",
      "Full backtest report",
      "Demo broker bridges",
    ],
  },
  {
    name: "Quant",
    price: 49,
    priceLabel: "$49",
    desc: "Execution research",
    features: [
      "Everything in Pro",
      "Priority generation",
      "Live broker adapters",
      "Portfolio analytics",
      "Copy-trading workspace",
    ],
  },
]

export default function PricingPage() {
  const [copied, setCopied] = useState("")
  const [plan, setPlan] = useState(plans[1])
  const [phone, setPhone] = useState("")
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState<"mpesa" | "paypal" | null>(null)

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(label)
    window.setTimeout(() => setCopied(""), 1600)
  }

  const payMpesa = async () => {
    if (plan.price <= 0) {
      setMsg("Free plan — no payment needed.")
      return
    }
    setLoading("mpesa")
    setMsg("")
    try {
      const r = await fetch("/api/payments/mpesa/stk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          amount: plan.price * 130, // rough USD→KES for STK (KES integer)
          accountRef: plan.name,
          description: `BotForge ${plan.name}`,
        }),
      })
      const d = await r.json()
      if (d.mode === "unconfigured") {
        setMsg(`STK not configured yet. Pay via M-Pesa 0716 475 923 for ${plan.name}, then share the SMS.`)
      } else if (!r.ok) {
        setMsg(d.error || "STK failed")
      } else {
        setMsg(d.customerMessage || "Check your phone for the M-Pesa prompt.")
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "M-Pesa error")
    } finally {
      setLoading(null)
    }
  }

  const payPaypal = async () => {
    if (plan.price <= 0) {
      setMsg("Free plan — no payment needed.")
      return
    }
    setLoading("paypal")
    setMsg("")
    try {
      const r = await fetch("/api/payments/paypal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.price,
          currency: "USD",
          description: `BotForge ${plan.name}`,
        }),
      })
      const d = await r.json()
      if (d.mode === "manual") {
        setMsg(`Send $${plan.price} USD to salimhamza371@gmail.com on PayPal, then email the receipt.`)
      } else if (d.approveUrl) {
        window.location.href = d.approveUrl
      } else {
        setMsg(d.error || "PayPal error")
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "PayPal error")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#070a0e] py-16 text-zinc-100">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs tracking-[0.3em] text-violet-400">BOTFORGE · PRICING</p>
          <h1 className="mt-3 text-4xl font-bold">Choose your trading workspace.</h1>
          <p className="mt-3 text-sm text-zinc-400">
            Pay with M-Pesa (Safaricom Daraja production) or PayPal (salimhamza371@gmail.com).
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((p, i) => (
            <Card
              key={p.name}
              className={
                plan.name === p.name
                  ? "border-violet-500 bg-[#0d1218] shadow-2xl ring-1 ring-violet-500"
                  : "border-zinc-800 bg-[#0d1218]"
              }
              onClick={() => setPlan(p)}
            >
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
                <p className="text-sm text-zinc-400">{p.desc}</p>
                <p className="pt-4 text-4xl font-bold">
                  {p.priceLabel}
                  {p.price > 0 && <span className="text-sm text-zinc-500">/month</span>}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-7 w-full bg-violet-600 hover:bg-violet-500"
                  onClick={() => setPlan(p)}
                >
                  {plan.name === p.name ? "Selected" : `Select ${p.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mt-10">
          <Card className="border-violet-500/40 bg-[#0d1218]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WalletCards className="text-violet-400" />
                Checkout · {plan.name}
              </CardTitle>
              <p className="text-sm text-zinc-400">
                Production Daraja STK Push and PayPal Orders API. Manual fallbacks remain available.
              </p>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-[#070a0e] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Smartphone className="h-4 w-4 text-emerald-400" />
                  M-Pesa (Daraja production)
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  STK to your phone, or send to <span className="font-mono text-zinc-300">0716 475 923</span>
                </p>
                <Input
                  className="mt-3 border-zinc-700 bg-[#0d1218]"
                  placeholder="2547XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Button
                  className="mt-3 w-full bg-emerald-600 hover:bg-emerald-500 text-black"
                  onClick={payMpesa}
                  disabled={loading === "mpesa"}
                >
                  {loading === "mpesa" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pay with M-Pesa STK"}
                </Button>
                <Button variant="outline" className="mt-2 w-full border-zinc-700" onClick={() => copy("0716475923", "mpesa")}>
                  <Copy className="mr-2 h-4 w-4" />
                  {copied === "mpesa" ? "Copied" : "Copy 0716 475 923"}
                </Button>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-[#070a0e] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <WalletCards className="h-4 w-4 text-sky-400" />
                  PayPal
                </div>
                <p className="mt-2 font-mono text-sm break-all text-zinc-200">salimhamza371@gmail.com</p>
                <p className="mt-2 text-xs text-zinc-500">Orders API when credentials are set; otherwise send manually.</p>
                <Button
                  className="mt-3 w-full bg-sky-600 hover:bg-sky-500"
                  onClick={payPaypal}
                  disabled={loading === "paypal"}
                >
                  {loading === "paypal" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pay with PayPal"}
                </Button>
                <Button
                  variant="outline"
                  className="mt-2 w-full border-zinc-700"
                  onClick={() => copy("salimhamza371@gmail.com", "paypal")}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copied === "paypal" ? "Copied" : "Copy PayPal email"}
                </Button>
              </div>
            </CardContent>
            {msg && <p className="px-6 pb-6 text-sm text-zinc-300">{msg}</p>}
          </Card>
        </section>

        <div className="mt-8 text-center">
          <Link href="/strategies" className="text-sm text-violet-400 hover:underline">
            Browse strategies →
          </Link>
        </div>
      </div>
    </div>
  )
}
