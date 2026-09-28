"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Code, Download, Pause, Play, PlusCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { readBots, writeBots, type Bot } from "@/lib/botforge"

function downloadBot(bot: Bot) {
  const ext: Record<string,string> = { Python:"py", JavaScript:"js", "C++":"cpp", Rust:"rs", PineScript:"pine", MQL5:"mq5", MQL4:"mq4", Elixir:"ex", DBots:"json" }
  const blob = new Blob([bot.code], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${bot.name.replace(/[^a-z0-9]+/gi, "_")}.${ext[bot.language] ?? "txt"}`
  a.click()
  URL.revokeObjectURL(url)
}

export default function BotsPage() {
  const router = useRouter()
  const [bots, setBots] = useState<Bot[]>([])
  useEffect(() => setBots(readBots()), [])

  const update = (next: Bot[]) => { setBots(next); writeBots(next) }

  return (
    <div className="min-h-screen bg-spotify-black py-10 text-spotify-text-primary">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div><h1 className="font-display text-3xl font-bold">My Bots</h1><p className="mt-2 text-sm text-spotify-text-secondary">{bots.length} bot{bots.length === 1 ? "" : "s"} stored locally in this browser.</p></div>
          <Link href="/bots/create"><Button className="bg-spotify-green text-spotify-black"><PlusCircle className="mr-2 h-4 w-4" />Create Bot</Button></Link>
        </div>
        {bots.length === 0 ? (
          <Card className="border-spotify-grey bg-spotify-dark-grey"><CardContent className="py-16 text-center"><Code className="mx-auto mb-4 h-10 w-10 text-spotify-green" /><h2 className="text-xl font-semibold">No bots yet</h2><p className="mx-auto mt-2 max-w-md text-sm text-spotify-text-secondary">Create a strategy and BotForge will save the bot, code, indicators and configuration here.</p><Button onClick={() => router.push("/bots/create")} className="mt-6 bg-spotify-green text-spotify-black">Create your first bot</Button></CardContent></Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {bots.map(bot => (
              <Card key={bot.id} className="border-spotify-grey bg-spotify-dark-grey">
                <CardHeader><div className="flex items-start justify-between gap-4"><div><CardTitle>{bot.name}</CardTitle><p className="mt-1 text-xs text-spotify-text-secondary">{bot.language} · {bot.symbol} · {bot.timeframe}</p></div><Badge>{bot.status}</Badge></div></CardHeader>
                <CardContent>
                  <p className="text-sm text-spotify-text-secondary">{bot.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">{bot.indicators.map(i => <Badge key={i} variant="outline">{i}</Badge>)}</div>
                  <pre className="mt-4 max-h-44 overflow-auto rounded-lg border border-spotify-grey bg-spotify-black p-3 text-xs text-spotify-text-secondary">{bot.code}</pre>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => update(bots.map(b => b.id === bot.id ? {...b, status: b.status === "Running" ? "Paused" : "Running", lastRun: new Date().toISOString()} : b))} className="bg-spotify-green text-spotify-black">{bot.status === "Running" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}{bot.status === "Running" ? "Pause" : "Run"}</Button>
                    <Button size="sm" variant="outline" onClick={() => downloadBot(bot)}><Download className="mr-2 h-4 w-4" />Download</Button>
                    <Button size="sm" variant="outline" onClick={() => update(bots.filter(b => b.id !== bot.id))}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
