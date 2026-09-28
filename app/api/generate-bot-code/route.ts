import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export const maxDuration = 60

const languageRules: Record<string, string> = {
  python: "Generate clean, production-ready Python trading strategy code with numpy/pandas-friendly signal, risk and execution abstractions. Include clear class structure.",
  mql4: "Generate a complete MT4 Expert Advisor using MQL4 conventions (OnInit, OnTick, OrderSend, indicators).",
  mql5: "Generate a complete MT5 Expert Advisor using MQL5 conventions (CTrade, handles, OnTick).",
  pinescript: "Generate a TradingView Pine Script v5 strategy with inputs, entries, exits and plots.",
  javascript: "Generate modern JavaScript (ES modules) strategy class with calculateSMA/RSI helpers and generateSignal.",
  "c++": "Generate idiomatic C++ strategy with std::vector history, Signal struct and risk controls.",
  rust: "Generate idiomatic Rust strategy with struct Signal, BotForgeStrategy impl and Option-based indicators.",
  elixir: "Generate Elixir module BotForgeStrategy with module attributes for periods and pure functions for signals.",
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const prompt: string = String(body.prompt || "").trim()
    if (!prompt) return Response.json({ error: "Strategy description is required." }, { status: 400 })

    let requested: string[] = Array.isArray(body.languages) && body.languages.length
      ? body.languages.map((x: string) => String(x).toLowerCase().replace(/\s+/g, ""))
      : Object.keys(languageRules)

    // normalize aliases
    const normalize = (x: string) => {
      if (x === "pine" || x === "pinescript") return "pinescript"
      if (x === "c++" || x === "cpp") return "c++"
      return x
    }
    requested = requested.map(normalize).filter((x) => languageRules[x])
    if (!requested.length) requested = Object.keys(languageRules)

    const codes: Record<string, string> = {}
    for (const lang of requested) {
      const systemPrompt = `You are the senior strategy compiler for BotForge.
Generate REAL, readable, complete strategy source code for the requested language.
Do not return markdown fences. Return ONLY source code.

User strategy description:
${prompt}

Mandatory architecture:
- Detect and implement indicators mentioned (SMA, EMA, RSI, MACD, Bollinger Bands, ATR, volume, structure: BOS/CHoCH, liquidity, Fibonacci, order blocks) when relevant; otherwise use a sensible default stack (SMA 50 + RSI 14).
- Deterministic entry and exit conditions.
- Stop loss, take profit and risk-based position sizing (e.g. 1% risk).
- Clear comments documenting bias vs confirmation vs entry timeframe if multi-timeframe is implied.
- Never invent broker credentials or claim guaranteed profitability.
- Keep external broker IO behind simple interfaces or comments.

Language requirements: ${languageRules[lang]}`

      const result = await generateText({
        model: openai("gpt-4o"),
        system: systemPrompt,
        prompt: `Compile this strategy into ${lang}:\n${prompt}`,
      })
      codes[lang === "pinescript" ? "Pine Script" : lang === "c++" ? "C++" : lang.charAt(0).toUpperCase() + lang.slice(1)] =
        result.text
    }

    return Response.json({ codes, generatedAt: new Date().toISOString() })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Generation failed." },
      { status: 500 },
    )
  }
}
