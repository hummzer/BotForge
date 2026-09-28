import { cookies } from "next/headers"

export async function POST(req:Request){
 const jar=await cookies()
 const account=jar.get("botforge_oanda_account")?.value
 const token=jar.get("botforge_oanda_token")?.value
 if(!account||!token) return Response.json({error:"Connect an OANDA practice account first."},{status:401})
 try{
  const {instrument,units,stopLoss,takeProfit}=await req.json()
  const n=Number(units)
  if(!instrument||!Number.isFinite(n)||n===0) return Response.json({error:"Instrument and non-zero units are required."},{status:400})
  const order:any={type:"MARKET",instrument,units:String(Math.trunc(n)),timeInForce:"FOK",positionFill:"DEFAULT"}
  if(stopLoss) order.stopLossOnFill={timeInForce:"GTC",price:String(stopLoss)}
  if(takeProfit) order.takeProfitOnFill={price:String(takeProfit)}
  const r=await fetch("https://api-fxpractice.oanda.com/v3/accounts/"+encodeURIComponent(account)+"/orders",{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify({order})})
  const data=await r.json()
  if(!r.ok) return Response.json({error:data.errorMessage||"OANDA rejected the order.",details:data},{status:r.status})
  return Response.json({ok:true,order:data})
 }catch(e){return Response.json({error:e instanceof Error?e.message:"Order failed."},{status:500})}
}
