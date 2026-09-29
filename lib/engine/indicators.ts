import type { Indicator, StrategySpec } from "./spec"
import { OUTPUTS } from "./spec"

export type Candle = { time: number; open: number; high: number; low: number; close: number; volume: number }
export type Series = (number | null)[]

// NOTE: definitions deliberately follow MetaTrader so generated EAs and the backtester agree:
//  EMA seeded with first value; RSI = Wilder smoothing; ATR = SMA of true range;
//  MACD signal = SMA of macd; Bollinger uses population stddev; Stochastic slowed K then SMA D;
//  Donchian upper/lower use the PREVIOUS N bars (excludes current bar).

export function sma(v: Series, n: number): Series {
  const out: Series = new Array(v.length).fill(null)
  let sum = 0, cnt = 0
  for (let i = 0; i < v.length; i++) {
    const x = v[i]
    if (x === null) { sum = 0; cnt = 0; continue }
    sum += x; cnt++
    if (cnt > n) { sum -= v[i - n] as number; cnt-- }
    if (cnt === n) out[i] = sum / n
  }
  return out
}

export function ema(v: Series, n: number): Series {
  const out: Series = new Array(v.length).fill(null)
  const k = 2 / (n + 1)
  let prev: number | null = null
  for (let i = 0; i < v.length; i++) {
    const x = v[i]
    if (x === null) continue
    prev = prev === null ? x : x * k + prev * (1 - k)
    out[i] = prev
  }
  return out
}

export function rsi(close: number[], n: number): Series {
  const out: Series = new Array(close.length).fill(null)
  if (close.length <= n) return out
  let g = 0, l = 0
  for (let i = 1; i <= n; i++) { const d = close[i] - close[i - 1]; if (d >= 0) g += d; else l -= d }
  g /= n; l /= n
  out[n] = l === 0 ? 100 : 100 - 100 / (1 + g / l)
  for (let i = n + 1; i < close.length; i++) {
    const d = close[i] - close[i - 1]
    g = (g * (n - 1) + (d > 0 ? d : 0)) / n
    l = (l * (n - 1) + (d < 0 ? -d : 0)) / n
    out[i] = l === 0 ? 100 : 100 - 100 / (1 + g / l)
  }
  return out
}

export function atr(c: Candle[], n: number): Series {
  const tr: Series = c.map((x, i) => i === 0 ? null : Math.max(x.high - x.low, Math.abs(x.high - c[i - 1].close), Math.abs(x.low - c[i - 1].close))
  return sma(tr, n)
}

export function macd(close: number[], fast: number, slow: number, signal: number) {
  const f = ema(close, fast), s = ema(close, slow)
  const main: Series = close.map((_, i) => (f[i] !== null && s[i] !== null && i >= slow - 1) ? (f[i] as number) - (s[i] as number) : null)
  const sig = sma(main, signal)
  const hist: Series = main.map((m, i) => m !== null && sig[i] !== null ? m - (sig[i] as number) : null)
  return { main, signal: sig, hist }
}

export function bb(close: number[], n: number, dev: number) {
  const mid = sma(close, n)
  const upper: Series = new Array(close.length).fill(null), lower: Series = new Array(close.length).fill(null)
  for (let i = 0; i < close.length; i++) {
    if (mid[i] === null) continue
    let s = 0
    for (let j = 0; j < n; j++) s += (close[i - j] - (mid[i] as number)) ** 2
    const sd = Math.sqrt(s / n)
    upper[i] = (mid[i] as number) + dev * sd
    lower[i] = (mid[i] as number) - dev * sd
  }
  return { upper, mid, lower }
}

export function stoch(c: Candle[], kPeriod: number, dPeriod: number, smooth: number) {
  const rawK: Series = new Array(c.length).fill(null)
  for (let i = 0; i < c.length; i++) {
    if (i < kPeriod - 1) continue
    let hi = -Infinity, lo = Infinity
    for (let j = 0; j < kPeriod; j++) { hi = Math.max(hi, c[i - j].high); lo = Math.min(lo, c[i - j].low) }
    rawK[i] = hi === lo ? 50 : ((c[i].close - lo) / (hi - lo)) * 100
  }
  const k = sma(rawK, smooth)
  const d = sma(k, dPeriod)
  return { k, d }
}

export function donchian(c: Candle[], n: number) {
  const upper: Series = new Array(c.length).fill(null), lower: Series = new Array(c.length).fill(null)
  for (let i = 0; i < c.length; i++) {
    if (i < n) continue
    let hi = -Infinity, lo = Infinity
    for (let j = 1; j <= n; j++) { hi = Math.max(hi, c[i - j].high); lo = Math.min(lo, c[i - j].low) }
    upper[i] = hi; lower[i] = lo
  }
  return { upper, lower }
}

export function computeIndicators(spec: StrategySpec, c: Candle[]): Record<string, Series> {
  const close = c.map(x => x.close)
  const out: Record<string, Series> = {}
  for (const ind of spec.indicators) {
    const outs = OUTPUTS[ind.type]
    let series: Record<string, Series> = {}
    switch (ind.type) {
      case "sma": series = { value: sma(close, ind.period ?? 20) }; break
      case "ema": series = { value: ema(close, ind.period ?? 20) }; break
      case "rsi": series = { value: rsi(close, ind.period ?? 14) }; break
      case "atr": series = { value: atr(c, ind.period ?? 14) }; break
      case "macd": {
        const m = macd(close, ind.fast ?? 12, ind.slow ?? 26, ind.signal ?? 9)
        series = { main: m.main, signal: m.signal, hist: m.hist }; break
      }
      case "bb": {
        const b = bb(close, ind.period ?? 20, ind.deviation ?? 2)
        series = { upper: b.upper, mid: b.mid, lower: b.lower }; break
      }
      case "stoch": {
        const s = stoch(c, ind.k ?? 14, ind.d ?? 3, ind.smooth ?? 3)
        series = { k: s.k, d: s.d }; break
      }
      case "donchian": {
        const d = donchian(c, ind.period ?? 20)
        series = { upper: d.upper, lower: d.lower }; break
      }
    }
    for (const o of outs) out[`${ind.id}.${o}`] = series[o] ?? []
    if (outs[0]) out[ind.id] = series[outs[0]] ?? []
  }
  return out
}

/**
 * Swing high/low, BOS/CHoCH trend, fib pullback, and liquidity sweep detectors.
 * BOS long at i: close crosses above lastSH[i-1] with lastSL defined; legLow = lastSL, legHigh = running high since the BOS.
 * bos_pullback long at i: trend=+1 and fibMin <= (legHigh - close[i]) / (legHigh - legLow) <= fibMax and close[i] > open[i].
 * sweep long at i: low[i] < lastSL[i-1] and close[i] > lastSL[i-1].
 */
export function swings(c: Candle[], n: number) {
  const lastSH: Series = new Array(c.length).fill(null), lastSL: Series = new Array(c.length).fill(null)
  let sh: number | null = null, sl: number | null = null
  for (let i = 0; i < c.length; i++) {
    const k = i - n
    if (k >= n) {
      let isH = true, isL = true
      for (let j = 1; j <= n; j++) {
        if (!(c[k].high > c[k - j].high) || !(c[k].high >= c[k + j].high)) isH = false
        if (!(c[k].low < c[k - j].low) || !(c[k].low <= c[k + j].low)) isL = false
      }
      if (isH) sh = c[k].high
      if (isL) sl = c[k].low
    }
    lastSH[i] = sh; lastSL[i] = sl
  }
  return { lastSH, lastSL }
}

export function bosPullback(c: Candle[], n: number, fibMin: number, fibMax: number) {
  const { lastSH, lastSL } = swings(c, n)
  const long: boolean[] = new Array(c.length).fill(false), short: boolean[] = new Array(c.length).fill(false)
  let trend = 0, legHigh = 0, legLow = 0
  for (let i = 1; i < c.length; i++) {
    const h = lastSH[i - 1], l = lastSL[i - 1]
    if (h !== null && c[i].close > h && c[i - 1].close <= h && l !== null) { trend = 1; legLow = l; legHigh = c[i].high }
    else if (l !== null && c[i].close < l && c[i - 1].close >= l && h !== null) { trend = -1; legHigh = h; legLow = c[i].low }
    else if (trend === 1) legHigh = Math.max(legHigh, c[i].high)
    else if (trend === -1) legLow = Math.min(legLow, c[i].low)
    if (trend === 1 && legHigh > legLow) {
      const r = (legHigh - c[i].close) / (legHigh - legLow)
      long[i] = r >= fibMin && r <= fibMax && c[i].close > c[i].open
    } else if (trend === -1 && legHigh > legLow) {
      const r = (c[i].close - legLow) / (legHigh - legLow)
      short[i] = r >= fibMin && r <= fibMax && c[i].close < c[i].open
    }
  }
  return { long, short }
}

export function sweeps(c: Candle[], n: number) {
  const { lastSH, lastSL } = swings(c, n)
  const long: boolean[] = new Array(c.length).fill(false), short: boolean[] = new Array(c.length).fill(false)
  for (let i = 1; i < c.length; i++) {
    const l = lastSL[i - 1], h = lastSH[i - 1]
    if (l !== null && c[i].low < l && c[i].close > l) long[i] = true
    if (h !== null && c[i].high > h && c[i].close < h) short[i] = true
  }
  return { long, short, lastSH, lastSL }
}
