import type { StrategySpec } from "../spec"
import { features, header, indCalls, ruleExpr, swingN, type Emit } from "./common"

const emit: Emit = {
  num: n => String(n),
  v: (r, k) => k === 0 ? pyRef(r) : `${pyRef(r)}[i-${k}]`,
  cmp: (op, a, b) => f"({a} {op} {b})",
  cross: (d, a1, a0, b1, b0) => d === "above" ? f"({a0} <= {b0} and {a1} > {b1})" : f"({a0} >= {b0} and {a1} < {b1})",
  feat: (k, s) => f"feats['{k}']['{s}'][i]",
  and: p => p.length ? p.join(" and ") : "False",
}
function pyRef(r: string): string {
  if (["open", "high", "low", "close", "volume"].includes(r)) return `${r}[i]`
  return "series['" + r + "'][i]"
}

export function genPython(spec: StrategySpec): string {
  const inds = indCalls(spec)
  const feats = features(spec)
  const lines: string[] = []
  lines.push(header(spec, "python", "#"))
  lines.push("from __future__ import annotations")
  lines.push("from typing import List, Dict, Optional")
  lines.push("import math")
  lines.push("")
  lines.push("NAN = float('nan')")
  lines.push("")
  lines.push("def sma(v, n):\n    out = [NAN]*len(v)\n    for i in range(len(v)):\n        if i+1 >= n and all(x==x for x in v[i-n+1:i+1]): out[i] = sum(v[i-n+1:i+1])/n\n    return out")
  lines.push("def ema(v, n):\n    out = [NAN]*len(v); k=2/(n+1); prev=None\n    for i,x in enumerate(v):\n        if x!=x: continue\n        prev = x if prev is None else x*k+prev*(1-k); out[i]=prev\n    return out")
  lines.push("def rsi(c, n):\n    out=[NAN]*len(c)\n    if len(c)<=n: return out\n    g=l=0.0\n    for i in range(1,n+1):\n        d=c[i]-c[i-1]; g+=max(d,0); l+=max(-d,0)\n    g/=n; l/=n; out[n]=100.0 if l==0 else 100-100/(1+g/l)\n    for i in range(n+1,len(c)):\n        d=c[i]-c[i-1]; g=(g*(n-1)+max(d,0))/n; l=(l*(n-1)+max(-d,0))/n\n        out[i]=100.0 if l==0 else 100-100/(1+g/l)\n    return out")
  lines.push("def atr(h,l,c,n):\n    tr=[NAN]+[max(h[i]-l[i], abs(h[i]-c[i-1]), abs(l[i]-c[i-1])) for i in range(1,len(c))]\n    return sma(tr,n)")
  lines.push("")
  lines.push("class BotForgeStrategy:")
  lines.push(`    NAME = ${JSON.stringify(spec.name)}`)
  lines.push(`    RISK_PCT = ${spec.risk.riskPercent}`)
  lines.push(`    RR = ${spec.risk.rr}`)
  lines.push("")
  lines.push("    def signals(self, o, h, l, c, v):")
  lines.push("        n = len(c)")
  lines.push("        series = {}")
  for (const ind of inds) {
    if (ind.type === "sma") lines.push(`        series['${ind.id}'] = sma(c, ${ind.p.period})`)
    else if (ind.type === "ema") lines.push(`        series['${ind.id}'] = ema(c, ${ind.p.period})`)
    else if (ind.type === "rsi") lines.push(`        series['${ind.id}'] = rsi(c, ${ind.p.period})`)
    else if (ind.type === "atr") lines.push(`        series['${ind.id}'] = atr(h, l, c, ${ind.p.period})`)
    else lines.push(`        series['${ind.id}'] = sma(c, ${ind.p.period})  # fallback`)
  }
  lines.push("        long_sig = [False]*n; short_sig = [False]*n")
  lines.push("        for i in range(1, n):")
  lines.push(`            if ${ruleExpr(spec, "long", emit)}: long_sig[i] = True`)
  lines.push(`            if ${ruleExpr(spec, "short", emit)}: short_sig[i] = True`)
  lines.push("        return long_sig, short_sig")
  lines.push("")
  lines.push("# Usage: BotForgeStrategy().signals(opens, highs, lows, closes, volumes)")
  return lines.join("\n")
}
