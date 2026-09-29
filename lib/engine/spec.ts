import { z } from "zod"

export const TIMEFRAMES = ["M1", "M5", "M15", "M30", "H1", "H4", "D1"] as const
export type Timeframe = (typeof TIMEFRAMES)[number]
export const TF_MINUTES: Record<Timeframe, number> = { M1: 1, M5: 5, M15: 15, M30: 30, H1: 60, H4: 240, D1: 1440 }

export const INDICATOR_TYPES = ["sma", "ema", "rsi", "macd", "bb", "atr", "stoch", "donchian"] as const
export type IndicatorType = (typeof INDICATOR_TYPES)[number]

/** Named outputs each indicator exposes. `id` alone maps to the first output. */
export const OUTPUTS: Record<IndicatorType, string[]> = {
  sma: ["value"], ema: ["value"], rsi: ["value"], atr: ["value"],
  macd: ["main", "signal", "hist"],
  bb: ["upper", "mid", "lower"],
  stoch: ["k", "d"],
  donchian: ["upper", "lower"],
}

const id = z.string().regex(/^[a-z][a-z0-9_]{0,23}$/, "id must be snake_case, max 24 chars")
const int = (min: number, max: number) => z.number().int().min(min).max(max)

export const IndicatorSchema = z.object({
  id,
  type: z.enum(INDICATOR_TYPES),
  period: int(1, 500).optional(),
  fast: int(1, 200).optional(),
  slow: int(2, 500).optional(),
  signal: int(1, 100).optional(),
  deviation: z.number().min(0.5).max(5).optional(),
  k: int(1, 100).optional(),
  d: int(1, 50).optional(),
  smooth: int(1, 50).optional(),
})
export type Indicator = z.infer<typeof IndicatorSchema>

const operand = z.union([z.string().min(1), z.number()])

export const RuleSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("cmp"), a: operand, op: z.enum([">", "<", ">=", "<="]), b: operand }),
  z.object({ kind: z.literal("cross"), a: operand, dir: z.enum(["above", "below"]), b: operand }),
  /** Trend-following: BOS confirmed trend + fib pullback + confirmation candle. Direction = the side the rule sits in. */
  z.object({ kind: z.literal("bos_pullback"), swing: int(1, 10).default(3), fibMin: z.number().min(0.1).max(0.95).default(0.382), fibMax: z.number().min(0.2).max(1).default(0.618) }),
  /** Liquidity sweep: wick beyond last swing then close back inside. */
  z.object({ kind: z.literal("sweep"), swing: int(1, 10).default(3) }),
])
export type Rule = z.infer<typeof RuleSchema>

export const SpecSchema = z.object({
  name: z.string().min(1).max(60),
  summary: z.string().max(400).default(""),
  timeframe: z.enum(TIMEFRAMES).default("H1"),
  direction: z.enum(["both", "long", "short"]).default("both"),
  indicators: z.array(IndicatorSchema).max(12).default([]),
  entry: z.object({ long: z.array(RuleSchema).max(8).default([]), short: z.array(RuleSchema).max(8).default([]) }),
  risk: z.object({
    riskPercent: z.number().min(0.05).max(10).default(1),
    sl: z.discriminatedUnion("mode", [
      z.object({ mode: z.literal("atr"), atr: id, mult: z.number().min(0.2).max(10).default(1.5) }),
      z.object({ mode: z.literal("pips"), pips: z.number().min(1).max(5000).default(30) }),
      z.object({ mode: z.literal("swing"), swing: int(1, 10).default(3), bufferPips: z.number().min(0).max(200).default(2) }),
    ]),
    rr: z.number().min(0.3).max(10).default(2),
  }),
  management: z.object({
    breakevenRR: z.number().min(0.2).max(5).optional(),
    trailing: z.object({ mode: z.enum(["atr", "pips"]), atr: id.optional(), mult: z.number().min(0.2).max(10).default(2), pips: z.number().min(1).max(2000).default(20), startRR: z.number().min(0).max(10).default(1) }).optional(),
    partial: z.object({ rr: z.number().min(0.2).max(10), percent: z.number().min(5).max(95) }).optional(),
  }).default({}),
  filters: z.object({
    sessionStartHour: int(0, 23).optional(),
    sessionEndHour: int(1, 24).optional(),
    maxSpreadPips: z.number().min(0).max(100).optional(),
    maxPositions: int(1, 10).default(1),
    maxDailyLossPercent: z.number().min(0.1).max(50).optional(),
  }).default({ maxPositions: 1 }),
})
export type StrategySpec = z.infer<typeof SpecSchema>

const PRICES = ["open", "high", "low", "close", "volume"]

/** Every reference a rule can legally use. */
export function validRefs(spec: Pick<StrategySpec, "indicators">): Set<string> {
  const s = new Set(PRICES)
  for (const ind of spec.indicators) {
    const outs = OUTPUTS[ind.type]
    s.add(ind.id)
    for (const o of outs) s.add(`${ind.id}.${o}`)
  }
  return s
}

export function normalizeRef(spec: Pick<StrategySpec, "indicators">, ref: string): string {
  if (PRICES.includes(ref)) return ref
  const ind = spec.indicators.find(i => i.id === ref)
  if (ind) return `${ind.id}.${OUTPUTS[ind.type][0]}`
  return ref
}

export function parseSpec(input: unknown): { ok: true; spec: StrategySpec } | { ok: false; errors: string[] } {
  const r = SpecSchema.safeParse(input)
  if (!r.success) return { ok: false, errors: r.error.issues.map(i => `${i.path.join(".")}: ${i.message}`) }
  const spec = r.data
  const errors: string[] = []
  const ids = new Set<string>()
  for (const ind of spec.indicators) {
    if (ids.has(ind.id)) errors.push(`duplicate indicator id ${ind.id}`)
    ids.add(ind.id)
    if (ind.type === "macd" && (ind.fast ?? 12) >= (ind.slow ?? 26)) errors.push(`${ind.id}: macd fast must be < slow`)
  }
  const refs = validRefs(spec)
  const check = (side: string, rules: Rule[]) => rules.forEach((r, i) => {
    if (r.kind === "cmp" || r.kind === "cross") for (const o of [r.a, r.b]) if (typeof o === "string" && !refs.has(o)) errors.push(`entry.${side}[${i}]: unknown reference "${o}"`)
    if (r.kind === "bos_pullback" && r.fibMin >= r.fibMax) errors.push(`entry.${side}[${i}]: fibMin must be < fibMax`)
  })
  check("long", spec.entry.long); check("short", spec.entry.short)
  if (spec.direction !== "short" && !spec.entry.long.length) errors.push("direction allows longs but entry.long has no rules")
  if (spec.direction !== "long" && !spec.entry.short.length) errors.push("direction allows shorts but entry.short has no rules")
  const atrIds = new Set(spec.indicators.filter(i => i.type === "atr").map(i => i.id))
  if (spec.risk.sl.mode === "atr" && !atrIds.has(spec.risk.sl.atr)) errors.push(`risk.sl.atr "${spec.risk.sl.atr}" is not an atr indicator`)
  const t = spec.management.trailing
  if (t?.mode === "atr" && !(t.atr && atrIds.has(t.atr))) errors.push("management.trailing.atr must reference an atr indicator")
  if (errors.length) return { ok: false, errors }
  // canonicalise references so all generators see indicator.output form
  const canon = (rules: Rule[]): Rule[] => rules.map(r => (r.kind === "cmp" || r.kind === "cross")
    ? { ...r, a: typeof r.a === "string" ? normalizeRef(spec, r.a) : r.a, b: typeof r.b === "string" ? normalizeRef(spec, r.b) : r.b } : r)
  spec.entry.long = canon(spec.entry.long); spec.entry.short = canon(spec.entry.short)
  return { ok: true, spec }
}

/** Plain-English restatement so the user can check what the AI understood. */
export function describeSpec(spec: StrategySpec): string[] {
  const ind = (i: Indicator) => `${i.type.toUpperCase()}(${[i.period, i.fast, i.slow, i.signal, i.k, i.d, i.smooth, i.deviation].filter(v => v !== undefined).join(",")}) as "${i.id}"`
  const rule = (r: Rule, side: "long" | "short") => {
    if (r.kind === "cmp") return `${r.a} ${r.op} ${r.b}`
    if (r.kind === "cross") return `${r.a} crosses ${r.dir} ${r.b}`
    if (r.kind === "bos_pullback") return `${side === "long" ? "bullish" : "bearish"} BOS trend, pullback into ${r.fibMin}–${r.fibMax} fib with confirmation candle (swing ${r.swing})`
    return `${side === "long" ? "sell-side" : "buy-side"} liquidity sweep of swing (${r.swing}) and close back inside`
  }
  const sl = spec.risk.sl
  return [
    `Timeframe ${spec.timeframe}, direction: ${spec.direction}.`,
    spec.indicators.length ? `Indicators: ${spec.indicators.map(ind).join("; ")}.` : "No indicators.",
    spec.entry.long.length ? `LONG when ALL: ${spec.entry.long.map(r => rule(r, "long")).join(" AND ")}.` : "",
    spec.entry.short.length ? `SHORT when ALL: ${spec.entry.short.map(r => rule(r, "short")).join(" AND ")}.` : "",
    `Risk ${spec.risk.riskPercent}% per trade; SL ${sl.mode === "atr" ? `${sl.mult}×ATR(${sl.atr})` : sl.mode === "pips" ? `${sl.pips} pips` : `beyond last swing (${sl.swing}) + ${sl.bufferPips} pips`}; TP at ${spec.risk.rr}R.`,
    spec.management.breakevenRR ? `Move to breakeven at ${spec.management.breakevenRR}R.` : "",
    spec.management.trailing ? `Trailing stop (${spec.management.trailing.mode}) after ${spec.management.trailing.startRR}R.` : "",
    spec.management.partial ? `Close ${spec.management.partial.percent}% at ${spec.management.partial.rr}R.` : "",
    `Max ${spec.filters.maxPositions} open position(s)${spec.filters.maxDailyLossPercent ? `, daily loss stop ${spec.filters.maxDailyLossPercent}%` : ""}${spec.filters.maxSpreadPips ? `, max spread ${spec.filters.maxSpreadPips} pips` : ""}${spec.filters.sessionStartHour !== undefined ? `, session ${spec.filters.sessionStartHour}:00–${spec.filters.sessionEndHour ?? 24}:00 server time` : ""}.`,
  ].filter(Boolean)
}
