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
    features: ["Everything in Free", "8-language generation", "Unlimited bots", "Full backtest report", "Demo broker bridges"],
  },
  {
    name: "Quant",
    price: 49,
    priceLabel: "$49",
    desc: "Execution research",
    features: ["Everything in Pro", "Priority generation", "Live broker adapters", "Portfolio analytics", "Copy-trading workspace"],
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
          amount: plan.price * 130,
          accountRef: plan.name,
          description: `BotForge ${plan.name}`,
        }),
      })
      const d = await r.json()
      if (d.mode === "unconfigured") {
        setMsg(`STK not configured yet. Pay via M-Pesa 0716 475 923 for ${plan.name}, then share the SMS.`)
      } else if (!r.ok) setMsg(d.error || "STK failed")
      else setMsg(d.customerMessage || "Check your phone for the M-Pesa prompt.")
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
        body: JSON.stringify({ amount: plan.price, currency: "USD", description: `BotForge ${plan.name}` }),
      })
      const d = await r.json()
      if (d.mode === "manual") setMsg(`Send $${plan.price} USD to salimhamza371@gmail.com on PayPal, then email the receipt.`)
      else if (d.approveUrl) window.location.href = d.approveUrl
      else setMsg(d.error || "PayPal error")
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "PayPal error")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bf-page py-16">
      <div className="bf-container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="bf-kicker">Pricing</p>
          <h1 className="bf-title">Choose your workspace</h1>
          <p className="bf-sub mx-auto">M-Pesa (Daraja) or PayPal · salimhamza371@gmail.com</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <Card
              key={p.name}
              className={
                plan.name === p.name
                  ? "cursor-pointer border-spotify-green bg-spotify-dark-grey shadow-2xl ring-1 ring-spotify-green"
                  : "cursor-pointer border-spotify-grey bg-spotify-dark-grey"
              }
              onClick={() => setPlan(p)}
            >
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
                <p className="text-sm text-spotify-text-secondary">{p.desc}</p>
                <p className="pt-4 font-display text-4xl font-bold">
                  {p.priceLabel}
                  {p.price > 0 && <span className="text-sm text-spotify-text-secondary">/mo</span>}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="h-4 w-4 shrink-0 text-spotify-green" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="bf-btn-primary mt-7 w-full" onClick={() => setPlan(p)}>
                  {plan.name === p.name ? "Selected" : `Select ${p.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mt-10">
          <Card className="border-spotify-green/40 bg-spotify-dark-grey">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WalletCards className="text-spotify-green" /> Checkout · {plan.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-spotify-grey bg-spotify-black p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Smartphone className="h-4 w-4 text-spotify-green" /> M-Pesa
                </div>
                <p className="mt-2 text-xs text-spotify-text-secondary">
                  STK or send to <span className="font-mono text-spotify-text-primary">0716 475 923</span>
                </p>
                <Input
                  className="mt-3 border-spotify-grey bg-spotify-dark-grey"
                  placeholder="2547XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Button className="bf-btn-primary mt-3 w-full" onClick={payMpesa} disabled={loading === "mpesa"}>
                  {loading === "mpesa" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pay with M-Pesa STK"}
                </Button>
                <Button variant="outline" className="mt-2 w-full border-spotify-grey" onClick={() => copy("0716475923", "mpesa")}>
                  <Copy className="mr-2 h-4 w-4" />
                  {copied === "mpesa" ? "Copied" : "Copy number"}
                </Button>
              </div>
              <div className="rounded-2xl border border-spotify-grey bg-spotify-black p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <WalletCards className="h-4 w-4 text-spotify-green" /> PayPal
                </div>
                <p className="mt-2 break-all font-mono text-sm">salimhamza371@gmail.com</p>
                <Button className="bf-btn-primary mt-3 w-full" onClick={payPaypal} disabled={loading === "paypal"}>
                  {loading === "paypal" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pay with PayPal"}
                </Button>
                <Button
                  variant="outline"
                  className="mt-2 w-full border-spotify-grey"
                  onClick={() => copy("salimhamza371@gmail.com", "paypal")}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copied === "paypal" ? "Copied" : "Copy email"}
                </Button>
              </div>
            </CardContent>
            {msg && <p className="px-6 pb-6 text-sm text-spotify-text-secondary">{msg}</p>}
          </Card>
        </section>

        <div className="mt-8 text-center">
          <Link href="/strategies" className="text-sm text-spotify-green hover:underline">
            Browse strategies →
          </Link>
        </div>
      </div>
    </div>
  )
}
