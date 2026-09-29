/**
 * BotForge workspace snapshot — export / import all local data as one JSON file.
 */

import { readBots, writeBots, readBacktestResults, type Bot, type BacktestResult } from "./botforge"

const JOURNAL_KEY = "botforge:journal"
const BROKER_KEY = "botforge_broker"
const TV_KEY = "botforge:tradingview"
const AUTH_KEY = "botforge_auth_user"
const RESULTS_KEY = "botforge:backtest_results"
const BOTS_KEY = "botforge:bots"

export type WorkspaceSnapshot = {
  version: 1
  exportedAt: string
  bots: Bot[]
  backtests: BacktestResult[]
  journal: unknown[]
  broker: unknown | null
  tradingViewUsername: string
}

export function buildWorkspaceSnapshot(): WorkspaceSnapshot {
  if (typeof window === "undefined") {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      bots: [],
      backtests: [],
      journal: [],
      broker: null,
      tradingViewUsername: "",
    }
  }
  let journal: unknown[] = []
  let broker: unknown | null = null
  try {
    journal = JSON.parse(localStorage.getItem(JOURNAL_KEY) || "[]")
  } catch {}
  try {
    const raw = localStorage.getItem(BROKER_KEY)
    broker = raw ? JSON.parse(raw) : null
  } catch {}
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    bots: readBots(),
    backtests: readBacktestResults(),
    journal,
    broker,
    tradingViewUsername: localStorage.getItem(TV_KEY) || "",
  }
}

export function downloadWorkspace() {
  const snap = buildWorkspaceSnapshot()
  const blob = new Blob([JSON.stringify(snap, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `botforge-workspace-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importWorkspace(json: string): { ok: boolean; error?: string } {
  try {
    const data = JSON.parse(json) as WorkspaceSnapshot
    if (!data || data.version !== 1) return { ok: false, error: "Unsupported file version" }
    if (Array.isArray(data.bots)) writeBots(data.bots)
    if (Array.isArray(data.backtests)) {
      localStorage.setItem(RESULTS_KEY, JSON.stringify(data.backtests))
    }
    if (Array.isArray(data.journal)) {
      localStorage.setItem(JOURNAL_KEY, JSON.stringify(data.journal))
    }
    if (data.broker) localStorage.setItem(BROKER_KEY, JSON.stringify(data.broker))
    if (typeof data.tradingViewUsername === "string") {
      localStorage.setItem(TV_KEY, data.tradingViewUsername)
    }
    window.dispatchEvent(new Event("botforge-workspace-updated"))
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid JSON" }
  }
}

export function clearWorkspaceData() {
  if (typeof window === "undefined") return
  localStorage.removeItem(BOTS_KEY)
  localStorage.removeItem(RESULTS_KEY)
  localStorage.removeItem(JOURNAL_KEY)
  localStorage.removeItem(BROKER_KEY)
  localStorage.removeItem(TV_KEY)
  // keep auth
  window.dispatchEvent(new Event("botforge-workspace-updated"))
}

export function workspaceStats() {
  const bots = typeof window !== "undefined" ? readBots() : []
  const tests = typeof window !== "undefined" ? readBacktestResults() : []
  let journalCount = 0
  try {
    journalCount = JSON.parse(localStorage.getItem(JOURNAL_KEY) || "[]").length
  } catch {}
  return {
    bots: bots.length,
    running: bots.filter((b) => b.status === "Running").length,
    tests: tests.length,
    journal: journalCount,
  }
}

export { AUTH_KEY }
