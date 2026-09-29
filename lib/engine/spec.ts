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
  symbol: z.string().min(1).max(20).default("XAUUSD"),
  indicators: z.array(IndicatorSchema).max(12).default([]),
  long: z.array(RuleSchema).max(12).default([]),
  short: z.array(RuleSchema).max(12).default([]),
  risk: z.object({
    riskPct: z.number().min(0.1).max(10).default(1),
    rr: z.number().min(0.5).max(10).default(2),
    atrMult: z.number().min(0.5).max(10).default(1.5).optional(),
    maxDailyLossPct: z.number().min(0.5).max(50).default(3).optional(),
    maxOpen: int(1, 20).default(1).optional(),
  }).default({ riskPct: 1, rr: 2 }),
  filters: z.object({
    sessions: z.array(z.enum(["london", "ny", "asia", "overlap"])).default([]).optional(),
    maxSpread: z.number().min(0).optional(),
    newsBlackout: z.boolean().default(false).optional(),
  }).default({}).optional(),
  manage: z.object({
    trailing: z.object({
      mode: z.enum(["pips", "atr"]),
      startRR: z.number().min(0.1).max(5).default(1),
      pips: z.number().min(1).optional(),
      atr: z.string().optional(),
      mult: z.number().min(0.5).max(5).default(1).optional(),
    }).optional(),
    breakevenRR: z.number().min(0.5).max(5).optional(),
    partial: z.object({ rr: z.number().min(0.5).max(5), percent: z.number().min(10).max(90) }).optional(),
  }).default({}).optional(),
})
export type StrategySpec = z.infer<typeof SpecSchema>

export function parseSpec(raw: unknown): StrategySpec {
  return SpecSchema.parse(raw)
}

export function validateSpec(raw: unknown): { ok: true; spec: StrategySpec } | { ok: false; errors: string[] } {
  const r = SpecSchema.safeParse(raw)
  if (r.success) return { ok: true, spec: r.data }
  return { ok: false, errors: r.error.issues.map(i => `${i.path.join(".")}: ${i.message}`) }
}
