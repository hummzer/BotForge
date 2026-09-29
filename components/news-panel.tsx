"use client"

import { useEffect, useState } from "react"
import { CalendarDays } from "lucide-react"
import { TradingViewChart } from "@/components/tradingview-chart"

type CalEvent = {
  title: string
  country: string
  date: string
  impact: string
  forecast?: string
  previous?: string
}

export function NewsPanel() {
  const [events, setEvents] = useState<CalEvent[]>([])
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading")

  useEffect(() => {
    // Primary: FairEconomy FF JSON; secondary synthetic from known cadence if blocked
    fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("bad data")
        const high = data
          .filter((e: CalEvent) => /high/i.test(String(e.impact)))
          .slice(0, 10)
        setEvents(high)
        setStatus("ok")
      })
      .catch(() => {
        setEvents([])
        setStatus("error")
      })
  }, [])

  return (
    <section className="relative overflow-hidden bg-spotify-black py-12">
      <div className="pointer-events-none absolute inset-0 opacity-[0.22]">
        <div className="h-full min-h-[420px] w-full grayscale contrast-125">
          <TradingViewChart symbol="OANDA:XAUUSD" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-spotify-black/80 via-spotify-black/70 to-spotify-black" />
      </div>

      <div className="container relative z-10 mx-auto max-w-6xl px-4">
        <div className="rounded-2xl border border-spotify-grey/80 bg-spotify-dark-grey/90 p-6 shadow-2xl backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.25em] text-spotify-green">BOTFORGE · ECONOMIC CALENDAR</p>
              <h2 className="mt-1 font-display text-2xl font-bold">High-impact week</h2>
              <p className="text-xs text-spotify-text-secondary">Fundamentals feed · XAUUSD chart underlay</p>
            </div>
            <a href="/chart" className="text-xs text-spotify-green hover:underline">
              Open XAUUSD chart →
            </a>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-spotify-text-secondary">
            <CalendarDays className="h-4 w-4 text-spotify-green" />
            Live feed · times can change
          </div>

          <div className="mt-5 space-y-3">
            {status === "loading" && <p className="text-sm text-spotify-text-secondary">Loading events…</p>}
            {status === "error" && (
              <p className="text-sm text-spotify-text-secondary">
                External calendar host blocked. After sign-in, dashboard loads Investing-style event cards and bias.
              </p>
            )}
            {status === "ok" && events.length === 0 && (
              <p className="text-sm text-spotify-text-secondary">No high-impact events in the current feed window.</p>
            )}
            {events.map((e, i) => (
              <div
                key={`${e.title}-${e.date}-${i}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-spotify-grey bg-spotify-black/90 p-4"
              >
                <div>
                  <p className="text-sm font-medium">
                    {e.country} — {e.title}
                  </p>
                  <p className="mt-1 text-xs text-spotify-text-secondary">{new Date(e.date).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="rounded bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400">HIGH</span>
                  {e.forecast && (
                    <p className="mt-1 text-xs text-spotify-text-secondary">Forecast: {e.forecast}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
