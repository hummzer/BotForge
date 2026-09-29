/**
 * BotForge engine smoke test — run with: npx tsx scripts/verify-engine.ts
 * Validates StrategySpec parsing, indicator math, backtest loop, and code generators.
 */
import { parseSpec, describeSpec, type StrategySpec } from "../lib/engine/spec"
import { computeIndicators, type Candle } from "../lib/engine/indicators"
import { runBacktest } from "../lib/engine/backtest"
import { generate, genAll, LANGS } from "../lib/engine/gen"

function makeCandles(n: number): Candle[] {
  const out: Candle[] = []
  let price = 2000
  for (let i = 0; i < n; i++) {
    const drift = Math.sin(i / 20) * 5 + (Math.random() - 0.5) * 3
    const open = price
    const close = price + drift
    const high = Math.max(open, close) + Math.random() * 2
    const low = Math.min(open, close) - Math.random() * 2
    out.push({ time: 1700000000 + i * 3600, open, high, low, close, volume: 100 + Math.random() * 50 })
    price = close
  }
  return out
}

const sample: StrategySpec = {
  name: "Smoke RSI Mean-Reversion",
  summary: "Buy RSI < 30, sell RSI > 70, ATR stop",
  timeframe: "H1",
  direction: "both",
  indicators: [
    { id: "rsi14", type: "rsi", period: 14 },
    { id: "atr14", type: "atr", period: 14 },
  ],
  entry: {
    long: [{ kind: "cmp", a: "rsi14", op: "<", b: 30 }],
    short: [{ kind: "cmp", a: "rsi14", op: ">", b: 70 }],
  },
  risk: {
    riskPercent: 1,
    sl: { mode: "atr", atr: "atr14", mult: 1.5 },
    rr: 2,
  },
  management: { breakevenRR: 1 },
  filters: { maxPositions: 1 },
}

function main() {
  const parsed = parseSpec(sample)
  if (!parsed.ok) {
    console.error("parseSpec failed", parsed.errors)
    process.exit(1)
  }
  console.log("describe:", describeSpec(parsed.spec).join(" | "))

  const candles = makeCandles(500)
  const series = computeIndicators(parsed.spec, candles)
  console.log("indicators:", Object.keys(series).join(", "))

  const result = runBacktest(parsed.spec, candles, { balance: 10000, pipSize: 0.01, contractSize: 100 })
  console.log("backtest trades:", result.stats.trades, "net:", result.stats.net.toFixed(2), "WR:", result.stats.winRate.toFixed(1) + "%")

  for (const lang of LANGS) {
    const code = generate(parsed.spec, lang)
    if (!code || code.length < 50) {
      console.error("generator failed for", lang)
      process.exit(1)
    }
    console.log(`gen ${lang}: ${code.length} chars`)
  }
  const all = genAll(parsed.spec)
  console.log("genAll files:", Object.keys(all).join(", "))
  console.log("OK — engine smoke test passed")
}

main()
