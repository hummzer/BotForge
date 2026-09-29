import type { StrategySpec } from "../spec"
import { header, indCalls, ruleExpr, type Emit } from "./common"

const emit: Emit = {
  num: (n) => String(n),
  v: (r, k) => (k === 0 ? pineRef(r) : `${pineRef(r)}[${k}]`),
  cmp: (op, a, b) => `(${a} ${op} ${b})`,
  cross: (d, a1, _a0, b1, _b0) =>
    d === "above" ? `ta.crossover(${stripIdx(a1)}, ${stripIdx(b1)})` : `ta.crossunder(${stripIdx(a1)}, ${stripIdx(b1)})`,
  feat: (k, s) => `${featVar(k)}_${s}`,
  and: (p) => (p.length ? p.join(" and ") : "false"),
}

const stripIdx = (s: string) => s.replace(/\[\d+\]$/, "")

function pineRef(r: string): string {
  if (r === "open" || r === "high" || r === "low" || r === "close" || r === "volume") return r
  return "v_" + r.replace(/\./g, "_")
}

function featVar(key: string) {
  return "feat_" + key.replace(/[^a-zA-Z0-9]/g, "_")
}

export function genPine(spec: StrategySpec): string {
  const lines: string[] = []
  lines.push(header(spec, "pine", "//"))
  lines.push("//@version=5")
  lines.push(
    `strategy("${spec.name.replace(/"/g, "")}", overlay=true, initial_capital=10000, default_qty_type=strategy.percent_of_equity, default_qty_value=${spec.risk.riskPercent})`,
  )
  lines.push("")

  for (const ind of indCalls(spec)) {
    const id = "v_" + ind.id.replace(/\./g, "_")
    switch (ind.type) {
      case "sma":
        lines.push(`${id} = ta.sma(close, ${ind.p.period})`)
        break
      case "ema":
        lines.push(`${id} = ta.ema(close, ${ind.p.period})`)
        break
      case "rsi":
        lines.push(`${id} = ta.rsi(close, ${ind.p.period})`)
        break
      case "atr":
        lines.push(`${id} = ta.atr(${ind.p.period})`)
        break
      case "macd":
        lines.push(`[${id}_main, ${id}_signal, ${id}_hist] = ta.macd(close, ${ind.p.fast}, ${ind.p.slow}, ${ind.p.signal})`)
        break
      case "bb":
        lines.push(`[${id}_mid, ${id}_upper, ${id}_lower] = ta.bb(close, ${ind.p.period}, ${ind.p.deviation})`)
        break
      case "stoch":
        lines.push(`[${id}_k, ${id}_d] = ta.stoch(close, high, low, ${ind.p.k})`)
        break
      case "donchian":
        lines.push(`${id}_upper = ta.highest(high, ${ind.p.period})`)
        lines.push(`${id}_lower = ta.lowest(low, ${ind.p.period})`)
        break
      default:
        lines.push(`${id} = ta.sma(close, ${ind.p.period})`)
    }
  }

  lines.push("")
  lines.push(`longCond = ${ruleExpr(spec, "long", emit)}`)
  lines.push(`shortCond = ${ruleExpr(spec, "short", emit)}`)
  lines.push("if longCond")
  lines.push("    strategy.entry(\"L\", strategy.long)")
  lines.push("if shortCond")
  lines.push("    strategy.entry(\"S\", strategy.short)")
  return lines.join("\n")
}
