"use client"

import { useEffect, useRef } from "react"

/**
 * Economic calendar via Investing.com embed (public widget).
 * Forex Factory is not used — their embed often fails CORS / empty frames.
 */
export default function CalendarPage() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.innerHTML = ""
    const script = document.createElement("script")
    script.src =
      "https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&features=datepicker,timezone&countries=25,32,6,37,72,22,17&calType=week&timeZone=8&lang=1"
    script.async = true
    el.appendChild(script)
    return () => {
      el.innerHTML = ""
    }
  }, [])

  return (
    <div className="bf-page">
      <div className="bf-container-wide bf-section-gap">
        <div>
          <p className="bf-kicker">Calendar</p>
          <h1 className="bf-title">Economic calendar</h1>
          <p className="bf-sub">
            High-impact events from Investing.com. Use this before running news-sensitive strategies.
          </p>
        </div>
        <div className="bf-card overflow-hidden">
          <div className="min-h-[520px] bg-white p-2">
            <div ref={ref} className="w-full" />
          </div>
          <p className="border-t border-spotify-grey px-4 py-2 text-center text-[10px] text-spotify-text-secondary">
            Calendar data © Investing.com · not affiliated with BotForge
          </p>
        </div>
      </div>
    </div>
  )
}
