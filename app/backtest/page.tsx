"use client"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, BarChart, TrendingUp, TrendingDown, Sparkles, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { InteractiveChartPlaceholder } from "@/components/interactive-chart-placeholder"
import { toast } from "react-toastify"

type BacktestResults = {
  status: "idle" | "running" | "finished" | "error"
  totalTrades: number
  totalTradesWon: number
  totalTradesLost: number
  winAmount: number
  lossAmount: number
  percentageAccurate: number
  totalConsecutiveWins: number
  totalConsecutiveLosses: number
  averageConsecutiveWins: number
  averageConsecutiveLosses: number
  profit: number
  message: string
}

function BacktestResultsDisplay({ results }: { results: BacktestResults }) {
  if (results.status !== "finished") return null

  const profitLossClass = results.profit >= 0 ? "text-spotify-green" : "text-destructive-foreground"
  const profitLossIcon =
    results.profit >= 0 ? <TrendingUp className="ml-1 h-4 w-4" /> : <TrendingDown className="ml-1 h-4 w-4" />

  return (
    <Card className="shadow-sm border-spotify-grey bg-spotify-dark-grey p-6 mt-8 animate-fade-in-up rounded-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-spotify-text-primary flex items-center">
          <CheckCircle className="mr-2 h-5 w-5 text-spotify-green" /> Backtest Finished!
        </CardTitle>
        <CardDescription className="text-sm text-spotify-text-secondary">{results.message}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm text-spotify-text-primary">
        <div className="grid grid-cols-2 gap-y-2">
          <div>
            <span className="font-medium">Total Trades:</span> {results.totalTrades}
          </div>
          <div>
            <span className="font-medium">Percentage Accurate:</span> {results.percentageAccurate.toFixed(2)}%
          </div>
          <div>
            <span className="font-medium">Trades Won:</span> {results.totalTradesWon}{" "}
            <span className="text-spotify-green">({results.winAmount.toFixed(2)} KES)</span>
          </div>
          <div>
            <span className="font-medium">Trades Lost:</span> {results.totalTradesLost}{" "}
            <span className="text-destructive-foreground">({results.lossAmount.toFixed(2)} KES)</span>
          </div>
          <div>
            <span className="font-medium">Total Consecutive Wins:</span> {results.totalConsecutiveWins}{" "}
            <span className="text-spotify-green">
              ({((results.winAmount / results.totalTradesWon) * results.totalConsecutiveWins).toFixed(2)} KES)
            </span>
          </div>
          <div>
            <span className="font-medium">Total Consecutive Losses:</span> {results.totalConsecutiveLosses}{" "}
            <span className="text-destructive-foreground">
              ({((results.lossAmount / results.totalTradesLost) * results.totalConsecutiveLosses).toFixed(2)} KES)
            </span>
          </div>
          <div>
            <span className="font-medium">Avg. Consecutive Wins:</span> {results.averageConsecutiveWins.toFixed(2)}
          </div>
          <div>
            <span className="font-medium">Avg. Consecutive Losses:</span> {results.averageConsecutiveLosses.toFixed(2)}
          </div>
        </div>
        <div className="text-lg font-bold mt-4 flex items-center">
          Overall Profit/Loss:{" "}
          <span className={`ml-2 flex items-center ${profitLossClass}`}>
            {results.profit.toFixed(2)} KES {profitLossIcon}
          </span>
        </div>
        <Button
          onClick={() =>
            toast({
              title: "AI Customization",
              description: "AI-powered strategy customization coming soon!",
              variant: "default",
            })
          }
          className="bg-spotify-green text-spotify-black hover:bg-spotify-green/90 transition-all duration-300 hover:scale-105 rounded-full mt-4"
        >
          <Sparkles className="mr-2 h-4 w-4" /> Customize using AI for greater results
        </Button>
      </CardContent>
    </Card>
  )
}

export default function BacktestingPage() {
  const { toast } = useToast()
  const [backtestState, setBacktestState] = useState<BacktestResults>({
    status: "idle",
    totalTrades: 0,
    totalTradesWon: 0,
    totalTradesLost: 0,
    winAmount: 0,
    lossAmount: 0,
    percentageAccurate: 0,
    totalConsecutiveWins: 0,
    totalConsecutiveLosses: 0,
    averageConsecutiveWins: 0,
    averageConsecutiveLosses: 0,
    profit: 0,
    message: "",
  })
  const [isBacktesting, setIsBacktesting] = useState(false)

  const handleRunBacktest = () => {
    setIsBacktesting(true)
    setBacktestState({ ...backtestState, status: "running", message: "Backtest in progress..." })

    setTimeout(() => {
      const isSuccessful = Math.random() > 0.2 // 80% chance of a good backtest
      const generatedTrades = Math.floor(Math.random() * 500) + 100
      const generatedWins = Math.floor(
        generatedTrades * (isSuccessful ? Math.random() * 0.3 + 0.5 : Math.random() * 0.2 + 0.3),
      ) // 50-80% if successful, 30-50% if not
      const generatedLosses = generatedTrades - generatedWins
      const generatedWinAmount = Math.random() * 5000 + 1000
      const generatedLossAmount = Math.random() * 2000 + 500
      const generatedProfit = generatedWinAmount - generatedLossAmount
      const generatedAccuracy = (generatedWins / generatedTrades) * 100
      const generatedConsWins = Math.floor(Math.random() * 15) + 1
      const generatedConsLosses = Math.floor(Math.random() * 10) + 1
      const avgConsWins = generatedConsWins / (Math.floor(Math.random() * 3) + 1)
      const avgConsLosses = generatedConsLosses / (Math.floor(Math.random() * 3) + 1)

      if (isSuccessful) {
        setBacktestState({
          status: "finished",
          totalTrades: generatedTrades,
          totalTradesWon: generatedWins,
          totalTradesLost: generatedLosses,
          winAmount: generatedWinAmount,
          lossAmount: generatedLossAmount,
          percentageAccurate: generatedAccuracy,
          totalConsecutiveWins: generatedConsWins,
          totalConsecutiveLosses: generatedConsLosses,
          averageConsecutiveWins: avgConsWins,
          averageConsecutiveLosses: avgConsLosses,
          profit: generatedProfit,
          message: "Backtest completed successfully!",
        })
        toast({
          title: "Backtest Completed!",
          description: "Your bot's performance results are ready.",
          variant: "default",
        })
      } else {
        setBacktestState({
          status: "error",
          totalTrades: generatedTrades,
          totalTradesWon: generatedWins,
          totalTradesLost: generatedLosses,
          winAmount: generatedWinAmount,
          lossAmount: generatedLossAmount,
          percentageAccurate: generatedAccuracy,
          totalConsecutiveWins: generatedConsWins,
          totalConsecutiveLosses: generatedConsLosses,
          averageConsecutiveWins: avgConsWins,
          averageConsecutiveLosses: avgConsLosses,
          profit: generatedProfit,
          message: "Backtest completed with some issues. Review results.",
        })
        toast({
          title: "Backtest Completed with Warnings",
          description: "Some errors or warnings occurred during backtesting.",
          variant: "destructive",
        })
      }
      setIsBacktesting(false)
    }, 4000) // Simulate 4-second backtest
  }

  return (
    <div className="min-h-screen bg-spotify-black font-sans text-spotify-text-primary py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <h1 className="font-display text-3xl font-bold text-spotify-text-primary mb-4 animate-fade-in-up">
          Backtesting Strategies
        </h1>
        <p className="text-spotify-text-secondary text-sm mb-8 animate-fade-in-up animation-delay-200">
          Test your trading bots against historical market data.
        </p>

        <Card className="shadow-sm border-spotify-grey bg-spotify-dark-grey p-6 animate-fade-in-up animation-delay-300 rounded-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-spotify-text-primary">Run New Backtest</CardTitle>
            <CardDescription className="text-sm text-spotify-text-secondary">
              Configure your backtest parameters and start the simulation.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bot-select" className="text-sm text-spotify-text-primary">
                  Select Bot
                </Label>
                <Select>
                  <SelectTrigger
                    id="bot-select"
                    className="text-sm border-spotify-grey focus:border-spotify-green bg-spotify-black text-spotify-text-primary rounded-md"
                  >
                    <SelectValue placeholder="Choose a bot" />
                  </SelectTrigger>
                  <SelectContent className="bg-spotify-dark-grey text-spotify-text-primary border-spotify-grey rounded-md">
                    <SelectItem value="trend-follower">TrendFollower v2</SelectItem>
                    <SelectItem value="scalper-pro">Scalper Pro</SelectItem>
                    <SelectItem value="arbitrage-bot">Arbitrage Bot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="data-select" className="text-sm text-spotify-text-primary">
                  Select Data Source
                </Label>
                <Select>
                  <SelectTrigger
                    id="data-select"
                    className="text-sm border-spotify-grey focus:border-spotify-green bg-spotify-black text-spotify-text-primary rounded-md"
                  >
                    <SelectValue placeholder="Choose data" />
                  </SelectTrigger>
                  <SelectContent className="bg-spotify-dark-grey text-spotify-text-primary border-spotify-grey rounded-md">
                    <SelectItem value="historical-deriv">Deriv Historical Data</SelectItem>
                    <SelectItem value="local-import">My Imported Data (2020-2023)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-date" className="text-sm text-spotify-text-primary">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  defaultValue="2023-01-01"
                  className="text-sm border-spotify-grey focus:border-spotify-green bg-spotify-black text-spotify-text-primary rounded-md"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-date" className="text-sm text-spotify-text-primary">
                  End Date
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  defaultValue="2023-12-31"
                  className="text-sm border-spotify-grey focus:border-spotify-green bg-spotify-black text-spotify-text-primary rounded-md"
                />
              </div>
            </div>
            <Button
              onClick={handleRunBacktest}
              disabled={isBacktesting}
              className="w-full bg-spotify-green text-spotify-black hover:bg-spotify-green/90 transition-all duration-300 hover:scale-105 rounded-full"
            >
              {isBacktesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running Backtest...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> Run Backtest
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {isBacktesting && (
          <div className="mt-8 text-center animate-fade-in-up">
            <h2 className="font-display text-2xl font-bold text-spotify-text-primary mb-4">
              Live Backtest Visualization
            </h2>
            <p className="text-spotify-text-secondary text-sm mb-6">
              Watch your bot execute trades in real-time on the chart.
            </p>
            <InteractiveChartPlaceholder isLive={true} />
            <p className="text-xs text-spotify-text-secondary mt-2">
              This chart would display real-time price movements and trade executions during the backtest.
            </p>
          </div>
        )}

        <BacktestResultsDisplay results={backtestState} />

        <section className="space-y-4 mt-12">
          <h2 className="font-display text-2xl font-bold text-spotify-text-primary animate-fade-in-up animation-delay-400">
            Recent Backtest Results
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="shadow-sm border-spotify-grey bg-spotify-dark-grey p-4 animate-fade-in-up animation-delay-500 rounded-lg">
              <CardTitle className="text-lg font-semibold text-spotify-text-primary">
                TrendFollower v2 - 2023 Performance
              </CardTitle>
              <CardDescription className="text-sm text-spotify-text-secondary mt-2">
                Run on 2024-07-20 | Data: Deriv Historical
              </CardDescription>
              <CardContent className="mt-4 text-sm text-spotify-text-primary space-y-1">
                <p className="flex items-center">
                  Profit:{" "}
                  <span className="font-bold text-spotify-green ml-1 flex items-center">
                    $1,520.30 <TrendingUp className="ml-1 h-4 w-4" />
                  </span>
                </p>
                <p>Win Rate: 68%</p>
                <p>Max Drawdown: 12.5%</p>
                <Link href="/backtest/report">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-spotify-grey text-spotify-text-primary hover:bg-spotify-grey/50 bg-transparent transition-all duration-200 hover:scale-105 rounded-full"
                  >
                    <BarChart className="mr-2 h-4 w-4" /> View Report
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-spotify-grey bg-spotify-dark-grey p-4 animate-fade-in-up animation-delay-550 rounded-lg">
              <CardTitle className="text-lg font-semibold text-spotify-text-primary">Scalper Pro - Q1 2024</CardTitle>
              <CardDescription className="text-sm text-spotify-text-secondary mt-2">
                Run on 2024-07-18 | Data: My Imported Data
              </CardDescription>
              <CardContent className="mt-4 text-sm text-spotify-text-primary space-y-1">
                <p className="flex items-center">
                  Profit:{" "}
                  <span className="font-bold text-destructive-foreground ml-1 flex items-center">
                    $-310.75 <TrendingDown className="ml-1 h-4 w-4" />
                  </span>
                </p>
                <p>Win Rate: 42%</p>
                <p>Max Drawdown: 25.1%</p>
                <Link href="/backtest/report">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-spotify-grey text-spotify-text-primary hover:bg-spotify-grey/50 bg-transparent transition-all duration-200 hover:scale-105 rounded-full"
                  >
                    <BarChart className="mr-2 h-4 w-4" /> View Report
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Page-specific CTA */}
        <div className="mt-12 text-center animate-fade-in-up animation-delay-600">
          <h2 className="font-display text-2xl font-bold text-spotify-text-primary mb-4">Optimize Your Strategies!</h2>
          <p className="text-spotify-text-secondary text-sm mb-6">
            Run more backtests to fine-tune your bots for maximum profitability.
          </p>
          <Link href="/backtest?action=new">
            <Button
              size="lg"
              className="bg-spotify-green text-spotify-black hover:bg-spotify-green/90 transition-all duration-300 hover:scale-105 rounded-full"
            >
              Start a New Backtest
            </Button>
          </Link>
        </div>
      </div>
      <footer className="py-8 text-center text-xs text-spotify-text-secondary border-t border-spotify-grey bg-spotify-dark-grey mt-8">
        <div className="container mx-auto max-w-6xl px-4">
          &copy; {new Date().getFullYear()} Momo. All rights reserved. Made by{" "}
          <a
            href="https://hummzer.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-spotify-green hover:underline"
          >
            Hummzer
          </a>
          .
        </div>
      </footer>
    </div>
  )
}
