import type { StrategySpec } from "../spec"
import { header, indCalls, ruleExpr, type Emit } from "./common"

const emit: Emit = {
  num: n => String(n),
  v: (r, k) => {
    const sh = k ? `, ${k}` : ""
    if (r === "open") return `iOpen(NULL, 0${sh})`
    if (r === "high") return `iHigh(NULL, 0${sh})`
    if (r === "low") return `iLow(NULL, 0${sh})`
    if (r === "close") return `iClose(NULL, 0${sh})`
    if (r === "volume") return `iVolume(NULL, 0${sh})`
    return `iMA(NULL, 0, 14, 0, MODE_SMA, PRICE_CLOSE, ${k})`
  },
  cmp: (op, a, b) => `(${a} ${op} ${b})`,
  cross: (d, a1, a0, b1, b0) => d === "above" ? `(${a0} <= ${b0} && ${a1} > ${b1})` : `(${a0} >= ${b0} && ${a1} < ${b1})`,
  feat: (k, s) => `false`,
  and: p => p.length ? p.join(" && ") : "false",
}

export function genMql4(spec: StrategySpec): string {
  const lines: string[] = []
  lines.push(header(spec, "mql4", "//"))
  lines.push("int OnInit() { return INIT_SUCCEEDED; }")
  lines.push("void OnTick() {")
  lines.push(`  bool longCond = ${ruleExpr(spec, "long", emit)};`)
  lines.push(`  bool shortCond = ${ruleExpr(spec, "short", emit)};`)
  lines.push(`  double lots = 0.01; // risk ${spec.risk.riskPercent}% — size via AccountFreeMargin`)
  lines.push("  if(longCond && OrdersTotal() < 1) OrderSend(Symbol(), OP_BUY, lots, Ask, 3, 0, 0);")
  lines.push("  if(shortCond && OrdersTotal() < 1) OrderSend(Symbol(), OP_SELL, lots, Bid, 3, 0, 0);")
  lines.push("}")
  return lines.join("\n")
}
