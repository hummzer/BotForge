"use client"

import { useEffect, useState } from "react"
import { CalendarDays, ExternalLink } from "lucide-react"

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
    fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("bad data")
        const high = data
          .filter((e: CalEvent) => String(e.impact).toLowerCase() === "high")
          .slice(0, 12)
        setEvents(high)
        setStatus("ok")
      })
      .catch(() => setStatus("error"))
  }, [])

  return (
    <section className="bg-spotify-black py-10">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="rounded-2xl border border-spotify-grey bg-spotify-dark-grey p-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.25em] text-spotify-green">BOTFORGE · ECONOMIC CALENDAR</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-spotify-text-primary">Forex Factory</h2>
              <p className="text-xs text-spotify-text-secondary">High-impact events this week</p>
            </div>
            <a
              href="https://www.forexfactory.com/calendar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-spotify-green hover:underline flex items-center gap-1"
            >
              Full calendar <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-spotify-text-secondary">
            <CalendarDays className="h-4 w-4 text-spotify-green" />
            Live feed · times can change
          </div>

          <div className="mt-5 space-y-3">
            {status === "loading" && (
              <p className="text-sm text-spotify-text-secondary">Loading economic calendar…</p>
            )}
            {status === "error" && (
              <p className="text-sm text-spotify-text-secondary">
                Calendar feed temporarily unavailable.{" "}
                <a href="https://www.forexfactory.com/calendar" className="text-spotify-green hover:underline" target="_blank" rel="noreferrer">
                  Open Forex Factory
                </a>
              </p>
            )}
            {status === "ok" && events.length === 0 && (
              <p className="text-sm text-spotify-text-secondary">No high-impact events scheduled this week.</p>
            )}
            {events.map((e, i) => (
              <div
                key={`${e.title}-${e.date}-${i}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-spotify-grey bg-spotify-black p-4"
              >
                <div>
                  <p className="text-sm font-medium text-spotify-text-primary">
                    {e.country} — {e.title}
                  </p>
                  <p className="text-xs text-spotify-text-secondary mt-1">
                    {new Date(e.date).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium rounded px-2 py-1 bg-red-500/20 text-red-400">HIGH</span>
                  {e.forecast && (
                    <p className="text-xs text-spotify-text-secondary mt-1">Forecast: {e.forecast}</p>
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
