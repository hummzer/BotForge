import { cookies } from "next/headers"

function sma(values:number[],period:number){return values.length<period?null:values.slice(-period).reduce((a,b)=>a+b,0)/period}

export async function GET(req:Request){
 const jar=await cookies()
 const account=jar.get("botforge_oanda_account")?.value
 const token=jar.get("botforge_oanda_token")?.value
 if(!account||!token) return Response.json({connected:false},{status:401})
 const url=new URL(req.url)
 const instrument=url.searchParams.get("instrument")||"EUR_USD"
 const granularity=url.searchParams.get("granularity")||"M15"
 const r=await fetch("https://api-fxpractice.oanda.com/v3/instruments/"+encodeURIComponent(instrument)+"/candles?granularity="+encodeURIComponent(granularity)+"&count=120&price=M",{headers:{Authorization:"Bearer "+token},cache:"no-store"})
 const data=await r.json()
 if(!r.ok) return Response.json({error:data.errorMessage||"Unable to read market data."},{status:r.status})
 const closes=(data.candles||[]).filter((c:any)=>c.complete).map((c:any)=>Number(c.mid?.c))
 const fast=sma(closes,20),slow=sma(closes,50)
 const signal=fast===null||slow===null?"FLAT":fast>slow?"BUY":"SELL"
 return Response.json({connected:true,instrument,granularity,signal,price:closes.at(-1)||null,fast,slow,time:new Date().toISOString()})
}
