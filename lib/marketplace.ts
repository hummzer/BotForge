import type { BacktestResult, Bot } from "./botforge"

export type MarketplaceListing = {
  id: string
  botId: string
  name: string
  description: string
  symbol: string
  language: string
  author: string
  metrics: {
    winRate: number
    profitFactor: number
    sharpe: number
    maxDrawdown: number
    trades: number
    netPnl: number
  }
  listedAt: string
  priceUsd: number
}

const KEY = "botforge:marketplace"

/** Premium marketplace gate — bot auto-lists when backtest metrics clear thresholds. */
export function passesMarketplaceMetrics(r: BacktestResult): boolean {
  return (
    r.trades >= 20 &&
    r.winRate >= 52 &&
    r.profitFactor >= 1.25 &&
    Number.isFinite(r.profitFactor) &&
    r.sharpe >= 0.6 &&
    r.maxDrawdown <= r.startingBalance * 0.25 &&
    r.netPnl > 0
  )
}

export function readMarketplace(): MarketplaceListing[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]")
  } catch {
    return []
  }
}

export function writeMarketplace(list: MarketplaceListing[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(list))
  window.dispatchEvent(new Event("botforge-workspace-updated"))
}

export function tryListBot(bot: Bot, result: BacktestResult, author: string): MarketplaceListing | null {
  if (!passesMarketplaceMetrics(result)) return null
  const list = readMarketplace()
  if (list.some((x) => x.botId === bot.id)) return list.find((x) => x.botId === bot.id) || null
  const listing: MarketplaceListing = {
    id: crypto.randomUUID(),
    botId: bot.id,
    name: bot.name,
    description: bot.description,
    symbol: bot.symbol,
    language: bot.runLanguage || bot.language,
    author,
    metrics: {
      winRate: result.winRate,
      profitFactor: result.profitFactor,
      sharpe: result.sharpe,
      maxDrawdown: result.maxDrawdown,
      trades: result.trades,
      netPnl: result.netPnl,
    },
    listedAt: new Date().toISOString(),
    priceUsd: 29,
  }
  writeMarketplace([listing, ...list])
  return listing
}
