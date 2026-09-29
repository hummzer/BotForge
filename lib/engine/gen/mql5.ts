import type { StrategySpec } from "../spec"
import { header, indCalls, ruleExpr, type Emit } from "./common"

const emit: Emit = {
  num: n => String(n),
  v: (r, k) => k === 0 ? mqlRef(r) : mqlRef(r, k),
  cmp: (op, a, b) => `(${a} ${op} ${b})`,
  cross: (d, a1, a0, b1, b0) => d === "above" ? `(${a0} <= ${b0} && ${a1} > ${b1})` : `(${a0} >= ${b0} && ${a1} < ${b1})`,
  feat: (k, s) => `feat_${k.replace(/[^a-zA-Z0-9]/g, "_")}_${s}`,
  and: p => p.length ? p.join(" && ") : "false",
}
function mqlRef(r: string, shift = 0): string {
  const s = shift ? `, ${shift}` : ""
  if (r === "open") return `iOpen(_Symbol, _Period${s})`
  if (r === "high") return `iHigh(_Symbol, _Period${s})`
  if (r === "low") return `iLow(_Symbol, _Period${s})`
  if (r === "close") return `iClose(_Symbol, _Period${s})`
  if (r === "volume") return `iVolume(_Symbol, _Period${s})`
  return `buf_${r.replace(".", "_")}[${shift}]`
}

export function genMql5(spec: StrategySpec): string {
  const inds = indCalls(spec)
  const lines: string[] = []
  lines.push(header(spec, "mql5", "//"))
  lines.push("#include <Trade/Trade.mqh>")
  lines.push("#include <BotForge/Structure.mqh>")
  lines.push("#include <BotForge/RiskMoney.mqh>")
  lines.push("#include <BotForge/PositionManagement.mqh>")
  lines.push("#include <BotForge/Filters.mqh>")
  lines.push("")
  lines.push("CTrade trade;")
  for (const ind of inds) {
    lines.push(`int h_${ind.id} = INVALID_HANDLE;`)
    lines.push(`double buf_${ind.id}[];`)
  }
  lines.push("")
  lines.push("int OnInit() {")
  for (const ind of inds) {
    if (ind.type === "sma") lines.push(`  h_${ind.id} = iMA(_Symbol, _Period, ${ind.p.period}, 0, MODE_SMA, PRICE_CLOSE);`)
    else if (ind.type === "ema") lines.push(`  h_${ind.id} = iMA(_Symbol, _Period, ${ind.p.period}, 0, MODE_EMA, PRICE_CLOSE);`)
    else if (ind.type === "rsi") lines.push(`  h_${ind.id} = iRSI(_Symbol, _Period, ${ind.p.period}, PRICE_CLOSE);`)
    else if (ind.type === "atr") lines.push(`  h_${ind.id} = iATR(_Symbol, _Period, ${ind.p.period});`)
    else lines.push(`  h_${ind.id} = iMA(_Symbol, _Period, ${ind.p.period}, 0, MODE_SMA, PRICE_CLOSE);`)
  }
  lines.push("  return INIT_SUCCEEDED;")
  lines.push("}")
  lines.push("")
  lines.push("void OnTick() {")
  lines.push("  if(!IsNewBar()) return;")
  for (const ind of inds) {
    lines.push(`  CopyBuffer(h_${ind.id}, 0, 0, 3, buf_${ind.id}); ArraySetAsSeries(buf_${ind.id}, true);`)
  }
  lines.push(`  bool longCond = ${ruleExpr(spec, "long", emit)};`)
  lines.push(`  bool shortCond = ${ruleExpr(spec, "short", emit)};`)
  lines.push(`  double risk = ${spec.risk.riskPercent};`)
  lines.push(`  double rr = ${spec.risk.rr};`)
  lines.push("  if(longCond && PositionsBySymbol(_Symbol) < 1) {")
  lines.push("    double dist = AtrStopDistance(_Symbol, _Period, 14, 1.5);")
  lines.push("    TradePlan p = BuildTradePlan(_Symbol, 1, SymbolInfoDouble(_Symbol, SYMBOL_ASK), risk, rr, dist);")
  lines.push("    if(p.valid && MarginOk(_Symbol, p.lots, ORDER_TYPE_BUY)) trade.Buy(p.lots, _Symbol, p.entry, p.sl, p.tp);")
  lines.push("  }")
  lines.push("  if(shortCond && PositionsBySymbol(_Symbol) < 1) {")
  lines.push("    double dist = AtrStopDistance(_Symbol, _Period, 14, 1.5);")
  lines.push("    TradePlan p = BuildTradePlan(_Symbol, -1, SymbolInfoDouble(_Symbol, SYMBOL_BID), risk, rr, dist);")
  lines.push("    if(p.valid && MarginOk(_Symbol, p.lots, ORDER_TYPE_SELL)) trade.Sell(p.lots, _Symbol, p.entry, p.sl, p.tp);")
  lines.push("  }")
  lines.push("}")
  return lines.join("\n")
}

function PositionsBySymbol(symbol: string) { return 0 } // placeholder comment for generator
