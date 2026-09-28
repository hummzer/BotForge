"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Copy, Check } from "lucide-react"

const LANGUAGES = ["Python", "MQL4", "MQL5", "Pine Script", "JavaScript", "C++", "Rust", "Elixir"]

const SUGGESTIONS = [
  "Buy when price is above 50 SMA and RSI crosses above 30 from oversold. Sell when price is below 50 SMA and RSI crosses below 70. 1% risk, 1:2 R:R.",
  "MACD histogram cross with EMA 200 trend filter, ATR-based stop, take profit at 2x ATR.",
  "Liquidity sweep of prior day high/low, confirm BOS on H1, enter on M15 retracement with defined risk.",
]

export default function StrategiesPage() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [codes, setCodes] = useState<Record<string, string>>({})
  const [selectedLang, setSelectedLang] = useState("Python")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  const generate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError("")
    setCodes({})
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
    const text = codes[selectedLang]
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="min-h-screen bg-spotify-black py-10 text-spotify-text-primary">
      <div className="container mx-auto max-w-5xl px-4">
        <p className="text-xs tracking-[0.3em] text-spotify-green">BOTFORGE · STRATEGY ENGINE</p>
        <h1 className="mt-3 font-display text-4xl font-bold">Strategy Builder</h1>
        <p className="mb-8 mt-2 max-w-2xl text-sm text-spotify-text-secondary">
          Describe your strategy in plain English. The engine uses indicators and market-structure logic to generate production-ready code in all 8 languages.
        </p>

        <Card className="border-spotify-grey bg-spotify-dark-grey shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Describe your strategy</CardTitle>
              <Badge className="bg-spotify-green text-spotify-black">8 languages</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Buy when price is above 50 SMA and RSI crosses above 30 from oversold. Sell when below 50 SMA and RSI crosses below 70. Use 1% risk and 1:2 risk-to-reward."
              className="min-h-[140px] w-full rounded-xl border border-spotify-grey bg-spotify-black p-4 text-sm text-spotify-text-primary placeholder:text-spotify-text-secondary outline-none focus:border-spotify-green"
            />
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.slice(0, 24)}
                  type="button"
                  onClick={() => setPrompt(s)}
                  className="rounded-full border border-spotify-grey px-3 py-1.5 text-xs text-spotify-text-secondary hover:border-spotify-green hover:text-spotify-green"
                >
                  + {s.slice(0, 48)}…
                </button>
              ))}
            </div>
            <Button
              onClick={generate}
              disabled={loading || !prompt.trim()}
              className="w-full bg-spotify-green text-spotify-black hover:bg-spotify-green/90 h-12"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {loading ? "Generating code in 8 languages…" : "Generate Code (8 Languages)"}
            </Button>
            {error && (
              <p className="text-sm text-red-400 border border-red-400/30 rounded-lg p-3 bg-red-400/10">{error}</p>
            )}
          </CardContent>
        </Card>

        {Object.keys(codes).length > 0 && (
          <div className="mt-8 animate-fade-in-up">
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(codes).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setSelectedLang(lang)}
                  className={
                    selectedLang === lang
                      ? "rounded-lg bg-spotify-green px-4 py-2 text-sm font-medium text-spotify-black"
                      : "rounded-lg bg-spotify-grey px-4 py-2 text-sm text-spotify-text-secondary hover:text-white"
                  }
                >
                  {lang}
                </button>
              ))}
            </div>
            <Card className="border-spotify-grey bg-spotify-dark-grey overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-spotify-grey py-3">
                <CardTitle className="text-base">{selectedLang}</CardTitle>
                <Button variant="outline" size="sm" onClick={copy} className="border-spotify-grey">
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <pre className="max-h-[520px] overflow-auto p-4 text-xs leading-relaxed text-spotify-text-secondary font-mono bg-spotify-black">
                  {codes[selectedLang]}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
