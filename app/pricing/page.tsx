"use client"

import { Check, Copy, Smartphone, WalletCards } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

const plans = [
  {name:"Free",price:"$0",desc:"Explore BotForge",features:["MQL4 generation","Pine Script generation","2 saved bots","Basic backtesting","Trading journal","Forex news panel"]},
  {name:"Pro",price:"$19",desc:"Build seriously",features:["Everything in Free","Five-language generation","MQL5 + Python + Rust","Unlimited saved bots","Multi-timeframe engine","Advanced backtesting","Demo broker connections"]},
  {name:"Quant",price:"$49",desc:"Execution research",features:["Everything in Pro","Priority AI generation","Advanced risk controls","Copy-trading workspace","Broker adapter framework","Portfolio analytics","Execution logs"]}
]

export default function PricingPage(){
  const [copied,setCopied]=useState("")
  const copy=async(value:string,label:string)=>{await navigator.clipboard.writeText(value);setCopied(label);window.setTimeout(()=>setCopied(""),1600)}
  return <div className="min-h-screen bg-spotify-black py-16 text-spotify-text-primary">
    <div className="container mx-auto max-w-6xl px-4">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-xs tracking-[0.3em] text-spotify-green">BOTFORGE · PRICING</p>
        <h1 className="mt-3 font-display text-4xl font-bold">Choose your trading workspace.</h1>
        <p className="mt-3 text-sm text-spotify-text-secondary">Free starts the workflow. Pro unlocks the five-language compiler. Quant adds execution research tooling.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((p,i)=><Card key={p.name} className={i===1?"border-spotify-green bg-spotify-dark-grey shadow-2xl ring-1 ring-spotify-green":"border-spotify-grey bg-spotify-dark-grey shadow-xl"}>
          <CardHeader><CardTitle>{p.name}</CardTitle><p className="text-sm text-spotify-text-secondary">{p.desc}</p><p className="pt-4 font-display text-4xl font-bold">{p.price}<span className="text-sm text-spotify-text-secondary">{p.price!=="$0"?"/month":""}</span></p></CardHeader>
          <CardContent><ul className="space-y-3 text-sm">{p.features.map(f=><li key={f} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-spotify-green"/>{f}</li>)}</ul><Link href="/strategies"><Button className="mt-7 w-full bg-spotify-green text-spotify-black">{p.name==="Free"?"Start building":"Open "+p.name}</Button></Link></CardContent>
        </Card>)}
      </div>

      <section className="mt-10">
        <Card className="border-spotify-green/40 bg-spotify-dark-grey">
          <CardHeader><CardTitle className="flex items-center gap-2"><WalletCards className="text-spotify-green"/>BotForge Checkout</CardTitle><p className="text-sm text-spotify-text-secondary">Manual checkout for subscriptions, custom bot work and other BotForge services. Payment is verified before access or delivery is issued.</p></CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-spotify-grey bg-spotify-black p-5">
              <div className="flex items-center gap-2 text-sm font-semibold"><Smartphone className="h-4 w-4 text-spotify-green"/>M-Pesa</div>
              <p className="mt-3 font-mono text-2xl font-bold tracking-wider">0716 475 923</p>
              <p className="mt-2 text-xs text-spotify-text-secondary">Use the official BotForge payment number. After payment, keep the M-Pesa confirmation message for verification.</p>
              <Button variant="outline" className="mt-4 w-full" onClick={()=>copy("0716475923","mpesa")}><Copy className="mr-2 h-4 w-4"/>{copied==="mpesa"?"Copied":"Copy M-Pesa number"}</Button>
            </div>
            <div className="rounded-2xl border border-spotify-grey bg-spotify-black p-5">
              <div className="flex items-center gap-2 text-sm font-semibold"><WalletCards className="h-4 w-4 text-spotify-green"/>PayPal</div>
              <p className="mt-3 font-mono text-lg font-bold break-all">salimhamza371@gmail.com</p>
              <p className="mt-2 text-xs text-spotify-text-secondary">Send the selected plan or order amount to this PayPal account, then use the payment confirmation for verification.</p>
              <Button variant="outline" className="mt-4 w-full" onClick={()=>copy("salimhamza371@gmail.com","paypal")}><Copy className="mr-2 h-4 w-4"/>{copied==="paypal"?"Copied":"Copy PayPal email"}</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  </div>
}