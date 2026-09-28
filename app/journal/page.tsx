"use client"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react"

type Trade = { id:string; date:string; symbol:string; side:"BUY"|"SELL"; entry:number; exit:number; size:number; pnl:number; strategy:string; timeframe:string; emotion:string; notes:string }
const KEY = "botforge:journal"

export default function JournalPage() {
 const [trades,setTrades] = useState<Trade[]>([])
 const [form,setForm] = useState({symbol:"XAUUSD",side:"BUY" as "BUY"|"SELL",entry:"",exit:"",size:"1",strategy:"Liquidity Sweep",timeframe:"M15",emotion:"Focused",notes:""})
 useEffect(() => { try { setTrades(JSON.parse(localStorage.getItem(KEY) || "[]")) } catch {} }, [])
 const save = (next:Trade[]) => { setTrades(next); localStorage.setItem(KEY, JSON.stringify(next)) }
 const pnl = useMemo(() => trades.reduce((s,t) => s+t.pnl, 0), [trades])
 const wins = trades.filter(t => t.pnl > 0).length
 const add = () => {
   const entry=Number(form.entry), exit=Number(form.exit), size=Number(form.size)
   if (!entry || !exit || !size) return
   const raw=form.side==="BUY" ? (exit-entry)*size : (entry-exit)*size
   save([{...form,id:crypto.randomUUID(),date:new Date().toISOString(),entry,exit,size,pnl:raw},...trades])
   setForm({...form,entry:"",exit:"",notes:""})
 }
 return <div className="min-h-screen bg-spotify-black py-10 text-spotify-text-primary"><div className="container mx-auto max-w-6xl px-4">
  <div className="mb-8 flex items-end justify-between"><div><p className="text-xs tracking-[0.3em] text-spotify-green">BOTFORGE · JOURNAL</p><h1 className="font-display text-4xl font-bold">Trading Journal</h1><p className="mt-2 text-sm text-spotify-text-secondary">Record the trade, context and result in one place.</p></div><BookOpen className="h-10 w-10 text-spotify-green"/></div>
  <div className="grid gap-4 md:grid-cols-4">{[["Trades",trades.length],["Win rate",trades.length ? ((wins/trades.length)*100).toFixed(1)+"%" : "0.0%"],["Net P/L",pnl.toFixed(2)],["Average",trades.length ? (pnl/trades.length).toFixed(2) : "0.00"]].map(([a,b]) => <Card key={String(a)} className="border-spotify-grey bg-spotify-dark-grey p-4"><p className="text-xs text-spotify-text-secondary">{a}</p><p className="text-2xl font-bold">{b}</p></Card>)}</div>
  <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
   <Card className="border-spotify-grey bg-spotify-dark-grey"><CardHeader><CardTitle>Add trade</CardTitle></CardHeader><CardContent className="space-y-4">
    <div className="grid grid-cols-2 gap-3"><div><Label>Symbol</Label><Input value={form.symbol} onChange={e=>setForm({...form,symbol:e.target.value.toUpperCase()})} className="mt-1 bg-spotify-black"/></div><div><Label>Side</Label><select value={form.side} onChange={e=>setForm({...form,side:e.target.value as "BUY"|"SELL"})} className="mt-1 h-10 w-full rounded-md border border-spotify-grey bg-spotify-black px-3 text-sm"><option>BUY</option><option>SELL</option></select></div></div>
    <div className="grid grid-cols-3 gap-3"><div><Label>Entry</Label><Input type="number" value={form.entry} onChange={e=>setForm({...form,entry:e.target.value})} className="mt-1 bg-spotify-black"/></div><div><Label>Exit</Label><Input type="number" value={form.exit} onChange={e=>setForm({...form,exit:e.target.value})} className="mt-1 bg-spotify-black"/></div><div><Label>Size</Label><Input type="number" value={form.size} onChange={e=>setForm({...form,size:e.target.value})} className="mt-1 bg-spotify-black"/></div></div>
    <Input placeholder="Strategy" value={form.strategy} onChange={e=>setForm({...form,strategy:e.target.value})} className="bg-spotify-black"/>
    <Input placeholder="Timeframe" value={form.timeframe} onChange={e=>setForm({...form,timeframe:e.target.value})} className="bg-spotify-black"/>
    <Input placeholder="Emotion / state" value={form.emotion} onChange={e=>setForm({...form,emotion:e.target.value})} className="bg-spotify-black"/>
    <Textarea placeholder="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className="bg-spotify-black"/>
    <Button onClick={add} className="w-full bg-spotify-green text-spotify-black"><Plus className="mr-2 h-4 w-4"/>Save trade</Button>
   </CardContent></Card>
   <div className="space-y-3">{trades.length===0 ? <Card className="border-spotify-grey bg-spotify-dark-grey"><CardContent className="py-16 text-center text-sm text-spotify-text-secondary">No trades yet. Your journal will build a performance history as you log trades.</CardContent></Card> : trades.map(t=><Card key={t.id} className="border-spotify-grey bg-spotify-dark-grey"><CardContent className="p-5"><div className="flex justify-between gap-4"><div><div className="flex gap-2"><Badge>{t.side}</Badge><b>{t.symbol}</b><span className="text-xs text-spotify-text-secondary">{t.strategy} · {t.timeframe}</span></div><p className="mt-2 text-xs text-spotify-text-secondary">{new Date(t.date).toLocaleString()} · {t.emotion}</p></div><div className={t.pnl>=0 ? "flex items-center gap-1 font-bold text-spotify-green" : "flex items-center gap-1 font-bold text-red-400"}>{t.pnl>=0?<TrendingUp/>:<TrendingDown/>}{t.pnl.toFixed(2)}</div></div><p className="mt-4 text-sm">Entry {t.entry} → Exit {t.exit} · Size {t.size}</p>{t.notes&&<p className="mt-2 text-sm text-spotify-text-secondary">{t.notes}</p>}<Button variant="ghost" size="sm" className="mt-3 text-red-300" onClick={()=>save(trades.filter(x=>x.id!==t.id))}><Trash2 className="mr-1 h-3 w-3"/>Delete</Button></CardContent></Card>)}</div>
  </div>
 </div></div>
}