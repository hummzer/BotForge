import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { parseSpec, type StrategySpec } from "@/lib/engine/spec"
import { generate, LANGS, type Lang } from "@/lib/engine/gen"

export const maxDuration = 60

const LANG_ALIASES: Record<string, Lang> = {
  python: "python",
  mql4: "mql4",
  mql5: "mql5",
  pine: "pine",
  pinescript: "pine",
  javascript: "javascript",
  js: "javascript",
  cpp: "cpp",
  "c++": "cpp",
  rust: "rust",
  elixir: "elixir",
}

const DISPLAY: Record<Lang, string> = {
  python: "Python",
  mql4: "MQL4",
  mql5: "MQL5",
  pine: "Pine Script",
  javascript: "JavaScript",
  cpp: "C++",
  rust: "Rust",
  elixir: "Elixir",
}

/** Build a minimal StrategySpec from free-text when structured JSON is not provided. */
function heuristicSpec(prompt: string): StrategySpec {
  const lower = prompt.toLowerCase()
  const wantsRsi = /rsi/.test(lower)
  const wantsMacd = /macd/.test(lower)
  const wantsEma = /ema|moving average|ma\b/.test(lower)
  const wantsBos = /bos|break of structure|choch|market structure/.test(lower)
  const wantsSweep = /sweep|liquidity/.test(lower)

  const indicators: StrategySpec["indicators"] = []
  if (wantsRsi) indicators.push({ id: "rsi14", type: "rsi", period: 14 })
  if (wantsMacd) indicators.push({ id: "macd", type: "macd", fast: 12, slow: 26, signal: 9 })
  if (wantsEma || (!wantsRsi && !wantsMacd && !wantsBos)) {
    indicators.push({ id: "ema50", type: "ema", period: 50 })
    if (!wantsRsi) indicators.push({ id: "rsi14", type: "rsi", period: 14 })
  }
  indicators.push({ id: "atr14", type: "atr", period: 14 })

  const long: StrategySpec["entry"]["long"] = []
  const short: StrategySpec["entry"]["short"] = []
  if (wantsBos) {
    long.push({ kind: "bos_pullback", swing: 3, fibMin: 0.382, fibMax: 0.618 })
    short.push({ kind: "bos_pullback", swing: 3, fibMin: 0.382, fibMax: 0.618 })
  } else if (wantsSweep) {
    long.push({ kind: "sweep", swing: 3 })
    short.push({ kind: "sweep", swing: 3 })
  } else if (wantsRsi || indicators.some(i => i.type === "rsi")) {
    long.push({ kind: "cmp", a: "rsi14", op: "<", b: 30 })
    short.push({ kind: "cmp", a: "rsi14", op: ">", b: 70 })
  } else {
    long.push({ kind: "cross", a: "ema50", dir: "above", b: "close" })
    short.push({ kind: "cross", a: "ema50", dir: "below", b: "close" })
  }

  return {
    name: prompt.slice(0, 48).replace(/[^\w\s-]/g, "").trim() || "BotForge Strategy",
    summary: prompt.slice(0, 400),
    timeframe: /m1|1\s*min/.test(lower) ? "M1" : /m5|5\s*min/.test(lower) ? "M5" : /m15/.test(lower) ? "M15" : /h4|4\s*h/.test(lower) ? "H4" : "H1",
    direction: /long only/.test(lower) ? "long" : /short only/.test(lower) ? "short" : "both",
    indicators,
    entry: { long, short },
    risk: { riskPercent: 1, sl: { mode: "atr", atr: "atr14", mult: 1.5 }, rr: 2 },
    management: { breakevenRR: 1 },
    filters: { maxPositions: 1 },
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const prompt: string = String(body.prompt || "").trim()
    if (!prompt && !body.spec) {
      return Response.json({ error: "Strategy description or spec is required." }, { status: 400 })
    }

    let requested: string[] = Array.isArray(body.languages) && body.languages.length
      ? body.languages.map((x: string) => String(x).toLowerCase().replace(/\s+/g, ""))
      : [...LANGS]

    const langs: Lang[] = []
    for (const r of requested) {
      const mapped = LANG_ALIASES[r] || (LANGS.includes(r as Lang) ? (r as Lang) : null)
      if (mapped && !langs.includes(mapped)) langs.push(mapped)
    }
    if (!langs.length) langs.push(...LANGS)

    // Prefer structured spec when provided; else parse free text heuristically
    let spec: StrategySpec
    if (body.spec) {
      const parsed = parseSpec(body.spec)
      if (!parsed.ok) {
        return Response.json({ error: "Invalid strategy spec", details: parsed.errors }, { status: 400 })
      }
      spec = parsed.spec
    } else {
      spec = heuristicSpec(prompt)
    }

    const codes: Record<string, string> = {}
    const useAi = body.useAi === true

    for (const lang of langs) {
      try {
        // Deterministic compiler from StrategySpec
        codes[DISPLAY[lang]] = generate(spec, lang)
      } catch (e) {
        if (useAi) {
          const result = await generateText({
            model: openai("gpt-4o"),
            system: `You are the BotForge strategy compiler. Return ONLY ${lang} source code, no markdown.`,
            prompt: `Compile this strategy into ${lang}:\n${prompt || JSON.stringify(spec)}`,
          })
          codes[DISPLAY[lang]] = result.text
        } else {
          codes[DISPLAY[lang]] = `// Generator error for ${lang}: ${e instanceof Error ? e.message : String(e)}`
        }
      }
    }

    return Response.json({
      codes,
      spec,
      engine: "botforge-deterministic",
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Generation failed." },
      { status: 500 },
    )
  }
}
