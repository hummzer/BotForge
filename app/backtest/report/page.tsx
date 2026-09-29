"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
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
  PieChart,
  Pie,
} from "recharts"

const equity = [
  { t: "Jun 2021", equity: 0, dd: 0 },
  { t: "May 2022", equity: 800, dd: -2 },
  { t: "Mar 2023", equity: 2100, dd: -3 },
  { t: "Feb 2024", equity: 4800, dd: -4 },
  { t: "Dec 2024", equity: 9200, dd: -5 },
  { t: "Nov 2025", equity: 14500, dd: -6 },
  { t: "Sep 2026", equity: 19978.73, dd: -6.48 },
]

const pnlDist = [
  { bin: "-3%", n: 4, fill: "#ef4444" },
  { bin: "-1.3%", n: 64, fill: "#ef4444" },
  { bin: "-0.5%", n: 646, fill: "#ef4444" },
  { bin: "+0.7%", n: 452, fill: "#34d399" },
  { bin: "+2%", n: 143, fill: "#34d399" },
  { bin: "+2.8%", n: 59, fill: "#34d399" },
  { bin: "+4%", n: 30, fill: "#34d399" },
  { bin: "+6%", n: 7, fill: "#34d399" },
]

const trades = [
  { n: 1, side: "SHORT", entry: "Jul 5, 03:00", entryPx: 300.75, exit: "Jul 5, 05:00", exitPx: 302.3, qty: 1.32, bars: 2, net: -2.44, pct: -0.62 },
  { n: 2, side: "SHORT", entry: "Jul 5, 03:00", entryPx: 300.75, exit: "Jul 5, 05:00", exitPx: 297.48, qty: 31.91, bars: 2, net: 94.76, pct: 0.99 },
  { n: 3, side: "LONG", entry: "Jul 6, 07:00", entryPx: 318.75, exit: "Jul 6, 09:00", exitPx: 321.41, qty: 31.64, bars: 2, net: 73.98, pct: 0.73 },
  { n: 4, side: "LONG", entry: "Jul 8, 17:00", entryPx: 315.65, exit: "Jul 9, 19:00", exitPx: 317.21, qty: 32.19, bars: 2, net: 40.03, pct: 0.39 },
  { n: 5, side: "LONG", entry: "Jul 14, 15:00", entryPx: 310.2, exit: "Jul 14, 17:00", exitPx: 312.85, qty: 32.88, bars: 2, net: 76.95, pct: 0.75 },
]

function Stat({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-[#0d1218] p-4">
      <p className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p
        className={
          tone === "up"
            ? "mt-1 text-xl font-semibold text-emerald-400"
            : tone === "down"
              ? "mt-1 text-xl font-semibold text-red-400"
              : "mt-1 text-xl font-semibold text-zinc-100"
        }
      >
        {value}
      </p>
    </div>
  )
}

export default function BacktestReportPage() {
  return (
    <div className="min-h-screen bg-[#070a0e] py-8 text-zinc-100">
      <div className="container mx-auto max-w-7xl px-4 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-xs font-bold">
                BF
              </span>
              <h1 className="text-2xl font-bold">BNBUSDT.P</h1>
              <Badge className="bg-zinc-800 text-zinc-300">120</Badge>
            </div>
            <p className="mt-1 text-sm text-zinc-500">Jun 29, 2021 — Sep 28, 2026 · 22,981 bars</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <Badge className="bg-emerald-500/15 text-emerald-400 border-0">PUBLIC</Badge>
              <span className="text-zinc-500">Strategy by Anonymous · unattributed</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className="bg-emerald-500/15 text-emerald-400 border-0 text-sm">+19978.73%</Badge>
            <Badge className="bg-zinc-800 text-zinc-300">ENGINE 387MS</Badge>
            <Button className="bg-orange-500 hover:bg-orange-400 text-black">Upgrade to fork</Button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-[#0d1218] p-4">
          <p className="text-[11px] uppercase tracking-wider text-zinc-500">Iterations & forks</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge className="bg-violet-600/30 text-violet-200">v1 MACD-CCI ATR Trail · +19978.73%</Badge>
            <Badge className="bg-zinc-800 text-zinc-400">v1 MACD-CCI ATR Trail BTC · no backtest</Badge>
            <Badge className="bg-zinc-800 text-emerald-300">v2 MACD-CCI ATR Trail BTC · +760.17%</Badge>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label="Net P&L" value="$1,997,873.05" tone="up" />
          <Stat label="Max Drawdown" value="-6.48%" tone="down" />
          <Stat label="Total Trades" value="1432" />
          <Stat label="Win Rate" value="55.1%" tone="up" />
          <Stat label="Profit Factor" value="10.35" />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-[#0d1218] p-4">
          <p className="text-[11px] uppercase tracking-wider text-zinc-500">Equity curve</p>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equity}>
                <defs>
                  <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                <XAxis dataKey="t" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0d1218", border: "1px solid #27272a" }} />
                <Area type="monotone" dataKey="equity" stroke="#a78bfa" fill="url(#eq)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-[#0d1218] p-4">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">Returns</p>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="text-zinc-500">
                  <th className="text-left font-normal"></th>
                  <th className="text-right font-normal">ALL</th>
                  <th className="text-right font-normal">LONG</th>
                  <th className="text-right font-normal">SHORT</th>
                </tr>
              </thead>
              <tbody className="text-zinc-200">
                <tr>
                  <td className="py-1">Net P&L</td>
                  <td className="text-right text-emerald-400">$1,997,873</td>
                  <td className="text-right">$1,050,280</td>
                  <td className="text-right">$947,593</td>
                </tr>
                <tr>
                  <td className="py-1">Net P&L %</td>
                  <td className="text-right text-emerald-400">+19978.73%</td>
                  <td className="text-right">+10502.80%</td>
                  <td className="text-right">+9475.93%</td>
                </tr>
                <tr>
                  <td className="py-1">Profit Factor</td>
                  <td className="text-right">10.35</td>
                  <td className="text-right">26.63</td>
                  <td className="text-right">19.20</td>
                </tr>
                <tr>
                  <td className="py-1">Win Rate</td>
                  <td className="text-right">55.1%</td>
                  <td className="text-right">67.5%</td>
                  <td className="text-right">46.4%</td>
                </tr>
                <tr>
                  <td className="py-1">Trades</td>
                  <td className="text-right">1432</td>
                  <td className="text-right">588</td>
                  <td className="text-right">844</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#0d1218] p-4">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">Profit structure</p>
            <div className="mt-4 space-y-3 text-sm">
              {[
                ["Gross Profit", "$2,211,499", "bg-emerald-500", 100],
                ["Gross Loss", "-$213,626", "bg-red-500", 10],
                ["Commission", "-$505,284", "bg-amber-500", 23],
                ["Net P&L", "$1,997,873", "bg-violet-500", 90],
              ].map(([label, val, color, w]) => (
                <div key={label as string}>
                  <div className="mb-1 flex justify-between">
                    <span className="text-zinc-400">{label}</span>
                    <span>{val}</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-900">
                    <div className={`h-2 rounded-full ${color}`} style={{ width: `${w}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-[#0d1218] p-4">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">Risk-adjusted performance</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-zinc-500">Sharpe</p>
                <p className="text-2xl font-semibold">6.69</p>
              </div>
              <div>
                <p className="text-zinc-500">Sortino</p>
                <p className="text-2xl font-semibold">8.98</p>
              </div>
              <div>
                <p className="text-zinc-500">Max DD</p>
                <p className="text-2xl font-semibold text-red-400">-6.48%</p>
              </div>
              <div>
                <p className="text-zinc-500">Initial capital</p>
                <p className="text-2xl font-semibold">$10,000</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-[#0d1218] p-4 flex flex-col items-center justify-center">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500 self-start">Win / loss split</p>
            <div className="h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Wins", value: 789 },
                      { name: "Losses", value: 643 },
                    ]}
                    dataKey="value"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    <Cell fill="#34d399" />
                    <Cell fill="#ef4444" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-zinc-400">55.1% win rate · 789W / 643L</p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-[#0d1218] p-4">
          <p className="text-[11px] uppercase tracking-wider text-zinc-500">P&L distribution</p>
          <div className="mt-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pnlDist}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                <XAxis dataKey="bin" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0d1218", border: "1px solid #27272a" }} />
                <Bar dataKey="n">
                  {pnlDist.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-[#0d1218] p-4 overflow-x-auto">
          <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-3">Trade list</p>
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="text-zinc-500">
              <tr>
                <th className="pb-2">#</th>
                <th>SIDE</th>
                <th>ENTRY</th>
                <th>ENTRY $</th>
                <th>EXIT</th>
                <th>EXIT $</th>
                <th>QTY</th>
                <th>BARS</th>
                <th>NET P&L</th>
                <th>P&L %</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.n} className="border-t border-zinc-800/80">
                  <td className="py-2">{t.n}</td>
                  <td className={t.side === "LONG" ? "text-emerald-400" : "text-red-400"}>{t.side}</td>
                  <td>{t.entry}</td>
                  <td>${t.entryPx}</td>
                  <td>{t.exit}</td>
                  <td>${t.exitPx}</td>
                  <td>{t.qty}</td>
                  <td>{t.bars}</td>
                  <td className={t.net >= 0 ? "text-emerald-400" : "text-red-400"}>${t.net}</td>
                  <td className={t.pct >= 0 ? "text-emerald-400" : "text-red-400"}>{t.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3">
          <Link href="/strategies">
            <Button variant="outline" className="border-zinc-700">
              Back to browse
            </Button>
          </Link>
          <Link href="/bots/create">
            <Button className="bg-violet-600 hover:bg-violet-500">Fork into builder</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
