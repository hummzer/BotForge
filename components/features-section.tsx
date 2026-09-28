import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, TrendingUp, Cloud, Brain, ShieldCheck, Zap } from "lucide-react"

export function FeaturesSection() {
  const features = [
    { icon: Code, title: "AI Strategy Generation", description: "Turn a natural-language strategy into editable Python, JavaScript, Rust, C++, Pine Script or MQL code." },
    { icon: TrendingUp, title: "Real Historical Backtesting", description: "Pull live public market candles and calculate trades, win rate, P/L, drawdown and profit factor from deterministic rules." },
    { icon: Cloud, title: "Live Paper Execution", description: "Stream market prices over WebSocket and monitor bot state, equity and paper trades in real time." },
    { icon: Brain, title: "Strategy Workspace", description: "Store created bots in the browser, edit code, download files and carry the same strategy into testing." },
    { icon: ShieldCheck, title: "Risk Controls", description: "Use explicit stop-loss, take-profit and risk-per-trade parameters in strategy testing." },
    { icon: Zap, title: "Market Data", description: "Stream BTC/USDT from Binance public market infrastructure and import your own CSV candle data." },
  ]
  return (
    <section className="bg-spotify-black py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="mb-12 text-center font-display text-4xl font-bold text-spotify-text-primary">Why BotForge?</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }, index) => (
            <Card key={title} className="rounded-lg border-spotify-grey bg-spotify-dark-grey shadow-lg transition-all hover:shadow-xl" style={{ animationDelay: `${100 + index * 75}ms` }}>
              <CardHeader className="flex flex-row items-center space-x-4 pb-2"><Icon className="h-8 w-8 text-spotify-green" /><CardTitle className="text-xl text-spotify-text-primary">{title}</CardTitle></CardHeader>
              <CardContent className="text-sm text-spotify-text-secondary">{description}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
