import { cookies } from "next/headers"

const BASE="https://api-fxpractice.oanda.com"

export async function POST(req:Request){
 try{
  const {accountId,token}=await req.json()
  if(!accountId||!token) return Response.json({error:"Account ID and practice token are required."},{status:400})
  const r=await fetch(BASE+"/v3/accounts/"+encodeURIComponent(accountId),{headers:{Authorization:"Bearer "+token},cache:"no-store"})
  const data=await r.json()
  if(!r.ok) return Response.json({error:data.errorMessage||"OANDA practice authentication failed."},{status:r.status})
  const jar=await cookies()
  jar.set("botforge_oanda_account",accountId,{httpOnly:true,secure:true,sameSite:"strict",path:"/",maxAge:86400*30})
  jar.set("botforge_oanda_token",token,{httpOnly:true,secure:true,sameSite:"strict",path:"/",maxAge:86400*30})
  return Response.json({connected:true,account:{id:data.account?.id,currency:data.account?.currency,balance:data.account?.balance}})
 }catch(e){return Response.json({error:e instanceof Error?e.message:"Connection failed."},{status:500})}
}
