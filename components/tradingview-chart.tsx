"use client"

import { useEffect, useRef } from "react"

type Props = { symbol?: string }

export function TradingViewChart({ symbol = "OANDA:XAUUSD" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.innerHTML = ""
    const widget = document.createElement("div")
    widget.className = "tradingview-widget-container__widget"
    widget.style.height = "calc(100% - 32px)"
    widget.style.width = "100%"
    const copyright = document.createElement("div")
    copyright.className = "text-center text-[10px] text-spotify-text-secondary py-1"
    copyright.textContent = "Chart data and tools by TradingView"
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: "15",
      timezone: "Africa/Nairobi",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "#0b0b0d",
      gridColor: "rgba(255,255,255,0.06)",
      hide_top_toolbar: false,
      hide_side_toolbar: false,
      hide_legend: false,
      hide_volume: false,
      allow_symbol_change: true,
      save_image: true,
      withdateranges: true,
      details: true,
      hotlist: false,
      calendar: false,
      studies: ["Volume@tv-basicstudies", "RSI@tv-basicstudies"],
      support_host: "https://www.tradingview.com"
    })
    container.appendChild(widget)
    container.appendChild(copyright)
    widget.appendChild(script)
    return () => { container.innerHTML = "" }
  }, [symbol])

  return <div ref={containerRef} className="h-full w-full overflow-hidden rounded-2xl" />
}
