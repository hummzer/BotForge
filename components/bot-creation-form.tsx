"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { createBot, addBot } from "@/lib/botforge"
import { ALL_LANGS, FREE_RUN_LANGS, canRunLanguage, planLanguageNote } from "@/lib/plans"
import Link from "next/link"

const STEPS = [
  "Identity",
  "Market",
  "Strategy prompt",
  "AI provider",
  "Compile",
  "Review & save",
] as const

export function BotCreationForm() {
  const router = useRouter()
  const { user } = useAuth()
  const plan = user?.plan || "Free"
  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("XAUUSD")
  const [timeframe, setTimeframe] = useState("H1")
  const [prompt, setPrompt] = useState("")
  const [aiProvider, setAiProvider] = useState<"botforge" | "openai">("botforge")
  const [codes, setCodes] = useState<Record<string, string>>({})
  const [runLang, setRunLang] = useState("Python")
  const [viewLang, setViewLang] = useState("Python")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const progress = ((step + 1) / STEPS.length) * 100

  const compile = async () => {
    if (!prompt.trim()) {
      setError("Describe the strategy first.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const r = await fetch("/api/generate-bot-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${name || "Strategy"} on ${symbol} ${timeframe}. ${prompt}`,
          languages: [...ALL_LANGS],
          useAi: aiProvider === "openai",
        }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "Compile failed")
      const next = d.codes || {}
      setCodes(next)
      const keys = Object.keys(next)
      const preferred = FREE_RUN_LANGS.find((l) => keys.includes(l)) || keys[0]
      if (preferred) {
        setRunLang(preferred)
        setViewLang(preferred)
      }
      setStep(4)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compile failed")
    } finally {
      setLoading(false)
    }
  }

  const save = () => {
    const code = codes[runLang] || Object.values(codes)[0] || ""
    if (!code) {
      setError("No code to save — compile first.")
      return
    }
    if (!canRunLanguage(plan, runLang)) {
      setError(`Free plan cannot set ${runLang} as run target. Choose Python, MQL5, or Pine Script — or upgrade.`)
      return
    }
    const bot = createBot({
      name: name || "BotForge Strategy",
      language: runLang,
      runLanguage: runLang,
      status: "Ready",
      code,
      codes,
      description: prompt.slice(0, 400),
      symbol,
      timeframe,
      indicators: ["compiler"],
      aiProvider,
      prompt,
    })
    addBot(bot)
    router.push("/bots")
  }

  const next = () => {
    if (step === 0 && !name.trim()) {
      setError("Name your bot.")
      return
    }
    setError("")
    if (step === 3) {
      void compile()
      return
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  return (
    <div className="bf-card overflow-hidden">
      <div className="border-b border-spotify-grey p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </p>
          <Badge className="bg-spotify-green/15 text-spotify-green border-0">{plan}</Badge>
        </div>
        <Progress value={progress} className="mt-3 h-1.5" />
        <p className="mt-2 text-xs text-spotify-text-secondary">{planLanguageNote(plan)}</p>
      </div>

      <div className="space-y-5 p-5">
        {step === 0 && (
          <div className="space-y-3">
            <Label>Bot name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="London Gold Sweep"
              className="h-12 border-spotify-grey bg-spotify-black"
            />
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Symbol</Label>
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="mt-2 h-12 border-spotify-grey bg-spotify-black"
              />
            </div>
            <div>
              <Label>Timeframe</Label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="mt-2 h-12 w-full rounded-md border border-spotify-grey bg-spotify-black px-3 text-sm"
              >
                {["M1", "M5", "M15", "M30", "H1", "H4", "D1"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <Label>Strategy in plain English</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              placeholder="Buy when RSI crosses above 30 and price is above 50 SMA. Sell when RSI crosses below 70. Risk 1%, RR 1:2, ATR stop."
              className="border-spotify-grey bg-spotify-black"
            />
            <p className="text-xs text-spotify-text-secondary">
              Our engine maps this into a StrategySpec, then emits 8 language templates.
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Label>Compile engine</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setAiProvider("botforge")}
                className={
                  aiProvider === "botforge"
                    ? "rounded-xl border border-spotify-green bg-spotify-green/10 p-4 text-left"
                    : "rounded-xl border border-spotify-grey p-4 text-left"
                }
              >
                <p className="font-medium">BotForge deterministic</p>
                <p className="mt-1 text-xs text-spotify-text-secondary">
                  Spec → indicators → templates. No API key. Always available.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setAiProvider("openai")}
                className={
                  aiProvider === "openai"
                    ? "rounded-xl border border-spotify-green bg-spotify-green/10 p-4 text-left"
                    : "rounded-xl border border-spotify-grey p-4 text-left"
                }
              >
                <p className="font-medium">OpenAI assist</p>
                <p className="mt-1 text-xs text-spotify-text-secondary">
                  Uses server OPENAI_API_KEY if a template fails. Set key on Vercel.
                </p>
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <p className="text-sm text-spotify-text-secondary">
              {Object.keys(codes).length
                ? `${Object.keys(codes).length} languages compiled. Pick active run language (tier limits apply).`
                : "No code yet — go back and compile."}
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(codes).map((lang) => {
                const locked = !canRunLanguage(plan, lang)
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setViewLang(lang)
                      if (!locked) setRunLang(lang)
                    }}
                    className={
                      runLang === lang
                        ? "rounded-full bg-spotify-green px-3 py-1.5 text-xs font-medium text-spotify-black"
                        : locked
                          ? "rounded-full border border-spotify-grey px-3 py-1.5 text-xs text-spotify-text-secondary/50"
                          : "rounded-full border border-spotify-grey px-3 py-1.5 text-xs text-spotify-text-secondary"
                    }
                  >
                    {lang}
                    {locked ? " · Pro" : ""}
                  </button>
                )
              })}
            </div>
            {Object.keys(codes).length > 0 && (
              <pre className="max-h-72 overflow-auto rounded-xl border border-spotify-grey bg-spotify-black p-4 font-mono text-xs leading-relaxed text-spotify-text-secondary">
                {codes[viewLang] || ""}
              </pre>
            )}
            {plan === "Free" && (
              <p className="text-xs text-spotify-text-secondary">
                Free run targets: {FREE_RUN_LANGS.join(", ")}.{" "}
                <Link href="/pricing" className="text-spotify-green hover:underline">
                  Upgrade
                </Link>
              </p>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3 rounded-xl border border-spotify-grey bg-spotify-black p-4 text-sm">
            <p>
              <span className="text-spotify-text-secondary">Name</span> · {name || "—"}
            </p>
            <p>
              <span className="text-spotify-text-secondary">Market</span> · {symbol} {timeframe}
            </p>
            <p>
              <span className="text-spotify-text-secondary">Run language</span> · {runLang}
            </p>
            <p>
              <span className="text-spotify-text-secondary">Sources</span> · {Object.keys(codes).length} languages
            </p>
            <p>
              <span className="text-spotify-text-secondary">Engine</span> · {aiProvider}
            </p>
          </div>
        )}

        {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

        <div className="flex flex-wrap justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="border-spotify-grey"
            disabled={step === 0 || loading}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" className="bf-btn-primary" disabled={loading} onClick={next}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Compiling…
                </>
              ) : step === 3 ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Compile all languages
                </>
              ) : (
                <>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button type="button" className="bf-btn-primary" onClick={save}>
              <Check className="mr-2 h-4 w-4" /> Save bot
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
