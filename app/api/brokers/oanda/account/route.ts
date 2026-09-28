import { cookies } from "next/headers"

export async function GET(){
 const jar=await cookies()
 const account=jar.get("botforge_oanda_account")?.value
 const token=jar.get("botforge_oanda_token")?.value
 if(!account||!token) return Response.json({connected:false})
 const r=await fetch("https://api-fxpractice.oanda.com/v3/accounts/"+encodeURIComponent(account),{headers:{Authorization:"Bearer "+token},cache:"no-store"})
 const data=await r.json()
 if(!r.ok) return Response.json({connected:false,error:data.errorMessage||"Account request failed."},{status:r.status})
 return Response.json({connected:true,account:data.account})
}
