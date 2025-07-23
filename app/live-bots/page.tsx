"use client"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Pause,
  StopCircle,
  RefreshCw,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Info,
  Activity,
  Zap,
  Loader2,
} from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type Bot = {
  id: number
  name: string
  language: string
  status: "Running" | "Paused" | "Stopped" | "Production Ready"
  lastRun: string
  trades: number
  code: string
  accuracy: number
  winRate: number
  totalProfitLoss: number
  consecutiveWins: number
  consecutiveLosses: number
  winAmount: number
  lossAmount: number
}

type LiveBot = {
  id: number
  name: string
  status: "Active" | "Paused" | "Error" | "Stopped"
  broker: string
  connectedApp: string
  currentProfitLoss: number
  openTrades: number
  closedTrades: number
  lastActivity: string
  trades: {
    id: string
    type: "BUY" | "SELL"
    symbol: string
    entryPrice: number
    exitPrice: number | null
    status: "Open" | "Closed"
    profit: number | null
    entryTime: string
    exitTime: string | null
  }[]
}

export default function LiveBotsPage() {
  const { toast } = useToast()
  const [liveBots, setLiveBots] = useState<LiveBot[]>([
    {
      id: 101,
      name: "TrendMaster Live",
      status: "Active",
      broker: "Deriv",
      connectedApp: "MetaTrader 5",
      currentProfitLoss: 150.75,
      openTrades: 2,
      closedTrades: 15,
      lastActivity: "2 minutes ago",
      trades: [
        {
          id: "TRD001",
          type: "BUY",
          symbol: "EURUSD",
          entryPrice: 1.085,
          exitPrice: 1.0875,
          status: "Closed",
          profit: 25.0,
          entryTime: "2024-07-22 10:00",
          exitTime: "2024-07-22 10:30",
        },
        {
          id: "TRD002",
          type: "SELL",
          symbol: "GBPUSD",
          entryPrice: 1.27,
          exitPrice: null,
          status: "Open",
          profit: null,
          entryTime: "2024-07-22 11:15",
          exitTime: null,
        },
        {
          id: "TRD003",
          type: "BUY",
          symbol: "USDJPY",
          entryPrice: 157.2,
          exitPrice: 157.0,
          status: "Closed",
          profit: -20.0,
          entryTime: "2024-07-22 09:00",
          exitTime: "2024-07-22 09:45",
        },
      ],
    },
    {
      id: 102,
      name: "ScalperBot Alpha",
      status: "Paused",
      broker: "Binance",
      connectedApp: "Custom API",
      currentProfitLoss: -5.2,
      openTrades: 0,
      closedTrades: 50,
      lastActivity: "1 hour ago",
      trades: [
        {
          id: "TRD004",
          type: "BUY",
          symbol: "BTCUSDT",
          entryPrice: 60000,
          exitPrice: 60050,
          status: "Closed",
          profit: 50.0,
          entryTime: "2024-07-21 14:00",
          exitTime: "2024-07-21 14:05",
        },
        {
          id: "TRD005",
          type: "SELL",
          symbol: "ETHUSDT",
          entryPrice: 3200,
          exitPrice: 3210,
          status: "Closed",
          profit: -10.0,
          entryTime: "2024-07-21 14:10",
          exitTime: "2024-07-21 14:12",
        },
      ],
    },
  ])

  // Mock data for production-ready bots (should ideally come from a global state or API)
  const productionReadyBots: Bot[] = [
    {
      id: 1,
      name: "TrendFollower v2",
      language: "Python",
      status: "Production Ready",
      lastRun: "2024-07-20",
      trades: 125,
      code: "...",
      accuracy: 68,
      winRate: 0.68,
      totalProfitLoss: 1520.3,
      consecutiveWins: 7,
      consecutiveLosses: 3,
      winAmount: 2500,
      lossAmount: 979.7,
    },
    {
      id: 3,
      name: "Arbitrage Bot",
      language: "C++",
      status: "Production Ready",
      lastRun: "2024-07-15",
      trades: 210,
      code: "...",
      accuracy: 75,
      winRate: 0.75,
      totalProfitLoss: 3200.0,
      consecutiveWins: 10,
      consecutiveLosses: 1,
      winAmount: 4000,
      lossAmount: 800,
    },
    {
      id: 5, // New mock bot
      name: "Volatility Catcher",
      language: "JavaScript",
      status: "Production Ready",
      lastRun: "2024-07-23",
      trades: 90,
      code: "...",
      accuracy: 60,
      winRate: 0.6,
      totalProfitLoss: 950.0,
      consecutiveWins: 5,
      consecutiveLosses: 2,
      winAmount: 1800,
      lossAmount: 850,
    },
  ]

  const [isTradeDetailsModalOpen, setIsTradeDetailsModalOpen] = useState(false)
  const [selectedBotTrades, setSelectedBotTrades] = useState<LiveBot["trades"]>([])
  const [selectedBotName, setSelectedBotName] = useState("")
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)
  const [selectedBotToDeploy, setSelectedBotToDeploy] = useState<number | null>(null)
  const [isDeploying, setIsDeploying] = useState(false)

  const handleToggleStatus = (botId: number) => {
    setLiveBots((prevBots) =>
      prevBots.map((bot) =>
        bot.id === botId ? { ...bot, status: bot.status === "Active" ? "Paused" : "Active" } : bot,
      ),
    )
    toast({
      title: "Bot Status Updated",
      description: "Bot status has been toggled.",
      variant: "default",
    })
  }

  const handleRestartBot = (botId: number) => {
    toast({
      title: "Restarting Bot...",
      description: `Bot ID ${botId} is restarting.`,
      variant: "default",
    })
    // Simulate restart
    setTimeout(() => {
      setLiveBots((prevBots) =>
        prevBots.map((bot) => (bot.id === botId ? { ...bot, status: "Active", lastActivity: "just now" } : bot)),
      )
      toast({
        title: "Bot Restarted!",
        description: `Bot ID ${botId} is now active.`,
        variant: "success",
      })
    }, 1500)
  }

  const handleStopBot = (botId: number) => {
    toast({
      title: "Stopping Bot...",
      description: `Bot ID ${botId} is stopping.`,
      variant: "default",
    })
    // Simulate stop
    setTimeout(() => {
      setLiveBots((prevBots) =>
        prevBots.map((bot) => (bot.id === botId ? { ...bot, status: "Stopped", openTrades: 0 } : bot)),
      )
      toast({
        title: "Bot Stopped!",
        description: `Bot ID ${botId} has been stopped.`,
        variant: "default",
      })
    }, 1500)
  }

  const handleViewTradeDetails = (trades: LiveBot["trades"], botName: string) => {
    setSelectedBotTrades(trades)
    setSelectedBotName(botName)
    setIsTradeDetailsModalOpen(true)
  }

  const handleDeployBot = () => {
    if (selectedBotToDeploy === null) {
      toast({
        title: "No Bot Selected",
        description: "Please select a bot to deploy.",
        variant: "destructive",
      })
      return
    }

    setIsDeploying(true)
    toast({
      title: "Deploying Bot...",
      description: `Deploying bot ID ${selectedBotToDeploy} to live.`,
      variant: "default",
    })

    setTimeout(() => {
      const botToDeploy = productionReadyBots.find((bot) => bot.id === selectedBotToDeploy)
      if (botToDeploy) {
        const newLiveBot: LiveBot = {
          id: Date.now(), // Unique ID for live instance
          name: `${botToDeploy.name} (Live)`,
          status: "Active",
          broker: "Simulated Broker", // Placeholder
          connectedApp: "Momo VPS", // Placeholder
          currentProfitLoss: 0,
          openTrades: 0,
          closedTrades: 0,
          lastActivity: "just now",
          trades: [],
        }
        setLiveBots((prev) => [...prev, newLiveBot])
        toast({
          title: "Bot Deployed!",
          description: `${newLiveBot.name} is now live.`,
          variant: "success",
        })
      } else {
        toast({
          title: "Deployment Failed",
          description: "Could not find the selected bot.",
          variant: "destructive",
        })
      }
      setIsDeploying(false)
      setIsDeployModalOpen(false)
      setSelectedBotToDeploy(null)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-spotify-black font-sans text-spotify-text-primary py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <h1 className="font-display text-3xl font-bold text-spotify-text-primary mb-4 animate-fade-in-up">
          Live Bots Dashboard
        </h1>
        <p className="text-spotify-text-secondary text-sm mb-8 animate-fade-in-up animation-delay-200">
          Monitor and manage your active trading bots running on VPS and connected apps.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {liveBots.map((bot, index) => (
            <Card
              key={bot.id}
              className="shadow-sm border-spotify-grey bg-spotify-dark-grey animate-fade-in-up rounded-lg"
              style={{ animationDelay: `${300 + index * 75}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold text-spotify-text-primary">{bot.name}</CardTitle>
                  <CardDescription className="text-xs text-spotify-text-secondary">
                    Broker: {bot.broker} | App: {bot.connectedApp}
                  </CardDescription>
                </div>
                <Badge
                  className={
                    bot.status === "Active"
                      ? "bg-spotify-green/20 text-spotify-green border-spotify-green"
                      : bot.status === "Paused"
                        ? "bg-spotify-light-grey/20 text-spotify-light-grey border-spotify-light-grey"
                        : "bg-destructive-foreground/20 text-destructive-foreground border-destructive-foreground"
                  }
                >
                  {bot.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-spotify-text-primary">
                <p className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-spotify-green" /> Current P/L:{" "}
                  <span className={bot.currentProfitLoss >= 0 ? "text-spotify-green" : "text-destructive-foreground"}>
                    {bot.currentProfitLoss.toFixed(2)} KES
                  </span>
                </p>
                <p className="flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-2 text-spotify-green" /> Open Trades: {bot.openTrades}
                </p>
                <p className="flex items-center">
                  <ArrowDownLeft className="h-4 w-4 mr-2 text-spotify-text-secondary" /> Closed Trades:{" "}
                  {bot.closedTrades}
                </p>
                <p className="flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-spotify-text-secondary" /> Last Activity: {bot.lastActivity}
                </p>
                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-spotify-green text-spotify-green hover:bg-spotify-green/10 bg-transparent transition-all duration-200 hover:scale-105 rounded-full"
                    onClick={() => handleToggleStatus(bot.id)}
                  >
                    {bot.status === "Active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-spotify-grey text-spotify-text-primary hover:bg-spotify-grey/50 bg-transparent transition-all duration-200 hover:scale-105 rounded-full"
                    onClick={() => handleRestartBot(bot.id)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-destructive-foreground/10 text-destructive-foreground hover:bg-destructive-foreground/20 transition-all duration-200 hover:scale-105 rounded-full"
                    onClick={() => handleStopBot(bot.id)}
                  >
                    <StopCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-spotify-grey text-spotify-text-primary hover:bg-spotify-grey/50 bg-transparent transition-all duration-200 hover:scale-105 rounded-full"
                    onClick={() => handleViewTradeDetails(bot.trades, bot.name)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Page-specific CTA */}
        <div className="mt-12 text-center animate-fade-in-up animation-delay-500">
          <h2 className="font-display text-2xl font-bold text-spotify-text-primary mb-4">Deploy More Bots to Live!</h2>
          <p className="text-spotify-text-secondary text-sm mb-6">
            Connect your perfected strategies to live markets and monitor their performance here.
          </p>
          <Button
            size="lg"
            className="bg-spotify-green text-spotify-black hover:bg-spotify-green/90 transition-all duration-300 hover:scale-105 rounded-full"
            onClick={() => setIsDeployModalOpen(true)}
          >
            <Zap className="mr-2 h-4 w-4" /> Deploy a Bot Live
          </Button>
        </div>
      </div>

      <Dialog open={isTradeDetailsModalOpen} onOpenChange={setIsTradeDetailsModalOpen}>
        <DialogContent className="sm:max-w-[900px] bg-spotify-dark-grey text-spotify-text-primary border-spotify-grey rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-spotify-green">{selectedBotName} - Trade Details</DialogTitle>
            <DialogDescription className="text-spotify-text-secondary">
              Overview of opened and closed trades for this bot.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Table>
              <TableHeader>
                <TableRow className="border-spotify-grey">
                  <TableHead className="text-spotify-text-secondary">ID</TableHead>
                  <TableHead className="text-spotify-text-secondary">Type</TableHead>
                  <TableHead className="text-spotify-text-secondary">Symbol</TableHead>
                  <TableHead className="text-spotify-text-secondary">Entry Price</TableHead>
                  <TableHead className="text-spotify-text-secondary">Exit Price</TableHead>
                  <TableHead className="text-spotify-text-secondary">Status</TableHead>
                  <TableHead className="text-spotify-text-secondary">Profit/Loss</TableHead>
                  <TableHead className="text-spotify-text-secondary">Entry Time</TableHead>
                  <TableHead className="text-spotify-text-secondary">Exit Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedBotTrades.map((trade) => (
                  <TableRow key={trade.id} className="border-spotify-grey">
                    <TableCell className="font-medium">{trade.id}</TableCell>
                    <TableCell className={trade.type === "BUY" ? "text-spotify-green" : "text-destructive-foreground"}>
                      {trade.type}
                    </TableCell>
                    <TableCell>{trade.symbol}</TableCell>
                    <TableCell>{trade.entryPrice.toFixed(4)}</TableCell>
                    <TableCell>{trade.exitPrice ? trade.exitPrice.toFixed(4) : "N/A"}</TableCell>
                    <TableCell>{trade.status}</TableCell>
                    <TableCell
                      className={
                        trade.profit !== null
                          ? trade.profit >= 0
                            ? "text-spotify-green"
                            : "text-destructive-foreground"
                          : "text-spotify-text-secondary"
                      }
                    >
                      {trade.profit !== null ? `${trade.profit.toFixed(2)} KES` : "N/A"}
                    </TableCell>
                    <TableCell>{trade.entryTime}</TableCell>
                    <TableCell>{trade.exitTime || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeployModalOpen} onOpenChange={setIsDeployModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-spotify-dark-grey text-spotify-text-primary border-spotify-grey rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-spotify-green">Deploy Production-Ready Bot</DialogTitle>
            <DialogDescription className="text-spotify-text-secondary">
              Select a bot that has passed backtesting to deploy live.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bot-to-deploy" className="text-sm text-spotify-text-primary">
                Select Bot
              </Label>
              <Select
                onValueChange={(value) => setSelectedBotToDeploy(Number(value))}
                value={selectedBotToDeploy?.toString() || ""}
              >
                <SelectTrigger
                  id="bot-to-deploy"
                  className="text-sm border-spotify-grey focus:border-spotify-green bg-spotify-black text-spotify-text-primary rounded-md"
                >
                  <SelectValue placeholder="Choose a production-ready bot" />
                </SelectTrigger>
                <SelectContent className="bg-spotify-dark-grey text-spotify-text-primary border-spotify-grey rounded-md">
                  {productionReadyBots.map((bot) => (
                    <SelectItem key={bot.id} value={bot.id.toString()}>
                      {bot.name} (Accuracy: {bot.accuracy}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleDeployBot}
              disabled={isDeploying || selectedBotToDeploy === null}
              className="w-full bg-spotify-green text-spotify-black hover:bg-spotify-green/90 transition-all duration-300 hover:scale-105 rounded-full"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deploying...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" /> Confirm Deployment
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
