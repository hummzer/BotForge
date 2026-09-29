"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts"
import { getBacktestResult, readBacktestResults, type BacktestResult } from "@/lib/botforge"

function ReportInner() {
  const params = useSearchParams()
  const id = params.get("id")
  const [result, setResult] = useState<BacktestResult | null>(null)

  useEffect(() => {
    if (id) setResult(getBacktestResult(id))
    else {
      const all = readBacktestResults()
      setResult(all[0] || null)
    }
  }, [id])

  if (!result) {
    return (
      <div className="bf-page">
        <div className="bf-container text-center">
          <p className="bf-kicker">Report</p>
          <h1 className="bf-title">No test result yet</h1>
          <p className="bf-sub mx-auto">Run a backtest, forward test, or optimize — the report opens with your real numbers.</p>
          <Link href="/backtest">
            <Button className="bf-btn-primary mt-6">Open strategy tester</Button>
          </Link>
        </div>
      </div>
    )
  }

  const pnlBins = (() => {
    const bins: Record<string, number> = {}
    for (const t of result.tradeList) {
      const pct = (t.pnl / result.startingBalance) * 100
      const key = pct < -1 ? "&lt;-1%" : pct < 0 ? "-1–0%" : pct < 1 ? "0–1%" : pct < 2 ? "1–2%" : ">2%"
      bins[key] = (bins[key] || 0) + 1
    }
    return Object.entries(bins).map(([bin, n]) => ({
      bin,
      n,
      fill: bin.startsWith("-") || bin.startsWith("&") ? "#f87171" : "#1db954",
    }))
  })()

  return (
    <div className="bf-page">
      <div className="bf-container bf-section-gap">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="bf-kicker">Strategy report</p>
            <h1 className="bf-title">
              {result.symbol || "Strategy"} · {result.interval || "—"}
            </h1>
            <p className="bf-sub">{result.strategy} · {result.mode} · {new Date(result.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/backtest">
              <Button variant="outline" className="border-spotify-grey">
                New test
              </Button>
            </Link>
            <Link href="/strategies">
              <Button className="bf-btn-primary">Strategies</Button>
            </Link>
          </div>
        </div>

        <div className="bf-grid-stats">
          <div className="bf-stat">
            <p className="bf-stat-label">Net P&L</p>
            <p className={`bf-stat-value ${result.netPnl >= 0 ? "text-spotify-green" : "text-red-400"}`}>
              {result.netPnl.toFixed(2)}
            </p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Max DD</p>
            <p className="bf-stat-value text-red-400">{result.maxDrawdown.toFixed(2)}</p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Trades</p>
            <p className="bf-stat-value">{result.trades}</p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Win rate</p>
            <p className="bf-stat-value text-spotify-green">{result.winRate.toFixed(1)}%</p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Profit factor</p>
            <p className="bf-stat-value">
              {Number.isFinite(result.profitFactor) ? result.profitFactor.toFixed(2) : "∞"}
            </p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Sharpe</p>
            <p className="bf-stat-value">{result.sharpe.toFixed(2)}</p>
          </div>
        </div>

        <div className="bf-card-pad">
          <p className="bf-stat-label mb-2">Equity curve</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={result.equity}>
                <defs>
                  <linearGradient id="eqg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1db954" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#1db954" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#282828" strokeDasharray="3 3" />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#a0a0a0" fontSize={11} />
                <Tooltip contentStyle={{ background: "#121212", border: "1px solid #282828" }} />
                <Area type="monotone" dataKey="equity" stroke="#1db954" fill="url(#eqg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="bf-card-pad">
            <p className="bf-stat-label mb-3">Returns</p>
            <table className="w-full text-sm">
              <tbody className="text-spotify-text-primary">
                <tr>
                  <td className="py-1 text-spotify-text-secondary">Start balance</td>
                  <td className="text-right">{result.startingBalance.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-1 text-spotify-text-secondary">End balance</td>
                  <td className="text-right">{result.endingBalance.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-1 text-spotify-text-secondary">Wins / Losses</td>
                  <td className="text-right">
                    {result.wins} / {result.losses}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 text-spotify-text-secondary">Risk / trade</td>
                  <td className="text-right">{result.riskPercent}%</td>
                </tr>
                <tr>
                  <td className="py-1 text-spotify-text-secondary">Stop / Take</td>
                  <td className="text-right">
                    {result.stopPct}% / {result.takePct}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bf-card-pad">
            <p className="bf-stat-label mb-2">P&L distribution</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pnlBins}>
                  <CartesianGrid stroke="#282828" strokeDasharray="3 3" />
                  <XAxis dataKey="bin" stroke="#a0a0a0" fontSize={11} />
                  <YAxis stroke="#a0a0a0" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#121212", border: "1px solid #282828" }} />
                  <Bar dataKey="n">
                    {pnlBins.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bf-card-pad overflow-x-auto">
          <p className="bf-stat-label mb-3">Trade list</p>
          {result.tradeList.length === 0 ? (
            <p className="text-sm text-spotify-text-secondary">No closed trades in this run.</p>
          ) : (
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="text-spotify-text-secondary">
                <tr>
                  <th className="pb-2">#</th>
                  <th>Side</th>
                  <th>Entry</th>
                  <th>Exit</th>
                  <th>P&L</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {result.tradeList.slice(0, 100).map((t) => (
                  <tr key={t.i} className="border-t border-spotify-grey/60">
                    <td className="py-2">{t.i}</td>
                    <td className={t.side === "LONG" ? "text-spotify-green" : "text-red-400"}>{t.side}</td>
                    <td>{t.entry.toFixed(4)}</td>
                    <td>{t.exit.toFixed(4)}</td>
                    <td className={t.pnl >= 0 ? "text-spotify-green" : "text-red-400"}>{t.pnl.toFixed(2)}</td>
                    <td className="text-spotify-text-secondary">{new Date(t.time).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BacktestReportPage() {
  return (
    <Suspense
      fallback={
        <div className="bf-page flex items-center justify-center">
          <div className="loading-spinner" />
        </div>
      }
    >
      <ReportInner />
    </Suspense>
  )
}
