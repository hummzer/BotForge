import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export const maxDuration = 60

const languageRules: Record<string,string> = {
  mql4: "Generate a complete MT4 Expert Advisor core using MQL4 conventions.",
  mql5: "Generate a complete MT5 Expert Advisor core using MQL5 conventions.",
  "pinescript": "Generate a TradingView Pine Script v6 strategy.",
  rust: "Generate idiomatic Rust trading strategy code with clear data structures and signal functions.",
  python: "Generate clean Python trading strategy code with signal, risk and execution abstractions.",
}

export async function POST(req: Request) {
  try {
    const { languages, prompt, language } = await req.json()
    const requested: string[] = Array.isArray(languages) && languages.length ? languages : [String(language || "python").toLowerCase()]
    const safeLanguages = requested.filter(x => languageRules[x])
    if (!safeLanguages.length) return Response.json({ error: "No supported language selected." }, { status: 400 })

    const codes: Record<string,string> = {}
    for (const lang of safeLanguages) {
      const systemPrompt = `You are the senior strategy compiler for BotForge.
Generate real, readable strategy code for the requested language.
Strategy specification:
${prompt}

Mandatory strategy architecture:
- Support multiple timeframes explicitly and document which timeframe is bias, confirmation and entry.
- Support the selected strategy families such as moving averages, Bollinger Bands, order blocks, liquidity sweeps/runs, breakouts, continuations, BOS/CHoCH and Fibonacci retracement when requested.
- Include deterministic entry and exit conditions.
- Include stop loss, take profit and position sizing/risk controls.
- Never promise profitability.
- Do not invent broker credentials.
- Do not leave the core signal logic as pseudocode.
- Keep external integrations behind clear interfaces.
Language requirements: ${languageRules[lang]}
Return ONLY the source code, with no markdown fences.`

      const result = await generateText({
        model: openai("gpt-4o"),
        system: systemPrompt,
        prompt: prompt,
      })
      codes[lang] = result.text
    }

    return Response.json({ codes, generatedAt: new Date().toISOString() })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Generation failed." }, { status: 500 })
  }
}
