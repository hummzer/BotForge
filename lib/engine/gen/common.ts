import type { Rule, StrategySpec } from "../spec"
import { OUTPUTS } from "../spec"

export const LANGS = ["python", "mql4", "mql5", "pine", "javascript", "cpp", "rust", "elixir"] as const
export type Lang = (typeof LANGS)[number]
export const LANG_META: Record<Lang, { label: string; ext: string; file: (base: string) => string }> = {
  python: { label: "Python", ext: "py", file: (b) => `${b}.py` },
  mql4: { label: "MQL4", ext: "mq4", file: (b) => `${b}.mq4` },
  mql5: { label: "MQL5", ext: "mq5", file: (b) => `${b}.mq5` },
  pine: { label: "Pine Script", ext: "pine", file: (b) => `${b}.pine` },
  javascript: { label: "JavaScript", ext: "js", file: (b) => `${b}.js` },
  cpp: { label: "C++", ext: "cpp", file: (b) => `${b}.cpp` },
  rust: { label: "Rust", ext: "rs", file: (b) => `${b}.rs` },
  elixir: { label: "Elixir", ext: "ex", file: (b) => `${b}.ex` },
}

export function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "strategy"
}

export function indent(s: string, n = 2): string {
  const pad = " ".repeat(n)
  return s.split("\n").map(l => (l ? pad + l : l)).join("\n")
}

export function commentBlock(lines: string[], style: "//" | "#" | "/*" = "//"): string {
  if (style === "/*") return `/*\n${lines.map(l => ` * ${l}`).join("\n")}\n */`
  const p = style === "#" ? "# " : "// "
  return lines.map(l => p + l).join("\n")
}

export function ruleDesc(r: Rule): string {
  if (r.kind === "cmp") return `${r.a} ${r.op} ${r.b}`
  if (r.kind === "cross") return `${r.a} crosses ${r.dir} ${r.b}`
  if (r.kind === "bos_pullback") return `BOS + fib pullback [${r.fibMin}-${r.fibMax}] swing=${r.swing}`
  if (r.kind === "sweep") return `liquidity sweep swing=${r.swing}`
  return "rule"
}

export function header(spec: StrategySpec, lang: Lang): string[] {
  return [
    `BotForge generated strategy: ${spec.name}`,
    spec.summary || "(no summary)",
    `Symbol ${spec.symbol} · TF ${spec.timeframe} · risk ${spec.risk.riskPct}% · RR ${spec.risk.rr}`,
    `Language: ${LANG_META[lang].label}`,
    "Do not edit by hand — regenerate from BotForge.",
  ]
}
