"use client"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle, Play, Pause, Trash2, Code, Download, Loader2, CheckCircle, X, Repeat } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

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

export default function BotsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [bots, setBots] = useState<Bot[]>([
    {
      id: 1,
      name: "TrendFollower v2",
      language: "Python",
      status: "Running",
      lastRun: "2024-07-20",
      trades: 125,
      code: "print('Hello from TrendFollower v2!')\n# Your Python trading logic here\n# This bot follows trends.\n# Default 50 Moving Average logic assumed for backtesting.",
      accuracy: 68,
      winRate: 0.68,
      totalProfitLoss: 1520.3,
      consecutiveWins: 7,
      consecutiveLosses: 3,
      winAmount: 2500,
      lossAmount: 979.7,
    },
    {
      id: 2,
      name: "Scalper Pro",
      language: "JavaScript",
      status: "Paused",
      lastRun: "2024-07-18",
      trades: 89,
      code: "console.log('Hello from Scalper Pro!');\n// Your JavaScript trading logic here\n// This bot executes quick trades.\n// Default 50 Moving Average logic assumed for backtesting.",
      accuracy: 42,
      winRate: 0.42,
      totalProfitLoss: -310.75,
      consecutiveWins: 2,
      consecutiveLosses: 5,
      winAmount: 1200,
      lossAmount: 1510.75,
    },
    {
      id: 3,
      name: "Arbitrage Bot",
      language: "C++",
      status: "Stopped",
      lastRun: "2024-07-15",
      trades: 210,
      code: '#include <iostream>\nint main() { std::cout << "Hello from Arbitrage Bot!" << std::endl; return 0; } // This bot exploits price differences.\n// Default 50 Moving Average logic assumed for backtesting.',
      accuracy: 75,
      winRate: 0.75,
      totalProfitLoss: 3200.0,
      consecutiveWins: 10,
      consecutiveLosses: 1,
      winAmount: 4000,
      lossAmount: 800,
    },
    {
      id: 4,
      name: "Momentum Hunter",
      language: "Python",
      status: "Running",
      lastRun: "2024-07-22",
      trades: 78,
      code: "import pandas as pd\n# Your advanced Python trading logic here\n# This bot captures market momentum.\n# Default 50 Moving Average logic assumed for backtesting.",
      accuracy: 55,
      winRate: 0.55,
      totalProfitLoss: 850.5,
      consecutiveWins: 4,
      consecutiveLosses: 2,
      winAmount: 1500,
      lossAmount: 649.5,
    },
  ])

  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false)
  const [currentBotCode, setCurrentBotCode] = useState("")
  const [currentBotName, setCurrentBotName] = useState("")
  const [compilationStatus, setCompilationStatus] = useState<{
    botId: number | null
    status: "idle" | "compiling" | "success" | "error"
    log: string
  }>({ botId: null, status: "idle", log: "" })
  const [isGeneratingAndBacktesting, setIsGeneratingAndBacktesting] = useState(false)

  const handleViewCode = (botCode: string, botName: string) => {
    setCurrentBotCode(botCode)
    setCurrentBotName(botName)
    setIsCodeModalOpen(true)
  }

  const handleDownloadBot = (bot: Bot) => {
    const element = document.createElement("a")
    const file = new Blob([bot.code], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    const fileExtension =
      bot.language.toLowerCase() === "python"
        ? "py"
        : bot.language.toLowerCase() === "javascript"
          ? "js"
          : bot.language.toLowerCase() === "c++"
            ? "cpp"
            : bot.language.toLowerCase() === "rust"
              ? "rs"
              : bot.language.toLowerCase() === "pinescript"
                ? "pine"
                : bot.language.toLowerCase() === "mql5"
                  ? "mq5"
                  : bot.language.toLowerCase() === "mql4"
                    ? "mq4"
                    : bot.language.toLowerCase() === "elixir"
                      ? "ex"
                      : "json" // For DBots
    element.download = `${bot.name.replace(/\s/g, "_")}.${fileExtension}`
    document.body.appendChild(element) // Required for Firefox
    element.click()
    document.body.removeChild(element) // Clean up
    toast({
      title: "Bot Downloaded!",
      description: `${bot.name} has been downloaded.`,
      variant: "default",
    })
  }

  const handleCompileBot = (botId: number) => {
    setCompilationStatus({ botId, status: "compiling", log: "Starting compilation...\n" })

    setTimeout(() => {
      const randomSuccess = Math.random() > 0.3 // 70% success rate
      if (randomSuccess) {
        setCompilationStatus((prev) => ({
          ...prev,
          status: "success",
          log: prev.log + "Compilation successful! Bot is ready to run.\n",
        }))
        setBots((prevBots) => prevBots.map((bot) => (bot.id === botId ? { ...bot, status: "Running" } : bot)))
        toast({
          title: "Compilation Successful!",
          description: `Bot ID ${botId} compiled and is now running.`,
          variant: "default",
        })
      } else {
        setCompilationStatus((prev) => ({
          ...prev,
          status: "error",
          log: prev.log + "Compilation failed: Syntax error in line 15. Please check your code.\n",
        }))
        setBots((prevBots) => prevBots.map((bot) => (bot.id === botId ? { ...bot, status: "Stopped" } : bot)))
        toast({
          title: "Compilation Failed!",
          description: `Bot ID ${botId} encountered an error during compilation.`,
          variant: "destructive",
        })
      }
    }, 2000) // Simulate 2-second compilation
  }

  const handleToggleBotStatus = (botId: number, currentStatus: string) => {
    if (currentStatus === "Running") {
      setBots((prevBots) => prevBots.map((bot) => (bot.id === botId ? { ...bot, status: "Paused" } : bot)))
      toast({
        title: "Bot Paused",
        description: `Bot ID ${botId} has been paused.`,
        variant: "default",
      })
    } else {
      // If not running, attempt to compile/run
      handleCompileBot(botId)
    }
  }

  const handleGenerateAndBacktestBot = async () => {
    setIsGeneratingAndBacktesting(true)
    toast({
      title: "Generating and Backtesting...",
      description: "Momo is creating a new bot and simulating a backtest.",
      variant: "default",
    })

    try {
      // Simulate AI generation
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const generatedName = `AutoBot-${Date.now().toString().slice(-4)}`
      const generatedLanguage = [
        "Python",
        "JavaScript",
        "C++",
        "Rust",
        "PineScript",
        "MQL5",
        "MQL4",
        "Elixir",
        "DBots",
      ][Math.floor(Math.random() * 9)]
      const generatedCode = `# Auto-generated bot code for ${generatedName} in ${generatedLanguage}.\n# Includes mandatory 50 MA, Risk-to-Reward, Money Management, and Volume check.\n\n# Your actual trading logic would be generated here by AI\n# For backtesting, a simple 50 MA crossover logic is assumed to be present.\n`

      // Simulate backtesting
      await new Promise((resolve) => setTimeout(resolve, 3000))
      const newBot: Bot = {
        id: bots.length + 1,
        name: generatedName,
        language: generatedLanguage,
        status: "Production Ready", // Assume it passes the 40% threshold for auto-generated
        lastRun: new Date().toISOString().split("T")[0],
        trades: Math.floor(Math.random() * 500) + 50,
        code: generatedCode,
        accuracy: Math.floor(Math.random() * (90 - 45 + 1)) + 45, // 45-90% accurate
        winRate: Math.random() * 0.45 + 0.45, // 45-90% win rate
        totalProfitLoss: Math.random() * 5000 - 1000, // -1000 to 4000 profit/loss
        consecutiveWins: Math.floor(Math.random() * 10) + 1,
        consecutiveLosses: Math.floor(Math.random() * 5) + 1,
        winAmount: Math.floor(Math.random() * 3000) + 500,
        lossAmount: Math.floor(Math.random() * 1000) + 100,
      }

      setBots((prevBots) => [...prevBots, newBot])
      toast({
        title: "Bot Generated & Backtested!",
        description: `${newBot.name} is ready. Accuracy: ${newBot.accuracy}%.`,
        variant: "success",
      })
    } catch (error) {
      console.error("Error generating and backtesting bot:", error)
      toast({
        title: "Error",
        description: "Failed to generate and backtest bot.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingAndBacktesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-spotify-black font-sans text-spotify-text-primary py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-3xl font-bold text-spotify-text-primary animate-fade-in-up">
            My Trading Bots
          </h1>
          <Link href="/bots/create">
            <Button className="bg-spotify-green text-spotify-black hover:bg-spotify-green/90 transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-200 rounded-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Bot
            </Button>
          </Link>
        </div>
        <p className="text-spotify-text-secondary text-sm mb-8 animate-fade-in-up animation-delay-300">
          Manage your automated trading strategies. For live bot management and detailed stats, visit the{" "}
          <Link href="/live-bots" className="text-spotify-green hover:underline">
            Live Bots
          </Link>{" "}
          section.
        </p>

        <div className="flex justify-center mb-8 animate-fade-in-up animation-delay-400">
          <Button
            onClick={handleGenerateAndBacktestBot}
            disabled={isGeneratingAndBacktesting}
            className="bg-spotify-green text-spotify-black hover:bg-spotify-green/90 transition-all duration-300 hover:scale-105 rounded-full"
          >
            {isGeneratingAndBacktesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating & Backtesting...
              </>
            ) : (
              <>
                <Repeat className="mr-2 h-4 w-4" /> Generate & Backtest a Bot
              </>
            )}
          </Button>
        </div>

        {compilationStatus.status !== "idle" && (
          <Card className="mb-8 p-4 bg-spotify-dark-grey border-spotify-grey rounded-lg animate-fade-in-up animation-delay-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-spotify-text-primary flex items-center">
                {compilationStatus.status === "compiling" && (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-spotify-green" />
                )}
                {compilationStatus.status === "success" && <CheckCircle className="mr-2 h-5 w-5 text-spotify-green" />}
                {compilationStatus.status === "error" && <X className="mr-2 h-5 w-5 text-destructive-foreground" />}
                Compilation Log for Bot ID: {compilationStatus.botId}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-spotify-black p-3 rounded-md text-xs font-mono overflow-auto max-h-40 text-spotify-text-secondary">
                {compilationStatus.log}
              </pre>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot, index) => (
            <Card
              key={bot.id}
              className="shadow-sm border-spotify-grey bg-spotify-dark-grey animate-fade-in-up rounded-lg"
              style={{ animationDelay: `${300 + index * 75}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold text-spotify-text-primary">{bot.name}</CardTitle>
                  <CardDescription className="text-xs text-spotify-text-secondary">
                    Language: {bot.language} | Status: {bot.status}
                  </CardDescription>
                </div>
                {bot.accuracy > 40 && (
                  <Badge className="bg-spotify-green/20 text-spotify-green border-spotify-green">
                    Production Ready
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-spotify-text-primary">
                <p>Last Run: {bot.lastRun}</p>
                <p>Total Trades: {bot.trades}</p>
                <p>Accuracy: {bot.accuracy}%</p>
                <p>
                  Total P/L:{" "}
                  <span className={bot.totalProfitLoss >= 0 ? "text-spotify-green" : "text-destructive-foreground"}>
                    {bot.totalProfitLoss.toFixed(2)} KES
                  </span>
                </p>
                <p>
                  Consecutive Wins: {bot.consecutiveWins} {bot.winAmount > 0 && `(${bot.winAmount.toFixed(2)} KES)`}
                </p>
                <p>
                  Consecutive Losses: {bot.consecutiveLosses}{" "}
                  {bot.lossAmount > 0 && `(${bot.lossAmount.toFixed(2)} KES)`}
                </p>
                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-spotify-green text-spotify-green hover:bg-spotify-green/10 bg-transparent transition-all duration-200 hover:scale-105 rounded-full"
                    onClick={() => handleToggleBotStatus(bot.id, bot.status)}
                    disabled={compilationStatus.status === "compiling" && compilationStatus.botId === bot.id}
                  >
                    {compilationStatus.status === "compiling" && compilationStatus.botId === bot.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : bot.status === "Running" ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  {/* Removed Edit button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-spotify-grey text-spotify-text-primary hover:bg-spotify-grey/50 bg-transparent transition-all duration-200 hover:scale-105 rounded-full"
                    onClick={() => handleViewCode(bot.code, bot.name)}
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-spotify-grey text-spotify-text-primary hover:bg-spotify-grey/50 bg-transparent transition-all duration-200 hover:scale-105 rounded-full"
                    onClick={() => handleDownloadBot(bot)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {/* Removed Schedule button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-destructive-foreground/10 text-destructive-foreground hover:bg-destructive-foreground/20 transition-all duration-200 hover:scale-105 rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Page-specific CTA */}
        <div className="mt-12 text-center animate-fade-in-up animation-delay-500">
          <h2 className="font-display text-2xl font-bold text-spotify-text-primary mb-4">
            Ready to Create Your First Bot?
          </h2>
          <p className="text-spotify-text-secondary text-sm mb-6">
            Dive into our intuitive editor and bring your trading strategy to life.
          </p>
          <Link href="/bots/create">
            <Button
              size="lg"
              className="bg-spotify-green text-spotify-black hover:bg-spotify-green/90 transition-all duration-300 hover:scale-105 rounded-full"
            >
              Start Building Now!
            </Button>
          </Link>
        </div>
      </div>

      <Dialog open={isCodeModalOpen} onOpenChange={setIsCodeModalOpen}>
        <DialogContent className="sm:max-w-[800px] bg-spotify-dark-grey text-spotify-text-primary border-spotify-grey rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-spotify-green">{currentBotName} Source Code</DialogTitle>
            <DialogDescription className="text-spotify-text-secondary">
              View and copy your bot's source code.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              readOnly
              value={currentBotCode}
              className="h-96 font-mono text-sm bg-spotify-black border-spotify-grey text-spotify-text-primary rounded-md"
            />
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
