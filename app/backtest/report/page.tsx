"use client"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, Sparkles } from "lucide-react"
import { ResponsiveContainer, LineChart as RechartsLineChart, BarChart as RechartsBarChart, PieChart, Line, XAxis, YAxis, CartesianGrid, Legend, Pie, Cell, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useToast } from "@/hooks/use-toast"

export default function BacktestReportPage() {
  const { toast } = useToast()

  // Mock Data for Charts and Stats
  const equityData = [
    { name: "Day 1", equity: 10000 },
    { name: "Day 2", equity: 10050 },
    { name: "Day 3", equity: 9980 },
    { name: "Day 4", equity: 10120 },
    { name: "Day 5", equity: 10300 },
    { name: "Day 6", equity: 10250 },
    { name: "Day 7", equity: 10450 },
    { name: "Day 8", equity: 10380 },
    { name: "Day 9", equity: 10550 },
    { name: "Day 10", equity: 10700 },
  ]

  const tradeDistributionData = [
    { name: "Wins", value: 70, color: "hsl(var(--spotify-green))" },
    { name: "Losses", value: 30, color: "hsl(var(--destructive-foreground))" },
  ]

  const profitPerTradeData = [
    { range: "$0-10", count: 15 },
    { range: "$10-20", count: 25 },
    { range: "$20-30", count: 18 },
    { range: "$30-40", count: 10 },
    { range: "$40+", count: 5 },
  ]

  const dailyPerformance = [
    { day: "Mon", wins: 15, losses: 8 },
    { day: "Tue", wins: 12, losses: 10 },
    { day: "Wed", wins: 18, losses: 5 },
    { day: "Thu", wins: 10, losses: 12 },
    { day: "Fri", wins: 20, losses: 6 },
  ]

  const hourlyPerformance = [
    { hour: "00-04", wins: 5, losses: 3 },
    { hour: "04-08", wins: 8, losses: 5 },
    { hour: "08-12", wins: 12, losses: 4 },
    { hour: "12-16", wins: 10, losses: 7 },
    { hour: "16-20", wins: 7, losses: 9 },
    { hour: "20-24", wins: 3, losses: 2 },
  ]

  const marketSessions = [
    { session: "London", profit: 800 },
    { session: "New York", profit: 1200 },
    { session: "Tokyo", profit: 300 },
    { session: "Sydney", profit: 150 },
  ]

  const profitFactor = 1.85 // Example value
  const totalProfit = equityData[equityData.length - 1].equity - equityData[0].equity
  const winningDays = 7
  const losingDays = 3
  const winningHours = "08:00 - 12:00"
  const losingHours = "16:00 - 20:00"

  const suggestedImprovements = [
    "Consider tightening stop-loss during volatile periods.",
    "Explore adding a volume filter to entry conditions.",
    "Optimize take-profit levels for trades during the New York session.",
    "Review performance on Thursdays, as it shows higher loss rates.",
    "Test with a slightly longer Moving Average period for trend confirmation.",
  ]

  return (
    <div className="min-h-screen bg-spotify-black font-sans text-spotify-text-primary py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <h1 className="font-display text-3xl font-bold text-spotify-text-primary mb-4 animate-fade-in-up">
          Backtest Report: TrendFollower v2
        </h1>
        <p className="text-spotify-text-secondary text-sm mb-8 animate-fade-in-up animation-delay-200">
          Detailed analysis of your bot's performance from 2023-01-01 to 2023-12-31.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Equity Curve */}
          <Card className="shadow-sm border-spotify-grey bg-spotify-dark-grey p-4 animate-fade-in-up rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-spotify-text-primary">Equity Curve</CardTitle>
              <CardDescription className="text-sm text-spotify-text-secondary">
                Account balance over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  equity: {
                    label: "Equity",
                    color: "hsl(var(--spotify-green))",
                  },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={equityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--spotify-grey))" />
                    <XAxis dataKey="name" stroke="hsl(var(--spotify-text-secondary))" />
                    <YAxis stroke="hsl(var(--spotify-text-secondary))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="equity" stroke="var(--color-equity)" strokeWidth={2} dot={false} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Trade Distribution */}
          <Card className="shadow-sm border-spotify-grey bg-spotify-dark-grey p-4 animate-fade-in-up rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-spotify-text-primary">Trade Distribution</CardTitle>
              <CardDescription className="text-sm text-spotify-text-secondary">
                Winning vs. Losing Trades.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-[250px]">
              <ChartContainer
                config={{
                  wins: {
                    label: "Wins",
                    color: "hsl(var(--spotify-green))",
                  },
                  losses: {
                    label: "Losses",
                    color: "hsl(var(--destructive-foreground))",
                  },
                }}
                className="h-[200px] w-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tradeDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {tradeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Profit Per Trade Histogram */}
          <Card className="shadow-sm border-spotify-grey bg-spotify-dark-grey p-4 animate-fade-in-up rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-spotify-text-primary">
                Profit Per Trade Distribution
              </CardTitle>
              <CardDescription className="text-sm text-spotify-text-secondary">
                Frequency of profit ranges.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Count",
                    color: "hsl(var(--spotify-green))",
                  },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={profitPerTradeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--spotify-grey))" />
                    <XAxis dataKey="range" stroke="hsl(var(--spotify-text-secondary))" />
                    <YAxis stroke="hsl(var(--spotify-text-secondary))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Key Stats */}
          <Card className="shadow-sm border-spotify-grey bg-spotify-dark-grey p-4 animate-fade-in-up rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-spotify-text-primary">Key Performance Stats</CardTitle>
              <CardDescription className="text-sm text-spotify-text-secondary">
                Overall metrics for the backtest.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-spotify-text-primary">
              <p>
                <span className="font-medium">Total Profit:</span>{" "}
                <span className={totalProfit >= 0 ? "text-spotify-green" : "text-destructive-foreground"}>
                  {totalProfit.toFixed(2)} KES
                </span>
              </p>
              <p>
                <span className="font-medium">Profit Factor:</span> {profitFactor.toFixed(2)}
              </p>
              <p>
                <span className="font-medium">Winning Days:</span> {winningDays}
              </p>
              <p>
                <span className="font-medium">Losing Days:</span> {losingDays}
              </p>
              <p>
                <span className="font-medium">Best Winning Hours:</span> {winningHours}
              </p>
              <p>
                <span className="font-medium">Worst Losing Hours:</span> {losingHours}
              </p>
            </CardContent>
          </Card>

          {/* Daily Performance */}
          <Card className="shadow-sm border-spotify-grey bg-spotify-dark-grey p-4 animate-fade-in-up rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-spotify-text-primary">Daily Performance</CardTitle>
              <CardDescription className="text-sm text-spotify-text-secondary">
                Wins and losses by day of the week.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  wins: { label: "Wins", color: "hsl(var(--spotify-green))" },
                  losses: { label: "Losses", color: "hsl(var(--destructive-foreground))" },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={dailyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--spotify-grey))" />
                    <XAxis dataKey="day" stroke="hsl(var(--spotify-text-secondary))" />
                    <YAxis stroke="hsl(var(--spotify-text-secondary))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="wins" fill="var(--color-wins)" name="Wins" />
                    <Bar dataKey="losses" fill="var(--color-losses)" name="Losses" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Hourly Performance */}
          <Card className="shadow-sm border-spotify-grey bg-spotify-dark-grey p-4 animate-fade-in-up rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-spotify-text-primary">Hourly Performance</CardTitle>
              <CardDescription className="text-sm text-spotify-text-secondary">
                Wins and losses by hour of the day.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  wins: { label: "Wins", color: "hsl(var(--spotify-green))" },
                  losses: { label: "Losses", color: "hsl(var(--destructive-foreground))" },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={hourlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--spotify-grey))" />
                    <XAxis dataKey="hour" stroke="hsl(var(--spotify-text-secondary))" />
                    <YAxis stroke="hsl(var(--spotify-text-secondary))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="wins" fill="var(--color-wins)" name="Wins" />
                    <Bar dataKey="losses" fill="var(--color-losses)" name="Losses" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Market Sessions Profit */}
          <Card className="shadow-sm border-spotify-grey bg-spotify-dark-grey p-4 animate-fade-in-up rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-spotify-text-primary">
                Profit by Market Session
              </CardTitle>
              <CardDescription className="text-sm text-spotify-text-secondary">
                Performance across major trading sessions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  profit: {
                    label: "Profit",
                    color: "hsl(var(--spotify-green))",
                  },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={marketSessions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--spotify-grey))" />
                    <XAxis dataKey="session" stroke="hsl(var(--spotify-text-secondary))" />
                    <YAxis stroke="hsl(var(--spotify-text-secondary))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="profit" fill="var(--color-profit)" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Suggested Improvements */}
          <Card className="shadow-sm border-spotify-grey bg-spotify-dark-grey p-4 animate-fade-in-up rounded-lg col-span-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-spotify-text-primary flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-spotify-green" /> Suggested Improvements
              </CardTitle>
              <CardDescription className="text-sm text-spotify-text-secondary">
                AI-powered recommendations to optimize your strategy.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-spotify-text-primary">
              <ul className="list-disc pl-5 space-y-1">
                {suggestedImprovements.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
              <Button
                onClick={() =>
                  toast({
                    title: "AI Optimization",
                    description: "AI-driven optimization tools coming soon!",
                    variant: "default",
                  })
                }
                className="bg-spotify-green text-spotify-black hover:bg-spotify-green/90 transition-all duration-300 hover:scale-105 rounded-full mt-4"
              >
                <Sparkles className="mr-2 h-4 w-4" /> Get More AI Suggestions
              </Button>
            </CardContent>
          </Card>
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
