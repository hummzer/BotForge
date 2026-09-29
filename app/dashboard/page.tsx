"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BiasWidget } from "@/components/bias-widget"
import { useAuth } from "@/lib/auth-context"
import { readBots, readBacktestResults } from "@/lib/botforge"
import { readMarketplace } from "@/lib/marketplace"
import { CalendarDays } from "lucide-react"

type CalEvent = { title: string; country: string; date: string; impact: string; forecast?: string }

export default function DashboardPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<CalEvent[]>([])
  const [bots, setBots] = useState(0)
  const [tests, setTests] = useState(0)
  const [listed, setListed] = useState(0)

  useEffect(() => {
    setBots(readBots().length)
    setTests(readBacktestResults().length)
    setListed(readMarketplace().length)
    fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(data.filter((e: CalEvent) => /high/i.test(String(e.impact))).slice(0, 8))
        }
      })
      .catch(() => setEvents([]))
  }, [])

  return (
    <div className="bf-page">
      <div className="bf-container bf-section-gap">
        <div>
          <p className="bf-kicker">Dashboard</p>
          <h1 className="bf-title">Welcome{user?.name ? `, ${user.name}` : ""}</h1>
          <p className="bf-sub">Fundamentals, bias, and workspace snapshot after sign-in.</p>
        </div>

        <div className="bf-grid-stats">
          <div className="bf-stat">
            <p className="bf-stat-label">Bots</p>
            <p className="bf-stat-value text-spotify-green">{bots}</p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Tests</p>
            <p className="bf-stat-value">{tests}</p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Marketplace</p>
            <p className="bf-stat-value">{listed}</p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Plan</p>
            <p className="bf-stat-value text-lg">{user?.plan || "Free"}</p>
          </div>
        </div>

        <BiasWidget />

        <div className="bf-card-pad">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-spotify-green" />
            <h2 className="text-lg font-semibold">High-impact news</h2>
          </div>
          {events.length === 0 ? (
            <p className="text-sm text-spotify-text-secondary">No high-impact events loaded for this window.</p>
          ) : (
            <div className="space-y-2">
              {events.map((e, i) => (
                <div
                  key={`${e.title}-${i}`}
                  className="flex flex-wrap justify-between gap-2 rounded-xl border border-spotify-grey bg-spotify-black px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {e.country} — {e.title}
                    </p>
                    <p className="text-xs text-spotify-text-secondary">{new Date(e.date).toLocaleString()}</p>
                  </div>
                  <span className="h-fit rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-400">HIGH</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/bots/create" className="bf-btn-primary inline-flex items-center px-5 py-2.5 text-sm font-medium">
            Create bot
          </Link>
          <Link href="/marketplace" className="bf-btn-ghost inline-flex items-center px-5 py-2.5 text-sm">
            Marketplace
          </Link>
          <Link href="/backtest" className="bf-btn-ghost inline-flex items-center px-5 py-2.5 text-sm">
            Strategy tester
          </Link>
        </div>
      </div>
    </div>
  )
}
