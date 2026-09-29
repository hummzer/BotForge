"use client"

import { useEffect, useState } from "react"
import { readMarketplace, type MarketplaceListing } from "@/lib/marketplace"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function MarketplacePage() {
  const { user } = useAuth()
  const [list, setList] = useState<MarketplaceListing[]>([])
  const premium = user?.plan === "Pro" || user?.plan === "Quant"

  useEffect(() => {
    setList(readMarketplace())
    const on = () => setList(readMarketplace())
    window.addEventListener("botforge-workspace-updated", on)
    return () => window.removeEventListener("botforge-workspace-updated", on)
  }, [])

  return (
    <div className="bf-page">
      <div className="bf-container bf-section-gap">
        <div>
          <p className="bf-kicker">Premium</p>
          <h1 className="bf-title">Marketplace</h1>
          <p className="bf-sub">
            Bots auto-list when a backtest clears gates: ≥20 trades, WR ≥52%, PF ≥1.25, Sharpe ≥0.6, controlled DD, net
            profit. Full source unlocks on Pro/Quant.
          </p>
        </div>

        {!premium && (
          <div className="rounded-xl border border-spotify-green/30 bg-spotify-green/10 p-4 text-sm">
            Free can browse metrics.{" "}
            <Link href="/pricing" className="text-spotify-green hover:underline">
              Upgrade
            </Link>{" "}
            to purchase / unlock full sources.
          </div>
        )}

        {list.length === 0 ? (
          <div className="bf-card-pad text-center text-sm text-spotify-text-secondary">
            No listings yet. Run a strong backtest on one of your bots — if metrics pass, it appears here automatically.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {list.map((item) => (
              <div key={item.id} className="bf-card-pad">
                <div className="flex justify-between gap-2">
                  <h2 className="font-semibold">{item.name}</h2>
                  <Badge className="border-0 bg-spotify-green/15 text-spotify-green">${item.priceUsd}</Badge>
                </div>
                <p className="mt-1 text-xs text-spotify-text-secondary">
                  {item.symbol} · {item.language} · {item.author}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-spotify-text-secondary">{item.description}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-spotify-text-secondary">WR</p>
                    <p className="font-semibold">{item.metrics.winRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-spotify-text-secondary">PF</p>
                    <p className="font-semibold">{item.metrics.profitFactor.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-spotify-text-secondary">Sharpe</p>
                    <p className="font-semibold">{item.metrics.sharpe.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
