export type BotStatus = "Running" | "Paused" | "Stopped" | "Production Ready"

export type Bot = {
  id: string
  name: string
  language: string
  status: BotStatus
  code: string
  description: string
  symbol: string
  timeframe: string
  indicators: string[]
  createdAt: string
  lastRun: string | null
}

const BOTS_KEY = "botforge:bots"

export const defaultBots: Bot[] = []

export function readBots(): Bot[] {
  if (typeof window === "undefined") return defaultBots
  try {
    const raw = window.localStorage.getItem(BOTS_KEY)
    return raw ? JSON.parse(raw) : defaultBots
  } catch {
    return defaultBots
  }
}

export function writeBots(bots: Bot[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(BOTS_KEY, JSON.stringify(bots))
  }
}

export function createBot(input: Omit<Bot, "id" | "createdAt" | "lastRun">): Bot {
  return {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    lastRun: null,
  }
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
  const rs = gains / losses
  return 100 - 100 / (1 + rs)
}

export type BacktestResult = {
  trades: number
  wins: number
  losses: number
  winRate: number
  netPnl: number
  maxDrawdown: number
  profitFactor: number
  equity: { time: number; equity: number }[]
}

export function runSmaRsiBacktest(candles: Candle[], startingBalance = 10000, riskPercent = 1): BacktestResult {
  let equity = startingBalance
  let peak = equity
  let maxDrawdown = 0
  let wins = 0
  let losses = 0
  let grossProfit = 0
  let grossLoss = 0
  const equityCurve: { time: number; equity: number }[] = [{ time: candles[0]?.time ?? Date.now(), equity }]

  for (let i = 50; i < candles.length; i++) {
    const closes = candles.slice(0, i + 1).map(c => c.close)
    const ma50 = sma(closes, 50)
    const currentRsi = rsi(closes, 14)
    const previousRsi = rsi(closes.slice(0, -1), 14)
    if (ma50 === null || currentRsi === null || previousRsi === null) continue

    const candle = candles[i]
    const risk = equity * (riskPercent / 100)
    let pnl = 0

    if (previousRsi <= 30 && currentRsi > 30 && candle.close > ma50) {
      const stop = candle.close * 0.99
      const target = candle.close * 1.02
      const next = candles[i + 1]
      if (!next) break
      pnl = next.low <= stop ? -risk : next.high >= target ? risk * 2 : ((next.close - candle.close) / candle.close) * risk * 100
    } else if (previousRsi >= 70 && currentRsi < 70 && candle.close < ma50) {
      const stop = candle.close * 1.01
      const target = candle.close * 0.98
      const next = candles[i + 1]
      if (!next) break
      pnl = next.high >= stop ? -risk : next.low <= target ? risk * 2 : ((candle.close - next.close) / candle.close) * risk * 100
    }

    if (pnl !== 0) {
      if (pnl > 0) {
        wins++
        grossProfit += pnl
      } else {
        losses++
        grossLoss += Math.abs(pnl)
      }
      equity += pnl
      peak = Math.max(peak, equity)
      maxDrawdown = Math.max(maxDrawdown, peak - equity)
    }
    equityCurve.push({ time: candle.time, equity })
  }

  return {
    trades: wins + losses,
    wins,
    losses,
    winRate: wins + losses ? (wins / (wins + losses)) * 100 : 0,
    netPnl: equity - startingBalance,
    maxDrawdown,
    profitFactor: grossLoss ? grossProfit / grossLoss : grossProfit ? Infinity : 0,
    equity: equityCurve,
  }
}
