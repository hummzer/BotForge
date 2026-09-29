export type BotStatus = "Running" | "Paused" | "Stopped" | "Deploying" | "Error" | "Ready"

export type Bot = {
  id: string
  name: string
  language: string
  /** Active run language (may differ from which codes exist). */
  runLanguage: string
  status: BotStatus
  code: string
  /** All generated sources keyed by display language name. */
  codes: Record<string, string>
  description: string
  symbol: string
  timeframe: string
  indicators: string[]
  createdAt: string
  lastRun: string | null
  vpsUrl?: string
  notes?: string
  aiProvider?: string
  prompt?: string
}

const BOTS_KEY = "botforge:bots"
const RESULTS_KEY = "botforge:backtest_results"
const TV_KEY = "botforge:tradingview"

export const defaultBots: Bot[] = []

function normalizeBot(raw: Partial<Bot> & { id: string }): Bot {
  const codes = raw.codes && Object.keys(raw.codes).length ? raw.codes : raw.code ? { [raw.language || "Python"]: raw.code } : {}
  const language = raw.language || Object.keys(codes)[0] || "Python"
  const code = raw.code || codes[language] || Object.values(codes)[0] || ""
  return {
    id: raw.id,
    name: raw.name || "Untitled",
    language,
    runLanguage: raw.runLanguage || language,
    status: raw.status || "Ready",
    code,
    codes,
    description: raw.description || "",
    symbol: raw.symbol || "EURUSD",
    timeframe: raw.timeframe || "H1",
    indicators: raw.indicators || [],
    createdAt: raw.createdAt || new Date().toISOString(),
    lastRun: raw.lastRun ?? null,
    vpsUrl: raw.vpsUrl,
    notes: raw.notes,
    aiProvider: raw.aiProvider,
    prompt: raw.prompt,
  }
}

export function readBots(): Bot[] {
  if (typeof window === "undefined") return defaultBots
  try {
    const raw = window.localStorage.getItem(BOTS_KEY)
    const list = raw ? JSON.parse(raw) : defaultBots
    return Array.isArray(list) ? list.map(normalizeBot) : defaultBots
  } catch {
    return defaultBots
  }
}

export function writeBots(bots: Bot[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(BOTS_KEY, JSON.stringify(bots))
    window.dispatchEvent(new Event("botforge-workspace-updated"))
  }
}

export function createBot(
  input: Omit<Bot, "id" | "createdAt" | "lastRun"> & Partial<Pick<Bot, "codes" | "runLanguage">>,
): Bot {
  const codes = input.codes || (input.code ? { [input.language]: input.code } : {})
  return normalizeBot({
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    lastRun: null,
    codes,
    runLanguage: input.runLanguage || input.language,
  })
}

export function addBot(bot: Bot) {
  writeBots([bot, ...readBots()])
  return bot
}

export type Candle = {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export async function fetchBinanceCandles(symbol = "BTCUSDT", interval = "1h", limit = 500): Promise<Candle[]> {
  const qs = `symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${limit}`
  try {
    const response = await fetch(`/api/market/candles?${qs}`, { cache: "no-store" })
    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data.candles) && data.candles.length) return data.candles as Candle[]
    }
  } catch {
    /* fall through */
  }
  const response = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${limit}`,
    { cache: "no-store" },
  )
  if (!response.ok) throw new Error(`Market data request failed: HTTP ${response.status}`)
  const rows = await response.json()
  return rows.map((r: (string | number)[]) => ({
    time: Number(r[0]),
    open: Number(r[1]),
    high: Number(r[2]),
    low: Number(r[3]),
    close: Number(r[4]),
    volume: Number(r[5]),
  }))
}

function sma(values: number[], period: number) {
  if (values.length < period) return null
  return values.slice(-period).reduce((a, b) => a + b, 0) / period
}

function ema(values: number[], period: number) {
  if (values.length < period) return null
  const k = 2 / (period + 1)
  let e = values.slice(0, period).reduce((a, b) => a + b, 0) / period
  for (let i = period; i < values.length; i++) e = values[i] * k + e * (1 - k)
  return e
}

function rsi(values: number[], period = 14) {
  if (values.length <= period) return null
  let gains = 0
  let losses = 0
  for (let i = values.length - period; i < values.length; i++) {
    const change = values[i] - values[i - 1]
    if (change >= 0) gains += change
    else losses -= change
  }
  if (losses === 0) return 100
  return 100 - 100 / (1 + gains / losses)
}

export type BacktestTrade = {
  i: number
  side: "LONG" | "SHORT"
  entry: number
  exit: number
  pnl: number
  time: number
}

export type BacktestResult = {
  id: string
  mode: "backtest" | "forward" | "optimize"
  symbol: string
  interval: string
  strategy: string
  trades: number
  wins: number
  losses: number
  winRate: number
  netPnl: number
  maxDrawdown: number
  profitFactor: number
  sharpe: number
  startingBalance: number
  endingBalance: number
  riskPercent: number
  smaPeriod: number
  rsiPeriod: number
  rsiBuy: number
  rsiSell: number
  stopPct: number
  takePct: number
  equity: { time: number; equity: number }[]
  tradeList: BacktestTrade[]
  optimized?: { smaPeriod: number; rsiBuy: number; rsiSell: number; netPnl: number }
  createdAt: string
}

export type BacktestParams = {
  startingBalance?: number
  riskPercent?: number
  smaPeriod?: number
  rsiPeriod?: number
  rsiBuy?: number
  rsiSell?: number
  stopPct?: number
  takePct?: number
  mode?: "backtest" | "forward"
  forwardBars?: number
}

export function runSmaRsiBacktest(candles: Candle[], params: BacktestParams = {}): BacktestResult {
  const startingBalance = params.startingBalance ?? 10000
  const riskPercent = params.riskPercent ?? 1
  const smaPeriod = params.smaPeriod ?? 50
  const rsiPeriod = params.rsiPeriod ?? 14
  const rsiBuy = params.rsiBuy ?? 30
  const rsiSell = params.rsiSell ?? 70
  const stopPct = params.stopPct ?? 1
  const takePct = params.takePct ?? 2
  const mode = params.mode ?? "backtest"
  const forwardBars = params.forwardBars ?? Math.floor(candles.length * 0.2)
  const startIdx =
    mode === "forward" ? Math.max(smaPeriod + rsiPeriod, candles.length - forwardBars) : smaPeriod + 1

  let equity = startingBalance
  let peak = equity
  let maxDrawdown = 0
  let wins = 0
  let losses = 0
  let grossProfit = 0
  let grossLoss = 0
  const equityCurve: { time: number; equity: number }[] = [{ time: candles[0]?.time ?? Date.now(), equity }]
  const tradeList: BacktestTrade[] = []
  const returns: number[] = []

  for (let i = startIdx; i < candles.length - 1; i++) {
    const closes = candles.slice(0, i + 1).map((c) => c.close)
    const ma = sma(closes, smaPeriod)
    const currentRsi = rsi(closes, rsiPeriod)
    const previousRsi = rsi(closes.slice(0, -1), rsiPeriod)
    if (ma === null || currentRsi === null || previousRsi === null) continue

    const candle = candles[i]
    const next = candles[i + 1]
    const risk = equity * (riskPercent / 100)
    let pnl = 0
    let side: "LONG" | "SHORT" | null = null

    if (previousRsi <= rsiBuy && currentRsi > rsiBuy && candle.close > ma) {
      side = "LONG"
      const stop = candle.close * (1 - stopPct / 100)
      const target = candle.close * (1 + takePct / 100)
      if (next.low <= stop) pnl = -risk
      else if (next.high >= target) pnl = risk * (takePct / stopPct)
      else pnl = ((next.close - candle.close) / candle.close) * risk * 100
    } else if (previousRsi >= rsiSell && currentRsi < rsiSell && candle.close < ma) {
      side = "SHORT"
      const stop = candle.close * (1 + stopPct / 100)
      const target = candle.close * (1 - takePct / 100)
      if (next.high >= stop) pnl = -risk
      else if (next.low <= target) pnl = risk * (takePct / stopPct)
      else pnl = ((candle.close - next.close) / candle.close) * risk * 100
    }

    if (side && pnl !== 0) {
      if (pnl > 0) {
        wins++
        grossProfit += pnl
      } else {
        losses++
        grossLoss += Math.abs(pnl)
      }
      equity += pnl
      returns.push(pnl / startingBalance)
      peak = Math.max(peak, equity)
      maxDrawdown = Math.max(maxDrawdown, peak - equity)
      tradeList.push({
        i: tradeList.length + 1,
        side,
        entry: candle.close,
        exit: next.close,
        pnl,
        time: candle.time,
      })
    }
    equityCurve.push({ time: candle.time, equity })
  }

  const mean = returns.length ? returns.reduce((a, b) => a + b, 0) / returns.length : 0
  const variance =
    returns.length > 1 ? returns.reduce((s, r) => s + (r - mean) ** 2, 0) / (returns.length - 1) : 0
  const sharpe = variance > 0 ? (mean / Math.sqrt(variance)) * Math.sqrt(252) : 0

  return {
    id: crypto.randomUUID(),
    mode,
    symbol: "",
    interval: "",
    strategy: `SMA(${smaPeriod})+RSI(${rsiPeriod}) ${rsiBuy}/${rsiSell}`,
    trades: wins + losses,
    wins,
    losses,
    winRate: wins + losses ? (wins / (wins + losses)) * 100 : 0,
    netPnl: equity - startingBalance,
    maxDrawdown,
    profitFactor: grossLoss ? grossProfit / grossLoss : grossProfit ? Infinity : 0,
    sharpe,
    startingBalance,
    endingBalance: equity,
    riskPercent,
    smaPeriod,
    rsiPeriod,
    rsiBuy,
    rsiSell,
    stopPct,
    takePct,
    equity: equityCurve,
    tradeList,
    createdAt: new Date().toISOString(),
  }
}

export function optimizeSmaRsi(
  candles: Candle[],
  base: BacktestParams = {},
): { best: BacktestResult; trials: { smaPeriod: number; rsiBuy: number; rsiSell: number; netPnl: number }[] } {
  const trials: { smaPeriod: number; rsiBuy: number; rsiSell: number; netPnl: number }[] = []
  let best: BacktestResult | null = null
  for (const smaPeriod of [20, 50, 100]) {
    for (const rsiBuy of [25, 30, 35]) {
      for (const rsiSell of [65, 70, 75]) {
        const r = runSmaRsiBacktest(candles, { ...base, smaPeriod, rsiBuy, rsiSell, mode: "backtest" })
        trials.push({ smaPeriod, rsiBuy, rsiSell, netPnl: r.netPnl })
        if (!best || r.netPnl > best.netPnl) best = r
      }
    }
  }
  if (!best) best = runSmaRsiBacktest(candles, base)
  best.mode = "optimize"
  best.optimized = {
    smaPeriod: best.smaPeriod,
    rsiBuy: best.rsiBuy,
    rsiSell: best.rsiSell,
    netPnl: best.netPnl,
  }
  return { best, trials }
}

export function saveBacktestResult(result: BacktestResult) {
  if (typeof window === "undefined") return
  const prev = readBacktestResults()
  window.localStorage.setItem(RESULTS_KEY, JSON.stringify([result, ...prev].slice(0, 40)))
  window.dispatchEvent(new Event("botforge-workspace-updated"))
}

export function readBacktestResults(): BacktestResult[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(window.localStorage.getItem(RESULTS_KEY) || "[]")
  } catch {
    return []
  }
}

export function getBacktestResult(id: string): BacktestResult | null {
  return readBacktestResults().find((r) => r.id === id) || null
}

export function readTradingViewUsername(): string {
  if (typeof window === "undefined") return ""
  return window.localStorage.getItem(TV_KEY) || ""
}

export function writeTradingViewUsername(name: string) {
  if (typeof window !== "undefined") window.localStorage.setItem(TV_KEY, name)
}

export { ema }
