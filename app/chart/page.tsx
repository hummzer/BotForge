"use client"

import { useState } from "react"
import { TradingViewChart } from "@/components/tradingview-chart"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const presets=["OANDA:XAUUSD","OANDA:EURUSD","OANDA:GBPUSD","OANDA:USDJPY","BINANCE:BTCUSDT","NASDAQ:NDX"]

export default function ChartPage(){
 const [symbol,setSymbol]=useState("OANDA:XAUUSD")
 return <div className="min-h-screen bg-spotify-black py-10 text-spotify-text-primary">
  <div className="container mx-auto max-w-7xl px-4">
   <div className="mb-6"><p className="text-xs tracking-[0.3em] text-spotify-green">BOTFORGE · CHART LAB</p><h1 className="mt-3 font-display text-4xl font-bold">Study the market before you forge the bot.</h1><p className="mt-2 max-w-3xl text-sm text-spotify-text-secondary">A dedicated chart workspace with candles, multiple timeframes, drawing tools, indicators, symbol search, volume and technical-analysis studies.</p></div>
   <Card className="border-spotify-grey bg-spotify-dark-grey"><CardContent className="p-3">
    <div className="mb-3 flex flex-wrap gap-2">{presets.map(s=><Button key={s} size="sm" variant={s===symbol?"default":"outline"} className={s===symbol?"bg-spotify-green text-spotify-black":""} onClick={()=>setSymbol(s)}>{s}</Button>)}</div>
    <div className="h-[680px] w-full"><TradingViewChart symbol={symbol}/></div>
   </CardContent></Card>
   <div className="mt-6 grid gap-4 md:grid-cols-3">
    {[["DRAW","Trend lines, horizontal levels and chart annotations."],["ANALYZE","Built-in indicators and multi-timeframe chart intervals."],["FORGE","Move the same symbol and timeframe context into Strategy Builder."]].map(([a,b])=><div key={a} className="rounded-2xl border border-spotify-grey bg-spotify-dark-grey p-5"><p className="text-xs tracking-[0.2em] text-spotify-green">{a}</p><p className="mt-2 text-sm text-spotify-text-secondary">{b}</p></div>)}
   </div>
  </div>
 </div>
}