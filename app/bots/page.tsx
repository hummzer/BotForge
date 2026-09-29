"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Code, Download, Pause, Play, PlusCircle, Trash2, Square, Server, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { readBots, writeBots, type Bot, type BotStatus } from "@/lib/botforge"

const VPS_PROVIDERS = [
  { name: "ForexVPS", url: "https://www.forexvps.net/" },
  { name: "BeeksFX", url: "https://beeksfx.com/" },
  { name: "Contabo", url: "https://contabo.com/" },
  { name: "DigitalOcean", url: "https://www.digitalocean.com/" },
  { name: "Vultr", url: "https://www.vultr.com/" },
]

function downloadBot(bot: Bot) {
  const ext: Record<string, string> = {
    Python: "py",
    JavaScript: "js",
    "C++": "cpp",
    Rust: "rs",
    PineScript: "pine",
    "Pine Script": "pine",
    MQL5: "mq5",
    MQL4: "mq4",
    Elixir: "ex",
  }
  const blob = new Blob([bot.code], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${bot.name.replace(/[^a-z0-9]+/gi, "_")}.${ext[bot.language] ?? "txt"}`
  a.click()
  URL.revokeObjectURL(url)
}

function setStatus(bots: Bot[], id: string, status: BotStatus): Bot[] {
  return bots.map((b) =>
    b.id === id ? { ...b, status, lastRun: status === "Running" ? new Date().toISOString() : b.lastRun } : b,
  )
}

export default function BotsPage() {
  const router = useRouter()
  const [bots, setBots] = useState<Bot[]>([])
  useEffect(() => setBots(readBots()), [])

  const update = (next: Bot[]) => {
    setBots(next)
    writeBots(next)
  }

  const counts = {
    running: bots.filter((b) => b.status === "Running").length,
    paused: bots.filter((b) => b.status === "Paused").length,
    stopped: bots.filter((b) => b.status === "Stopped" || b.status === "Ready").length,
  }

  return (
    <div className="bf-page">
      <div className="bf-container bf-section-gap">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="bf-kicker">My bots</p>
            <h1 className="bf-title">Control center</h1>
            <p className="bf-sub">
              Start, pause, stop. Download source. Spin up a VPS to host MT4/MT5 EAs near your broker.
            </p>
          </div>
          <Link href="/bots/create">
            <Button className="bf-btn-primary">
              <PlusCircle className="mr-2 h-4 w-4" /> Create bot
            </Button>
          </Link>
        </div>

        <div className="bf-grid-stats">
          <div className="bf-stat">
            <p className="bf-stat-label">Total</p>
            <p className="bf-stat-value">{bots.length}</p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Running</p>
            <p className="bf-stat-value text-spotify-green">{counts.running}</p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Paused</p>
            <p className="bf-stat-value">{counts.paused}</p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Stopped / ready</p>
            <p className="bf-stat-value">{counts.stopped}</p>
          </div>
        </div>

        <div className="bf-card-pad">
          <div className="mb-3 flex items-center gap-2">
            <Server className="h-5 w-5 text-spotify-green" />
            <h2 className="font-semibold">VPS providers</h2>
          </div>
          <p className="mb-4 text-sm text-spotify-text-secondary">
            Host your compiled EA on a low-latency VPS. Open a provider, deploy the downloaded file to MetaTrader.
          </p>
          <div className="flex flex-wrap gap-2">
            {VPS_PROVIDERS.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bf-btn-ghost inline-flex items-center gap-1.5 text-xs"
              >
                {p.name} <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        </div>

        {bots.length === 0 ? (
          <Card className="border-spotify-grey bg-spotify-dark-grey">
            <CardContent className="py-16 text-center">
              <Code className="mx-auto mb-4 h-10 w-10 text-spotify-green" />
              <h2 className="text-xl font-semibold">No bots yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-spotify-text-secondary">
                Create a strategy — code, symbol, and timeframe are stored here so you can run, pause, and deploy.
              </p>
              <Button onClick={() => router.push("/bots/create")} className="bf-btn-primary mt-6">
                Create your first bot
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {bots.map((bot) => (
              <Card key={bot.id} className="border-spotify-grey bg-spotify-dark-grey">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>{bot.name}</CardTitle>
                      <p className="mt-1 text-xs text-spotify-text-secondary">
                        {bot.language} · {bot.symbol} · {bot.timeframe}
                      </p>
                    </div>
                    <Badge
                      className={
                        bot.status === "Running"
                          ? "bg-spotify-green/20 text-spotify-green"
                          : bot.status === "Error"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-spotify-grey text-spotify-text-secondary"
                      }
                    >
                      {bot.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-spotify-text-secondary">{bot.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {bot.indicators.map((i) => (
                      <Badge key={i} variant="outline" className="border-spotify-grey">
                        {i}
                      </Badge>
                    ))}
                  </div>
                  {bot.lastRun && (
                    <p className="mt-2 text-[11px] text-spotify-text-secondary">
                      Last run {new Date(bot.lastRun).toLocaleString()}
                    </p>
                  )}
                  <pre className="mt-4 max-h-36 overflow-auto rounded-lg border border-spotify-grey bg-spotify-black p-3 text-xs text-spotify-text-secondary">
                    {bot.code.slice(0, 800)}
                    {bot.code.length > 800 ? "…" : ""}
                  </pre>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => update(setStatus(bots, bot.id, "Running"))}
                      className="bg-spotify-green text-spotify-black"
                    >
                      <Play className="mr-1 h-3.5 w-3.5" /> Run
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-spotify-grey"
                      onClick={() => update(setStatus(bots, bot.id, "Paused"))}
                    >
                      <Pause className="mr-1 h-3.5 w-3.5" /> Pause
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-spotify-grey"
                      onClick={() => update(setStatus(bots, bot.id, "Stopped"))}
                    >
                      <Square className="mr-1 h-3.5 w-3.5" /> Stop
                    </Button>
                    <Button size="sm" variant="outline" className="border-spotify-grey" onClick={() => downloadBot(bot)}>
                      <Download className="mr-1 h-3.5 w-3.5" /> Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-spotify-grey text-red-400"
                      onClick={() => update(bots.filter((b) => b.id !== bot.id))}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                    </Button>
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
