"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Code, Download, Pause, Play, PlusCircle, Trash2, Square, Server, ExternalLink, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { readBots, writeBots, readBacktestResults, type Bot, type BotStatus } from "@/lib/botforge"
import { useAuth } from "@/lib/auth-context"
import { canRunLanguage } from "@/lib/plans"

const VPS_PROVIDERS = [
  { name: "ForexVPS", url: "https://www.forexvps.net/" },
  { name: "BeeksFX", url: "https://beeksfx.com/" },
  { name: "Contabo", url: "https://contabo.com/" },
  { name: "DigitalOcean", url: "https://www.digitalocean.com/" },
  { name: "Vultr", url: "https://www.vultr.com/" },
]

function downloadSource(bot: Bot, lang: string, full: boolean) {
  const raw = bot.codes?.[lang] || bot.code
  const code = full ? raw : raw.slice(0, Math.max(80, Math.floor(raw.length / 5)))
  const ext: Record<string, string> = {
    Python: "py",
    JavaScript: "js",
    "C++": "cpp",
    Rust: "rs",
    "Pine Script": "pine",
    MQL5: "mq5",
    MQL4: "mq4",
    Elixir: "ex",
  }
  const blob = new Blob([code], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${bot.name.replace(/[^a-z0-9]+/gi, "_")}.${ext[lang] ?? "txt"}`
  a.click()
  URL.revokeObjectURL(url)
}

function SourceBlock({ source, premium }: { source: string; premium: boolean }) {
  if (premium || !source) {
    return (
      <pre className="max-h-80 overflow-auto p-4 font-mono text-[12px] leading-relaxed text-spotify-text-secondary">
        {source || "// No source"}
      </pre>
    )
  }
  const cut = Math.max(80, Math.floor(source.length / 5))
  const visible = source.slice(0, cut)
  const rest = source.slice(cut)
  return (
    <div className="relative">
      <pre className="max-h-80 overflow-hidden p-4 font-mono text-[12px] leading-relaxed text-spotify-text-secondary">
        {visible}
        {"\n"}
        <span className="select-none blur-[3px] opacity-40">{rest.slice(0, 1200)}</span>
      </pre>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end bg-gradient-to-t from-spotify-black via-spotify-black/95 to-transparent pb-6 pt-16">
        <Lock className="mb-2 h-5 w-5 text-spotify-green" />
        <p className="mb-3 text-center text-xs text-spotify-text-secondary">
          Free shows ~20% of source. Unlock full code on Pro/Quant.
        </p>
        <Link href="/pricing">
          <Button size="sm" className="bf-btn-primary">
            Upgrade to view full source
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function BotsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const plan = user?.plan || "Free"
  const premium = plan === "Pro" || plan === "Quant"
  const [bots, setBots] = useState<Bot[]>([])
  const [view, setView] = useState<Record<string, string>>({})
  const [tests, setTests] = useState(0)

  useEffect(() => {
    setBots(readBots())
    setTests(readBacktestResults().length)
    const onUp = () => {
      setBots(readBots())
      setTests(readBacktestResults().length)
    }
    window.addEventListener("botforge-workspace-updated", onUp)
    return () => window.removeEventListener("botforge-workspace-updated", onUp)
  }, [])

  const update = (next: Bot[]) => {
    setBots(next)
    writeBots(next)
  }

  const setStatus = (id: string, status: BotStatus) =>
    update(
      bots.map((b) =>
        b.id === id ? { ...b, status, lastRun: status === "Running" ? new Date().toISOString() : b.lastRun } : b,
      ),
    )

  const setRunLang = (id: string, lang: string) => {
    if (!canRunLanguage(plan, lang)) return
    update(
      bots.map((b) =>
        b.id === id
          ? { ...b, runLanguage: lang, language: lang, code: b.codes?.[lang] || b.code }
          : b,
      ),
    )
  }

  const running = bots.filter((b) => b.status === "Running").length

  return (
    <div className="bf-page">
      <div className="bf-container bf-section-gap">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="bf-kicker">My bots</p>
            <h1 className="bf-title">Control center</h1>
            <p className="bf-sub">
              Stats, multi-language sources, VPS. Full source on Pro — Free sees a 1/5 preview with the rest blurred.
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
            <p className="bf-stat-label">Bots</p>
            <p className="bf-stat-value text-spotify-green">{bots.length}</p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Running</p>
            <p className="bf-stat-value">{running}</p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Tests stored</p>
            <p className="bf-stat-value">{tests}</p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Plan</p>
            <p className="bf-stat-value text-lg">{plan}</p>
          </div>
        </div>

        <div className="bf-card-pad">
          <div className="mb-3 flex items-center gap-2">
            <Server className="h-5 w-5 text-spotify-green" />
            <h2 className="font-semibold">VPS</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {VPS_PROVIDERS.map((p) => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className="bf-btn-ghost text-xs">
                {p.name} <ExternalLink className="ml-1 inline h-3 w-3" />
              </a>
            ))}
          </div>
        </div>

        {bots.length === 0 ? (
          <div className="bf-card-pad py-16 text-center">
            <Code className="mx-auto mb-4 h-10 w-10 text-spotify-green" />
            <h2 className="text-xl font-semibold">No bots yet</h2>
            <Button onClick={() => router.push("/bots/create")} className="bf-btn-primary mt-6">
              Create your first bot
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {bots.map((bot) => {
              const langs = Object.keys(bot.codes || {}).length ? Object.keys(bot.codes) : [bot.language]
              const activeView = view[bot.id] || bot.runLanguage || bot.language
              const source = bot.codes?.[activeView] || bot.code

              return (
                <article key={bot.id} className="bf-card overflow-hidden">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-spotify-grey p-5">
                    <div>
                      <h2 className="text-lg font-semibold">{bot.name}</h2>
                      <p className="mt-1 text-xs text-spotify-text-secondary">
                        {bot.symbol} · {bot.timeframe} · run as {bot.runLanguage || bot.language}
                        {bot.lastRun ? ` · last run ${new Date(bot.lastRun).toLocaleString()}` : ""}
                      </p>
                    </div>
                    <Badge
                      className={
                        bot.status === "Running"
                          ? "border-0 bg-spotify-green/20 text-spotify-green"
                          : "border-0 bg-spotify-grey text-spotify-text-secondary"
                      }
                    >
                      {bot.status}
                    </Badge>
                  </div>

                  <div className="space-y-4 p-5">
                    <p className="text-sm text-spotify-text-secondary">{bot.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                      <div className="rounded-lg border border-spotify-grey bg-spotify-black p-3">
                        <p className="text-spotify-text-secondary">Languages</p>
                        <p className="mt-1 text-lg font-semibold">{langs.length}</p>
                      </div>
                      <div className="rounded-lg border border-spotify-grey bg-spotify-black p-3">
                        <p className="text-spotify-text-secondary">Engine</p>
                        <p className="mt-1 font-semibold">{bot.aiProvider || "botforge"}</p>
                      </div>
                      <div className="rounded-lg border border-spotify-grey bg-spotify-black p-3">
                        <p className="text-spotify-text-secondary">Created</p>
                        <p className="mt-1 font-semibold">{new Date(bot.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="rounded-lg border border-spotify-grey bg-spotify-black p-3">
                        <p className="text-spotify-text-secondary">Source access</p>
                        <p className="mt-1 font-semibold">{premium ? "Full" : "Preview 1/5"}</p>
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs uppercase tracking-wider text-spotify-text-secondary">Source languages</p>
                      <div className="flex flex-wrap gap-2">
                        {langs.map((lang) => {
                          const locked = !canRunLanguage(plan, lang)
                          const isRun = (bot.runLanguage || bot.language) === lang
                          const isView = activeView === lang
                          return (
                            <div key={lang} className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setView({ ...view, [bot.id]: lang })}
                                className={
                                  isView
                                    ? "rounded-full bg-spotify-green px-3 py-1 text-xs font-medium text-spotify-black"
                                    : "rounded-full border border-spotify-grey px-3 py-1 text-xs text-spotify-text-secondary"
                                }
                              >
                                {lang}
                              </button>
                              <button
                                type="button"
                                disabled={locked}
                                onClick={() => setRunLang(bot.id, lang)}
                                className={
                                  isRun
                                    ? "rounded-full bg-spotify-green/20 px-2 py-1 text-[10px] text-spotify-green"
                                    : "rounded-full px-2 py-1 text-[10px] text-spotify-text-secondary disabled:opacity-40"
                                }
                              >
                                {isRun ? "RUN" : locked ? "PRO" : "use"}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-spotify-grey bg-spotify-black">
                      <div className="flex items-center justify-between border-b border-spotify-grey px-4 py-2">
                        <span className="font-mono text-xs text-spotify-text-secondary">{activeView}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs"
                          onClick={() => downloadSource(bot, activeView, premium)}
                        >
                          <Download className="mr-1 h-3 w-3" /> {premium ? "Download" : "Download preview"}
                        </Button>
                      </div>
                      <SourceBlock source={source} premium={premium} />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" className="bg-spotify-green text-spotify-black" onClick={() => setStatus(bot.id, "Running")}>
                        <Play className="mr-1 h-3.5 w-3.5" /> Run
                      </Button>
                      <Button size="sm" variant="outline" className="border-spotify-grey" onClick={() => setStatus(bot.id, "Paused")}>
                        <Pause className="mr-1 h-3.5 w-3.5" /> Pause
                      </Button>
                      <Button size="sm" variant="outline" className="border-spotify-grey" onClick={() => setStatus(bot.id, "Stopped")}>
                        <Square className="mr-1 h-3.5 w-3.5" /> Stop
                      </Button>
                      <Link href="/backtest">
                        <Button size="sm" variant="outline" className="border-spotify-grey">
                          Test in Strategy Tester
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-spotify-grey text-red-400"
                        onClick={() => update(bots.filter((b) => b.id !== bot.id))}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
