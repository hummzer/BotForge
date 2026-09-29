import type { StrategySpec } from "../spec"
import { header, indCalls, ruleExpr, type Emit } from "./common"

const emit: Emit = {
  num: n => String(n),
  v: (r, k) => k === 0 ? jsRef(r) : `${jsRef(r)}[i-${k}]`,
  cmp: (op, a, b) => `(${a} ${op} ${b})`,
  cross: (d, a1, a0, b1, b0) => d === "above" ? `(${a0} <= ${b0} && ${a1} > ${b1})` : `(${a0} >= ${b0} && ${a1} < ${b1})`,
  feat: (k, s) => `feats["${k}"]["${s}"][i]`,
  and: p => p.length ? p.join(" && ") : "false",
}
function jsRef(r: string): string {
  if (["open", "high", "low", "close", "volume"].includes(r)) return `${r}[i]`
  return `series["${r}"][i]`
}

export function genJavaScript(spec: StrategySpec): string {
  const inds = indCalls(spec)
  const lines: string[] = []
  lines.push(header(spec, "javascript", "//"))
  lines.push("export class BotForgeStrategy {")
  lines.push(`  static NAME = ${JSON.stringify(spec.name)};`)
  lines.push(`  static RISK_PCT = ${spec.risk.riskPercent};`)
  lines.push(`  static RR = ${spec.risk.rr};`)
  lines.push("")
  lines.push("  static sma(v, n) { const out = Array(v.length).fill(null); let s=0,c=0; for (let i=0;i<v.length;i++){ if(v[i]==null){s=0;c=0;continue;} s+=v[i];c++; if(c>n){s-=v[i-n];c--;} if(c===n) out[i]=s/n;} return out; }")
  lines.push("  static ema(v, n) { const out=Array(v.length).fill(null); const k=2/(n+1); let p=null; for(let i=0;i<v.length;i++){ if(v[i]==null)continue; p=p==null?v[i]:v[i]*k+p*(1-k); out[i]=p;} return out; }")
  lines.push("  static rsi(c, n) { const out=Array(c.length).fill(null); if(c.length<=n)return out; let g=0,l=0; for(let i=1;i<=n;i++){const d=c[i]-c[i-1]; if(d>=0)g+=d;else l-=d;} g/=n;l/=n; out[n]=l===0?100:100-100/(1+g/l); for(let i=n+1;i<c.length;i++){const d=c[i]-c[i-1]; g=(g*(n-1)+(d>0?d:0))/n; l=(l*(n-1)+(d<0?-d:0))/n; out[i]=l===0?100:100-100/(1+g/l);} return out; }")
  lines.push("")
  lines.push("  signals(open, high, low, close, volume) {")
  lines.push("    const n = close.length; const series = {};")
  for (const ind of inds) {
    if (ind.type === "sma") lines.push(`    series["${ind.id}"] = BotForgeStrategy.sma(close, ${ind.p.period});`)
    else if (ind.type === "ema") lines.push(`    series["${ind.id}"] = BotForgeStrategy.ema(close, ${ind.p.period});`)
    else if (ind.type === "rsi") lines.push(`    series["${ind.id}"] = BotForgeStrategy.rsi(close, ${ind.p.period});`)
    else lines.push(`    series["${ind.id}"] = BotForgeStrategy.sma(close, ${ind.p.period});`)
  }
  lines.push("    const longSig = Array(n).fill(false), shortSig = Array(n).fill(false);")
  lines.push("    for (let i = 1; i < n; i++) {")
  lines.push(`      if (${ruleExpr(spec, "long", emit)}) longSig[i] = true;`)
  lines.push(`      if (${ruleExpr(spec, "short", emit)}) shortSig[i] = true;`)
  lines.push("    }")
  lines.push("    return { long: longSig, short: shortSig };")
  lines.push("  }")
  lines.push("}")
  return lines.join("\n")
}
