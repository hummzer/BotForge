import type { StrategySpec } from "../spec"
import { header, ruleExpr, type Emit } from "./common"

const emit: Emit = {
  num: n => String(n),
  v: (r, k) => k === 0 ? `series.get("${r}", i)` : `series.get("${r}", i-${k})`,
  cmp: (op, a, b) => `(${a} ${op} ${b})`,
  cross: (d, a1, a0, b1, b0) => d === "above" ? `(${a0} <= ${b0} && ${a1} > ${b1})` : `(${a0} >= ${b0} && ${a1} < ${b1})`,
  feat: (k, s) => `false`,
  and: p => p.length ? p.join(" && ") : "false",
}

export function genRust(spec: StrategySpec): string {
  const lines: string[] = []
  lines.push(header(spec, "rust", "//"))
  lines.push("pub struct Signal { pub long_entry: bool, pub short_entry: bool }")
  lines.push("pub struct BotForgeStrategy;")
  lines.push("impl BotForgeStrategy {")
  lines.push(`    pub const RISK_PCT: f64 = ${spec.risk.riskPercent};`)
  lines.push(`    pub const RR: f64 = ${spec.risk.rr};`)
  lines.push("    pub fn signals(open: &[f64], high: &[f64], low: &[f64], close: &[f64], volume: &[f64]) -> Signal {")
  lines.push("        let n = close.len();")
  lines.push("        if n < 2 { return Signal { long_entry: false, short_entry: false }; }")
  lines.push(`        // long: ${ruleExpr(spec, "long", emit)}`)
  lines.push(`        // short: ${ruleExpr(spec, "short", emit)}`)
  lines.push("        Signal { long_entry: false, short_entry: false }")
  lines.push("    }")
  lines.push("}")
  return lines.join("\n")
}
