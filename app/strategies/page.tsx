"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Copy, Check, ArrowRight, Save } from "lucide-react"
import {
  readBots,
  readBacktestResults,
  createBot,
  addBot,
  type Bot,
  type BacktestResult,
} from "@/lib/botforge"

const LANGUAGES = ["Python", "MQL4", "MQL5", "Pine Script", "JavaScript", "C++", "Rust", "Elixir"]

export default function StrategiesPage() {
  const [bots, setBots] = useState<Bot[]>([])
  const [results, setResults] = useState<BacktestResult[]>([])
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [codes, setCodes] = useState<Record<string, string>>({})
  const [selectedLang, setSelectedLang] = useState("Python")
  const [copied, setCopied] = useState(false)
  const [savedMsg, setSavedMsg] = useState("")
  const [error, setError] = useState("")
  const [q, setQ] = useState("")

  const refresh = () => {
    setBots(readBots())
    setResults(readBacktestResults())
  }

  useEffect(() => {
    refresh()
    const onUp = () => refresh()
    window.addEventListener("botforge-workspace-updated", onUp)
    return () => window.removeEventListener("botforge-workspace-updated", onUp)
  }, [])

  const filteredBots = useMemo(() => {
    if (!q.trim()) return bots
    const s = q.toLowerCase()
    return bots.filter(
      (b) =>
        b.name.toLowerCase().includes(s) ||
        b.symbol.toLowerCase().includes(s) ||
        b.language.toLowerCase().includes(s),
    )
  }, [bots, q])

  const generate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError("")
    setCodes({})
    setSavedMsg("")
    try {
      const r = await fetch("/api/generate-bot-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, languages: LANGUAGES }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "Generation failed")
      setCodes(d.codes || {})
      const first = Object.keys(d.codes || {})[0]
      if (first) setSelectedLang(first)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed")
    } finally {
      setLoading(false)
    }
  }

  const copy = async () => {
    if (!codes[selectedLang]) return
    await navigator.clipboard.writeText(codes[selectedLang])
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const saveAsBot = () => {
    const code = codes[selectedLang]
    if (!code) return
    const name =
      prompt.slice(0, 40).replace(/[^\w\s-]/g, "").trim() || `Strategy ${selectedLang}`
    const bot = createBot({
      name,
      language: selectedLang,
      status: "Ready",
      code,
      description: prompt.slice(0, 280),
      symbol: /xau|gold/i.test(prompt) ? "XAUUSD" : /btc/i.test(prompt) ? "BTCUSDT" : "EURUSD",
      timeframe: /m15|15m/i.test(prompt) ? "M15" : /h4/i.test(prompt) ? "H4" : "H1",
      indicators: ["from-compiler"],
    })
    addBot(bot)
    refresh()
    setSavedMsg(`Saved “${bot.name}” under My Bots.`)
  }

  return (
    <div className="bf-page">
      <div className="bf-container bf-section-gap">
        <div>
          <p className="bf-kicker">Strategies</p>
          <h1 className="bf-title">Browse & build</h1>
          <p className="bf-sub">
            Your saved bots and completed tests appear here. Generate code, then save it straight into My Bots.
          </p>
        </div>

        <div className="bf-grid-stats">
          <div className="bf-stat">
            <p className="bf-stat-label">Your bots</p>
            <p className="bf-stat-value text-spotify-green">{bots.length}</p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Tests stored</p>
            <p className="bf-stat-value">{results.length}</p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Running</p>
            <p className="bf-stat-value">{bots.filter((b) => b.status === "Running").length}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by name, symbol, language…"
            className="bf-input max-w-sm"
          />
          <Link href="/bots/create">
            <Button className="bf-btn-primary">Create bot</Button>
          </Link>
          <Link href="/backtest">
            <Button variant="outline" className="border-spotify-grey">
              Run backtest
            </Button>
          </Link>
        </div>

        {filteredBots.length === 0 ? (
          <div className="bf-card-pad text-center">
            <p className="text-sm text-spotify-text-secondary">
              No bots saved yet. Generate below and hit Save as bot, or use Create bot.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBots.map((b) => (
              <div key={b.id} className="bf-card-pad flex flex-col gap-3 transition hover:border-spotify-green/40">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{b.name}</p>
                    <p className="text-xs text-spotify-text-secondary">
                      {b.symbol} · {b.timeframe} · {b.language}
                    </p>
                  </div>
                  <Badge
                    className={
                      b.status === "Running"
                        ? "bg-spotify-green/20 text-spotify-green"
                        : "bg-spotify-grey text-spotify-text-secondary"
                    }
                  >
                    {b.status}
                  </Badge>
                </div>
                <p className="line-clamp-2 text-sm text-spotify-text-secondary">{b.description || "No description"}</p>
                <Link href="/bots" className="mt-auto text-sm text-spotify-green hover:underline">
                  Manage in My Bots <ArrowRight className="ml-1 inline h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold">Recent test results</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {results.slice(0, 6).map((r) => (
                <Link
                  key={r.id}
                  href={`/backtest/report?id=${r.id}`}
                  className="bf-card-pad block transition hover:border-spotify-green/40"
                >
                  <div className="flex justify-between gap-2">
                    <p className="font-medium">
                      {r.symbol || "—"} · {r.interval || "—"}
                    </p>
                    <span className="bf-badge-muted">{r.mode}</span>
                  </div>
                  <p className="mt-1 text-xs text-spotify-text-secondary">{r.strategy}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-spotify-text-secondary">Net P/L</p>
                      <p className={r.netPnl >= 0 ? "font-semibold text-spotify-green" : "font-semibold text-red-400"}>
                        {r.netPnl.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-spotify-text-secondary">WR</p>
                      <p className="font-semibold">{r.winRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-spotify-text-secondary">Trades</p>
                      <p className="font-semibold">{r.trades}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="bf-card overflow-hidden">
          <div className="border-b border-spotify-grey p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Strategy compiler</h2>
              <Badge className="bg-spotify-green text-spotify-black">8 languages</Badge>
            </div>
            <p className="mt-1 text-sm text-spotify-text-secondary">Describe rules in plain English. Engine generates code.</p>
          </div>
          <div className="space-y-4 p-5">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Buy when RSI crosses above 30 and price is above 50 SMA. Sell when RSI crosses below 70. 1% risk, 1:2 RR."
              className="min-h-[120px] w-full rounded-xl border border-spotify-grey bg-spotify-black p-4 text-sm outline-none focus:border-spotify-green"
            />
            <Button onClick={generate} disabled={loading || !prompt.trim()} className="bf-btn-primary w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              {loading ? "Generating…" : "Generate code"}
            </Button>
            {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            {savedMsg && <p className="text-sm text-spotify-green">{savedMsg}</p>}
            {Object.keys(codes).length > 0 && (
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {Object.keys(codes).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLang(lang)}
                      className={
                        selectedLang === lang
                          ? "rounded-full bg-spotify-green px-3 py-1.5 text-xs font-medium text-spotify-black"
                          : "rounded-full bg-spotify-grey px-3 py-1.5 text-xs text-spotify-text-secondary"
                      }
                    >
                      {lang}
                    </button>
                  ))}
                  <Button size="sm" variant="outline" onClick={copy} className="border-spotify-grey">
                    {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button size="sm" onClick={saveAsBot} className="bg-spotify-green text-spotify-black">
                    <Save className="mr-1 h-3 w-3" /> Save as bot
                  </Button>
                </div>
                <pre className="max-h-[420px] overflow-auto rounded-xl bg-spotify-black p-4 text-xs leading-relaxed text-spotify-text-secondary">
                  {codes[selectedLang]}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
