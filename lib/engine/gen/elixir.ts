import type { StrategySpec } from "../spec"
import { header, ruleExpr, type Emit } from "./common"

const emit: Emit = {
  num: n => String(n),
  v: (r, k) => k === 0 ? `Enum.at(series["${r}"], i)` : `Enum.at(series["${r}"], i-${k})`,
  cmp: (op, a, b) => `(${a} ${op} ${b})`,
  cross: (d, a1, a0, b1, b0) => d === "above" ? `(${a0} <= ${b0} and ${a1} > ${b1})` : `(${a0} >= ${b0} and ${a1} < ${b1})`,
  feat: (k, s) => `false`,
  and: p => p.length ? p.join(" and ") : "false",
}

export function genElixir(spec: StrategySpec): string {
  const lines: string[] = []
  lines.push(header(spec, "elixir", "#"))
  lines.push("defmodule BotForgeStrategy do")
  lines.push(`  @risk_pct ${spec.risk.riskPercent}`)
  lines.push(`  @rr ${spec.risk.rr}`)
  lines.push("  def signals(open, high, low, close, volume) do")
  lines.push("    n = length(close)")
  lines.push(`    # long: ${ruleExpr(spec, "long", emit)}`)
  lines.push(`    # short: ${ruleExpr(spec, "short", emit)}`)
  lines.push("    %{long: false, short: false}")
  lines.push("  end")
  lines.push("end")
  return lines.join("\n")
}
