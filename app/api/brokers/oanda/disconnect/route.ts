import { cookies } from "next/headers"
export async function POST(){const jar=await cookies();jar.delete("botforge_oanda_account");jar.delete("botforge_oanda_token");return Response.json({connected:false})}
