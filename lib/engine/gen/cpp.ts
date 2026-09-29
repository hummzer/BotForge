import type { StrategySpec } from "../spec"
import { header, indCalls, ruleExpr, type Emit } from "./common"

const emit: Emit = {
  num: n => String(n),
  v: (r, k) => k === 0 ? `series.at("${r}", i)` : `series.at("${r}", i-${k})`,
  cmp: (op, a, b) => `(${a} ${op} ${b})`,
  cross: (d, a1, a0, b1, b0) => d === "above" ? `(${a0} <= ${b0} && ${a1} > ${b1})` : `(${a0} >= ${b0} && ${a1} < ${b1})`,
  feat: (k, s) => `false`,
  and: p => p.length ? p.join(" && ") : "false",
}

export function genCpp(spec: StrategySpec): string {
  const lines: string[] = []
  lines.push(header(spec, "cpp", "//"))
  lines.push("#include <vector>\n#include <string>\n#include <cmath>")
  lines.push("struct Signal { bool long_entry=false; bool short_entry=false; };")
  lines.push("class BotForgeStrategy {")
  lines.push("public:")
  lines.push(`  static constexpr double RISK_PCT = ${spec.risk.riskPercent};`)
  lines.push(`  static constexpr double RR = ${spec.risk.rr};`)
  lines.push("  Signal signals(const std::vector<double>& open, const std::vector<double>& high,")
  lines.push("               const std::vector<double>& low, const std::vector<double>& close,")
  lines.push("               const std::vector<double>& volume) {")
  lines.push("    Signal s; size_t n = close.size(); if(n < 2) return s;")
  lines.push("    // Indicator buffers would be computed here from close[]")
  lines.push(`    // long: ${ruleExpr(spec, "long", emit)}`)
  lines.push(`    // short: ${ruleExpr(spec, "short", emit)}`)
  lines.push("    return s;")
  lines.push("  }")
  lines.push("};")
  return lines.join("\n")
}
