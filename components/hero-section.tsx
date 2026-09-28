import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Bot, BarChart3, Sparkles } from "lucide-react"
import { RealtimeMarket } from "@/components/realtime-market"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-spotify-dark-grey to-spotify-black py-20 text-center md:py-28">
      <div className="container relative z-10 mx-auto max-w-6xl px-4">
        <p className="mb-4 text-xs font-semibold tracking-[0.35em] text-spotify-green">BOTFORGE · ALGORITHMIC TRADING</p>
        <h1 className="font-display text-5xl font-bold leading-tight text-spotify-green md:text-7xl">BotForge</h1>
        <p className="mx-auto mt-6 max-w-3xl text-xl text-spotify-text-primary md:text-2xl">
          Build, backtest, monitor and deploy trading bots from one workspace.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-spotify-text-secondary md:text-base">
          Generate strategy code, test it against real market candles, stream live prices and run paper bots without fake performance data.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/bots/create"><Button size="lg" className="rounded-full bg-spotify-green text-spotify-black hover:bg-spotify-green/90"><Sparkles className="mr-2 h-5 w-5" />Build a Bot</Button></Link>
          <Link href="/backtest"><Button size="lg" variant="outline" className="rounded-full border-spotify-grey bg-transparent text-spotify-text-primary"><BarChart3 className="mr-2 h-5 w-5" />Run a Backtest</Button></Link>
          <Link href="/live-bots"><Button size="lg" variant="outline" className="rounded-full border-spotify-grey bg-transparent text-spotify-text-primary"><Bot className="mr-2 h-5 w-5" />Live Monitor</Button></Link>
        </div>
        <RealtimeMarket />
      </div>
    </section>
  )
}
