"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Sparkles } from "lucide-react"

const strategies=["Moving Average","Bollinger Bands","Order Block","Liquidity Sweep","Liquidity Run","Breakout","Continuation","BOS","CHoCH","Fibonacci Retracement","Support / Resistance","VWAP","RSI","MACD"]
const tfs=["M1","M5","M15","M30","H1","H4","D1","W1"]
const langs=[["MQL4",true],["Pine Script",true],["MQL5",false],["Python",false],["Rust",false]] as const

export default function StrategiesPage(){
 const [selected,setSelected]=useState(["Liquidity Sweep","BOS"]),[frames,setFrames]=useState(["H4","H1","M15"]),[premium,setPremium]=useState(false),[prompt,setPrompt]=useState("Sweep liquidity, confirm BOS, then enter the retracement with defined risk.")
 const [loading,setLoading]=useState(false),[codes,setCodes]=useState<Record<string,string>>({})
 const generate=async()=>{setLoading(true);try{const r=await fetch("/api/generate-bot-code",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({languages:langs.filter(x=>premium||x[1]).map(x=>x[0]),prompt:"Strategy: "+selected.join(", ")+"\nTimeframes: "+frames.join(", ")+"\nSpecification: "+prompt})});const d=await r.json();if(!r.ok)throw Error(d.error||"Generation failed");setCodes(d.codes||{})}finally{setLoading(false)}}
 return <div className="min-h-screen bg-spotify-black py-10 text-spotify-text-primary"><div className="container mx-auto max-w-6xl px-4"><p className="text-xs tracking-[0.3em] text-spotify-green">BOTFORGE · STRATEGY ENGINE</p><h1 className="mt-3 font-display text-4xl font-bold">Strategy Builder</h1><p className="mb-8 mt-2 max-w-3xl text-sm text-spotify-text-secondary">Combine indicator, market-structure, liquidity, breakout and Fibonacci logic across multiple timeframes.</p>
 <Card className="border-spotify-grey bg-gradient-to-br from-spotify-dark-grey to-spotify-black shadow-2xl"><CardHeader><div className="flex items-center justify-between"><CardTitle>Strategy Forge</CardTitle><Badge className="bg-spotify-green text-spotify-black">MTF</Badge></div></CardHeader><CardContent className="space-y-6">
 <div><p className="mb-2 text-sm font-medium">Strategy families</p><div className="flex flex-wrap gap-2">{strategies.map(s=><button key={s} onClick={()=>setSelected(v=>v.includes(s)?v.filter(x=>x!==s):[...v,s])} className={selected.includes(s)?"rounded-full border border-spotify-green bg-spotify-green/15 px-3 py-2 text-xs text-spotify-green":"rounded-full border border-spotify-grey px-3 py-2 text-xs text-spotify-text-secondary"}>{s}</button>)}</div></div>
 <div><p className="mb-2 text-sm font-medium">Timeframe stack</p><div className="flex flex-wrap gap-2">{tfs.map(tf=><button key={tf} onClick={()=>setFrames(v=>v.includes(tf)?v.filter(x=>x!==tf):[...v,tf])} className={frames.includes(tf)?"rounded-lg border border-spotify-green bg-spotify-green/15 px-4 py-2 text-xs text-spotify-green":"rounded-lg border border-spotify-grey px-4 py-2 text-xs text-spotify-text-secondary"}>{tf}</button>)}</div><p className="mt-2 text-xs text-spotify-text-secondary">Use higher timeframes for bias and lower timeframes for confirmation or execution.</p></div>
 <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} className="min-h-28 w-full rounded-xl border border-spotify-grey bg-spotify-black p-4 text-sm outline-none focus:border-spotify-green"/>
 <div className="grid gap-3 sm:grid-cols-5">{langs.map(([name,free])=><button key={name} onClick={()=>!free&&setPremium(true)} className="rounded-xl border border-spotify-grey bg-spotify-black p-4 text-left"><div className="flex justify-between">{!free&&<Lock className="h-4 w-4 text-amber-400"/>}<span className="text-xs">{free?"Included":"Premium"}</span></div><p className="mt-2 font-semibold">{name}</p></button>)}</div>
 {!premium&&<p className="text-xs text-amber-300">Free: MQL4 + Pine Script. Pro/Quant: MQL4 + Pine Script + MQL5 + Python + Rust in one generation.</p>}
 <Button onClick={generate} disabled={loading||!selected.length||!frames.length} className="w-full bg-spotify-green text-spotify-black"><Sparkles className="mr-2 h-4 w-4"/>{loading?"Generating...":"Generate strategy outputs"}</Button>
 </CardContent></Card>
 {Object.keys(codes).length>0&&<div className="mt-6 grid gap-5 lg:grid-cols-2">{Object.entries(codes).map(([lang,code])=><Card key={lang} className="border-spotify-grey bg-spotify-dark-grey"><CardHeader><CardTitle>{lang}</CardTitle></CardHeader><CardContent><pre className="max-h-[430px] overflow-auto rounded-xl bg-spotify-black p-4 text-xs text-spotify-text-secondary">{code}</pre></CardContent></Card>)}</div>}
 </div></div>
}