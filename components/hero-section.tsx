import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-32 text-center bg-gradient-to-b from-spotify-dark-grey to-spotify-black overflow-hidden">
      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        <h1 className="font-display text-5xl md:text-7xl font-bold text-spotify-green leading-tight mb-6 animate-fade-in-up">
          Momo
        </h1>
        <p className="text-xl md:text-2xl text-spotify-text-primary mb-8 animate-fade-in-up animation-delay-200">
          Build, Backtest, and Deploy AI-Powered Trading Bots with Ease.
        </p>
        <p className="text-md md:text-lg text-spotify-text-secondary mb-10 animate-fade-in-up animation-delay-300">
          Automate your trading strategies, optimize performance, and connect to global markets.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up animation-delay-400">
          <Link href="/bots/create">
            <Button
              size="lg"
              className="bg-spotify-green text-spotify-black hover:bg-spotify-green/90 transition-all duration-300 hover:scale-105 rounded-full shadow-lg"
            >
              <Sparkles className="mr-2 h-5 w-5" /> Start Building Your Bot
            </Button>
          </Link>
          <Link href="/backtest">
            <Button
              size="lg"
              variant="outline"
              className="border-spotify-grey text-spotify-text-primary hover:bg-spotify-grey/50 bg-transparent transition-all duration-300 hover:scale-105 rounded-full shadow-lg"
            >
              Explore Backtesting
            </Button>
          </Link>
        </div>
      </div>
      {/* Abstract background elements */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-spotify-green rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-500"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-spotify-light-grey rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-700"></div>
        <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-spotify-dark-grey rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-900"></div>
      </div>
    </section>
  )
}
