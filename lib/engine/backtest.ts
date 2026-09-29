import type { Rule, StrategySpec } from "./spec"
import { bosPullback, computeIndicators, sweeps, swings, type Candle } from "./indicators"

export type Trade = {
  side: 1 | -1
  entry: number
  exit: number
  entryI: number
  exitI: number
  lots: number
  pnl: number
  r: number
  reason: string
}

export type BacktestConfig = {
  balance: number
  pipSize: number
  contractSize: number
  minLot: number
  lotStep: number
  spreadPips: number
  commissionPerLot: number
}

const DEFAULT_CFG: BacktestConfig = {
  balance: 10000,
  pipSize: 0.01,
  contractSize: 100,
  minLot: 0.01,
  lotStep: 0.01,
  spreadPips: 2,
  commissionPerLot: 0,
}

function floorLot(lots: number, step: number, min: number) {
  const n = Math.floor(lots / step) * step
  return Math.max(min, Math.round(n * 100) / 100)
}

function evalRule(r: Rule, i: number, series: Record<string, (number | null)[]>, c: Candle[], features: Record<string, { long: boolean[]; short: boolean[] }>): boolean {
  if (r.kind === "cmp") {
    const a = typeof r.a === "number" ? r.a : series[r.a]?.[i]
    const b = typeof r.b === "number" ? r.b : series[r.b]?.[i]
    if (a == null || b == null) return false
    if (r.op === ">") return a > b
    if (r.op === "<") return a < b
    if (r.op === ">=") return a >= b
    return a <= b
  }
  if (r.kind === "cross") {
    if (i < 1) return false
    const a1 = typeof r.a === "number" ? r.a : series[r.a]?.[i]
    const a0 = typeof r.a === "number" ? r.a : series[r.a]?.[i - 1]
    const b1 = typeof r.b === "number" ? r.b : series[r.b]?.[i]
    const b0 = typeof r.b === "number" ? r.b : series[r.b]?.[i - 1]
    if (a1 == null || a0 == null || b1 == null || b0 == null) return false
    if (r.dir === "above") return a0 <= b0 && a1 > b1
    return a0 >= b0 && a1 < b1
  }
  const key = r.kind === "bos_pullback" ? `bp:${r.swing}:${r.fibMin}:${r.fibMax}` : `sw:${r.swing}`
  // features keyed by side are applied by the caller
  return false
}

export function runBacktest(spec: StrategySpec, candles: Candle[], cfg: Partial<BacktestConfig> = {}) {
  const conf = { ...DEFAULT_CFG, ...cfg }
  const c = candles
  const series = computeIndicators(spec, c)
  const trades: Trade[] = []
  const equity: { time: number; value: number }[] = []
  const drawdown: { time: number; value: number }[] = []
  let balance = conf.balance
  let peakEq = conf.balance
  let skipped = 0
  type Pos = { side: 1 | -1; entry: number; entryI: number; lots: number; sl: number; tp: number; dist: number; peak: number; beDone: boolean; partialDone: boolean }
  const open: Pos[] = []
  const spread = conf.spreadPips * conf.pipSize

  // Precompute structure features
  const feats: Record<string, { long: boolean[]; short: boolean[] }> = {}
  for (const r of [...spec.entry.long, ...spec.entry.short]) {
    if (r.kind === "bos_pullback") {
      const k = `bp:${r.swing}:${r.fibMin}:${r.fibMax}`
      if (!feats[k]) feats[k] = bosPullback(c, r.swing, r.fibMin, r.fibMax)
    } else if (r.kind === "sweep") {
      const k = `sw:${r.swing}`
      if (!feats[k]) feats[k] = sweeps(c, r.swing)
    }
  }

  const checkSide = (side: "long" | "short", i: number) => {
    const rules = side === "long" ? spec.entry.long : spec.entry.short
    if (!rules.length) return false
    return rules.every(r => {
      if (r.kind === "bos_pullback") {
        const k = `bp:${r.swing}:${r.fibMin}:${r.fibMax}`
        return side === "long" ? feats[k].long[i] : feats[k].short[i]
      }
      if (r.kind === "sweep") {
        const k = `sw:${r.swing}`
        return side === "long" ? feats[k].long[i] : feats[k].short[i]
      }
      return evalRule(r, i, series, c, feats)
    })
  }

  const atrOf = (id: string, i: number) => series[id]?.[i] ?? series[`${id}.value`]?.[i] ?? null

  const close = (p: Pos, i: number, price: number, reason: string, lots?: number) => {
    const l = lots ?? p.lots
    const pnl = (p.side === 1 ? price - p.entry : p.entry - price - spread) * l * conf.contractSize - conf.commissionPerLot * l
    const rMult = p.dist ? ((p.side === 1 ? price - p.entry : p.entry - price) / p.dist) : 0
    trades.push({ side: p.side, entry: p.entry, exit: price, entryI: p.entryI, exitI: i, lots: l, pnl, r: rMult, reason })
    balance += pnl
    if (lots == null || lots >= p.lots) {
      const idx = open.indexOf(p)
      if (idx >= 0) open.splice(idx, 1)
    } else {
      p.lots -= lots
    }
  }

  for (let i = 1; i < c.length; i++) {
    const bar = c[i]
    // 1) manage open
    for (const p of [...open]) {
      const hi = bar.high, lo = bar.low
      if (p.side === 1) {
        if (lo <= p.sl) { close(p, i, p.sl, "sl"); continue }
        if (hi >= p.tp) { close(p, i, p.tp, "tp"); continue }
        p.peak = Math.max(p.peak, hi)
      } else {
        if (hi >= p.sl) { close(p, i, p.sl, "sl"); continue }
        if (lo <= p.tp) { close(p, i, p.tp, "tp"); continue }
        p.peak = Math.min(p.peak, lo)
      }
      const fav = p.side === 1 ? p.peak - p.entry : p.entry - p.peak
      const m = spec.management
      if (m.partial && !p.partialDone && fav >= m.partial.rr * p.dist) {
        const lots = floorLot(Math.max(conf.minLot, p.lots * m.partial.percent / 100), conf.lotStep, conf.minLot)
        p.partialDone = true
        if (lots < p.lots) close(p, i, p.entry + p.side * m.partial.rr * p.dist, "tp", lots)
      }
      if (m.breakevenRR && !p.beDone && fav >= m.breakevenRR * p.dist) {
        const be = p.entry + p.side * spread
        if (p.side === 1 ? be > p.sl : be < p.sl) { p.sl = be; p.beDone = true }
      }
      const t = m.trailing
      if (t && fav >= t.startRR * p.dist) {
        const td = t.mode === "atr" ? (atrOf(t.atr!, i) ?? 0) * t.mult : t.pips * conf.pipSize
        if (td > 0) { const ns = p.side === 1 ? p.peak - td : p.peak + td; if (p.side === 1 ? ns > p.sl : ns < p.sl) p.sl = ns }
      }
    }

    // 2) filters
    if (spec.filters.maxSpreadPips != null && conf.spreadPips > spec.filters.maxSpreadPips) { skipped++; equity.push({ time: bar.time, value: balance }); continue }
    if (open.length >= (spec.filters.maxPositions ?? 1)) {
      // mark to market only
    } else if (spec.direction !== "short" && checkSide("long", i - 1)) {
      // enter long at open of current bar
      const entry = bar.open + spread
      let dist = 0
      const slMode = spec.risk.sl
      if (slMode.mode === "pips") dist = slMode.pips * conf.pipSize
      else if (slMode.mode === "atr") dist = (atrOf(slMode.atr, i - 1) ?? 0) * slMode.mult
      else {
        const { lastSL } = swings(c, slMode.swing)
        const sl = lastSL[i - 1]
        dist = sl != null ? entry - sl + slMode.bufferPips * conf.pipSize : 30 * conf.pipSize
      }
      if (dist > 0) {
        const riskMoney = balance * (spec.risk.riskPercent / 100)
        const lots = floorLot(riskMoney / (dist * conf.contractSize), conf.lotStep, conf.minLot)
        const sl = entry - dist
        const tp = entry + dist * spec.risk.rr
        open.push({ side: 1, entry, entryI: i, lots, sl, tp, dist, peak: entry, beDone: false, partialDone: false })
      }
    } else if (spec.direction !== "long" && checkSide("short", i - 1)) {
      const entry = bar.open
      let dist = 0
      const slMode = spec.risk.sl
      if (slMode.mode === "pips") dist = slMode.pips * conf.pipSize
      else if (slMode.mode === "atr") dist = (atrOf(slMode.atr, i - 1) ?? 0) * slMode.mult
      else {
        const { lastSH } = swings(c, slMode.swing)
        const sh = lastSH[i - 1]
        dist = sh != null ? sh - entry + slMode.bufferPips * conf.pipSize : 30 * conf.pipSize
      }
      if (dist > 0) {
        const riskMoney = balance * (spec.risk.riskPercent / 100)
        const lots = floorLot(riskMoney / (dist * conf.contractSize), conf.lotStep, conf.minLot)
        const sl = entry + dist
        const tp = entry - dist * spec.risk.rr
        open.push({ side: -1, entry, entryI: i, lots, sl, tp, dist, peak: entry, beDone: false, partialDone: false })
      }
    }

    // 3) mark to market
    let unreal = 0
    for (const p of open) unreal += (p.side === 1 ? bar.close - p.entry : p.entry - bar.close - spread) * p.lots * conf.contractSize
    const eq = balance + unreal
    peakEq = Math.max(peakEq, eq)
    equity.push({ time: bar.time, value: eq })
    drawdown.push({ time: bar.time, value: peakEq ? -((peakEq - eq) / peakEq) * 100 : 0 })
  }
  const last = c.length - 1
  for (const p of open) close(p, last, c[last].close, "end")
  if (equity.length) equity[equity.length - 1].value = balance

  const wins = trades.filter(t => t.pnl > 0), losses = trades.filter(t => t.pnl <= 0)
  const gp = wins.reduce((s, t) => s + t.pnl, 0), gl = Math.abs(losses.reduce((s, t) => s + t.pnl, 0))
  const rs = trades.map(t => t.r), mean = rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : 0
  const sd = rs.length > 1 ? Math.sqrt(rs.reduce((a, b) => a + (b - mean) ** 2, 0) / (rs.length - 1)) : 0
  let pk = conf.balance, maxDD = 0, run = conf.balance
  for (const t of trades) { run += t.pnl; pk = Math.max(pk, run); maxDD = Math.max(maxDD, pk - run) }
  const maxDDPct = Math.abs(Math.min(0, ...drawdown.map(d => d.value)))
  return {
    trades, equity, drawdown,
    stats: {
      net: balance - conf.balance, netPct: (balance / conf.balance - 1) * 100, trades: trades.length,
      winRate: trades.length ? wins.length / trades.length * 100 : 0,
      profitFactor: gl ? gp / gl : gp ? Infinity : 0, maxDD, maxDDPct,
      avgWin: wins.length ? gp / wins.length : 0, avgLoss: losses.length ? -gl / losses.length : 0,
      expectancy: trades.length ? (balance - conf.balance) / trades.length : 0,
      sqn: sd ? Math.sqrt(trades.length) * mean / sd : 0, skipped, finalBalance: balance,
    },
  }
}
