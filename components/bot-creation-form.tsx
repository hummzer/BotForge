"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, CheckCircle, Download, Code, Loader2, X, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { InteractiveChartPlaceholder } from "@/components/interactive-chart-placeholder" // Updated import path
import { Badge } from "@/components/ui/badge"

// Loading Overlay Component
function LoadingOverlay() {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
    </div>
  )
}

export function BotCreationForm() {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [botName, setBotName] = useState("")
  const [botLanguage, setBotLanguage] = useState("Python")
  const [botDescription, setBotDescription] = useState("")
  const [botCode, setBotCode] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("default")
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]) // New state for indicators
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false)
  const [compilationLog, setCompilationLog] = useState("")
  const [compilationStatus, setCompilationStatus] = useState<"idle" | "compiling" | "success" | "error">("idle")
  const [naturalLanguagePrompt, setNaturalLanguagePrompt] = useState("")
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)

  const router = useRouter()

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  const defaultCodeTemplates = {
    Python: {
      default: `def trading_strategy(data):\n    # Your Python trading logic here\n    # This bot follows trends using a default 50 Moving Average (assumed for backtesting).\n    # Includes mandatory Risk-to-Reward, Money Management, and Volume check.\n    # Example: Buy if price increases, sell if decreases\n    if data.get('price', 0) > data.get('prev_price', 0):\n        return 'BUY'\n    elif data.get('price', 0) < data.get('prev_price', 0):\n        return 'SELL'\n    return 'HOLD'\n`,
      "Trailing Stop Loss": `def trading_strategy(data, current_position, entry_price, high_price_since_entry):\n    # Implement a trailing stop loss strategy\n    # Mandatory: Includes Risk-to-Reward, Money Management, and Volume check.\n    # Default 50 Moving Average logic assumed for backtesting if not explicitly defined.\n\n    # ... (code for trailing stop loss, volume check, etc.)\n    return 'HOLD'\n`,
      "Risk Management (SL/TP)": `def trading_strategy(data, current_position, entry_price):\n    # Implement fixed Stop Loss (SL) and Take Profit (TP) levels\n    # Mandatory: Includes Risk-to-Reward, Money Management, and Volume check.\n    # Default 50 Moving Average logic assumed for backtesting if not explicitly defined.\n\n    # ... (code for SL/TP, volume check, etc.)\n    return 'HOLD'\n`,
      "RSI Crossover (Mandatory)": `def trading_strategy(data, rsi_period=14, overbought=70, oversold=30):\n    # MANDATORY STRATEGY: RSI Crossover\n    # Also includes mandatory Risk-to-Reward, Money Management, and Volume check.\n    # Default 50 Moving Average logic assumed for backtesting.\n\n    # ... (RSI calculation and crossover logic)\n    # ... (Risk management and volume check logic)\n    return 'HOLD'\n`,
      "MACD Divergence (Optional)": `def trading_strategy(data):\n    # OPTIONAL STRATEGY: MACD Divergence\n    # Includes mandatory Risk-to-Reward, Money Management, and Volume check.\n    # Default 50 Moving Average logic assumed for backtesting.\n\n    # ... (MACD calculation and divergence logic)\n    # ... (Risk management and volume check logic)\n    return 'HOLD'\n`,
    },
    JavaScript: {
      default: `function tradingStrategy(data) {\n  // Your JavaScript trading logic here\n  // This bot follows trends using a default 50 Moving Average (assumed for backtesting).\n  // Includes mandatory Risk-to-Reward, Money Management, and Volume check.\n  // Example: Buy if price increases, sell if decreases\n  if (data.price > data.prev_price) {\n    return 'BUY';\n  } else if (data.price < data.prev_price) {\n    return 'SELL';\n  }\n  return 'HOLD';\n}\n`,
      "Trailing Stop Loss": `function tradingStrategy(data, currentPosition, entryPrice, highPriceSinceEntry) {\n  // Implement a trailing stop loss strategy\n  // Mandatory: Includes Risk-to-Reward, Money Management, and Volume check.\n  // Default 50 Moving Average logic assumed for backtesting if not explicitly defined.\n\n  // ... (code for trailing stop loss, volume check, etc.)\n  return 'HOLD';\n}\n`,
      "Risk Management (SL/TP)": `function tradingStrategy(data, currentPosition, entryPrice) {\n  // Implement fixed Stop Loss (SL) and Take Profit (TP) levels\n  // Mandatory: Includes Risk-to-Reward, Money Management, and Volume check.\n  // Default 50 Moving Average logic assumed for backtesting if not explicitly defined.\n\n  // ... (code for SL/TP, volume check, etc.)\n  return 'HOLD';\n}\n`,
      "RSI Crossover (Mandatory)": `function tradingStrategy(data, rsiPeriod = 14, overbought = 70, oversold = 30) {\n  // MANDATORY STRATEGY: RSI Crossover\n  // Also includes mandatory Risk-to-Reward, Money Management, and Volume check.\n  // Default 50 Moving Average logic assumed for backtesting.\n\n  // ... (RSI calculation and crossover logic)\n  // ... (Risk management and volume check logic)\n  return 'HOLD';\n}\n`,
      "MACD Divergence (Optional)": `function tradingStrategy(data) {\n  // OPTIONAL STRATEGY: MACD Divergence\n  // Includes mandatory Risk-to-Reward, Money Management, and Volume check.\n  // Default 50 Moving Average logic assumed for backtesting.\n\n  // ... (MACD calculation and divergence logic)\n  // ... (Risk management and volume check logic)\n  return 'HOLD';\n}\n`,
    },
    "C++": {
      default: `#include <iostream>\n#include <string>\n\n// Your C++ trading logic here\n// This bot follows trends using a default 50 Moving Average (assumed for backtesting).\n// Includes mandatory Risk-to-Reward, Money Management, and Volume check.\n// Example: Buy if price increases, sell if decreases\nstd::string tradingStrategy(double price, double prev_price) {\n    if (price > prev_price) {\n        return "BUY";\n    } else if (price < prev_price) {\n        return "SELL";\n    }\n    return "HOLD";\n}\n\n// ... (main function and other C++ specific setups)\n`,
      "Trailing Stop Loss": `#include <iostream>\n#include <string>\n\n// Implement a trailing stop loss strategy\n// Mandatory: Includes Risk-to-Reward, Money Management, and Volume check.\n// Default 50 Moving Average logic assumed for backtesting if not explicitly defined.\n\n// ... (code for trailing stop loss, volume check, etc.)\nstd::string tradingStrategy(...) { return "HOLD"; }\n`,
      "Risk Management (SL/TP)": `#include <iostream>\n#include <string>\n\n// Implement fixed Stop Loss (SL) and Take Profit (TP) levels\n// Mandatory: Includes Risk-to-Reward, Money Management, and Volume check.\n// Default 50 Moving Average logic assumed for backtesting if not explicitly defined.\n\n// ... (code for SL/TP, volume check, etc.)\nstd::string tradingStrategy(...) { return "HOLD"; }\n`,
      "RSI Crossover (Mandatory)": `#include <iostream>\n#include <string>\n\n// MANDATORY STRATEGY: RSI Crossover\n// Also includes mandatory Risk-to-Reward, Money Management, and Volume check.\n// Default 50 Moving Average logic assumed for backtesting.\n\n// ... (RSI calculation and crossover logic)\n// ... (Risk management and volume check logic)\nstd::string tradingStrategy(...) { return "HOLD"; }\n`,
      "MACD Divergence (Optional)": `#include <iostream>\n#include <string>\n\n// OPTIONAL STRATEGY: MACD Divergence\n// Includes mandatory Risk-to-Reward, Money Management, and Volume check.\n// Default 50 Moving Average logic assumed for backtesting.\n\n// ... (MACD calculation and divergence logic)\n// ... (Risk management and volume check logic)\nstd::string tradingStrategy(...) { return "HOLD"; }\n`,
    },
    Rust: {
      default: `fn trading_strategy(data: &std::collections::HashMap<String, f64>) -> String {\n    // Your Rust trading logic here\n    // This bot follows trends using a default 50 Moving Average (assumed for backtesting).\n    // Includes mandatory Risk-to-Reward, Money Management, and Volume check.\n    // Example: Buy if price increases, sell if decreases\n    let price = data.get("price").copied().unwrap_or(0.0);\n    let prev_price = data.get("prev_price").copied().unwrap_or(0.0);\n\n    if price > prev_price {\n        "BUY".to_string()\n    } else if price < prev_price {\n        "SELL".to_string()\n    } else {\n        "HOLD".to_string()\n    }\n}\n\n// ... (main function and other Rust specific setups)\n`,
      "Trailing Stop Loss": `fn trading_strategy(...) -> String {\n    // Implement a trailing stop loss strategy\n    // Mandatory: Includes Risk-to-Reward, Money Management, and Volume check.\n    // Default 50 Moving Average logic assumed for backtesting if not explicitly defined.\n\n    // ... (code for trailing stop loss, volume check, etc.)\n    "HOLD".to_string()\n}\n`,
      "Risk Management (SL/TP)": `fn trading_strategy(...) -> String {\n    // Implement fixed Stop Loss (SL) and Take Profit (TP) levels\n    // Mandatory: Includes Risk-to-Reward, Money Management, and Volume check.\n    // Default 50 Moving Average logic assumed for backtesting if not explicitly defined.\n\n    // ... (code for SL/TP, volume check, etc.)\n    "HOLD".to_string()\n}\n`,
      "RSI Crossover (Mandatory)": `fn trading_strategy(current_rsi: f64, overbought: f64, oversold: f64) -> String {\n    // MANDATORY STRATEGY: RSI Crossover\n    // Also includes mandatory Risk-to-Reward, Money Management, and Volume check.\n    // Default 50 Moving Average logic assumed for backtesting.\n\n    // ... (RSI calculation and crossover logic)\n    // ... (Risk management and volume check logic)\n    "HOLD".to_string()\n}\n`,
      "MACD Divergence (Optional)": `fn trading_strategy(macd: f64, signal_line: f64, prev_macd: f64, prev_signal_line: f64) -> String {\n    // OPTIONAL STRATEGY: MACD Divergence\n    // Includes mandatory Risk-to-Reward, Money Management, and Volume check.\n    // Default 50 Moving Average logic assumed for backtesting.\n\n    // ... (MACD calculation and divergence logic)\n    // ... (Risk management and volume check logic)\n    "HOLD".to_string()\n}\n`,
    },
    PineScript: {
      default: `//@version=5\nindicator("My Trading Strategy", overlay=true)\n\n// Your Pine Script trading logic here\n// This bot follows trends using a default 50 Moving Average (assumed for backtesting).\n// Includes mandatory Risk-to-Reward, Money Management, and Volume check.\n\n// ... (code for basic strategy, volume check, SL/TP)\nstrategy.entry("Long", strategy.long, when = close > open)\nstrategy.entry("Short", strategy.short, when = close < open)\n`,
      "Trailing Stop Loss": `//@version=5\nstrategy("Trailing Stop Loss Strategy", overlay=true)\n\n// Implement a trailing stop loss strategy\n// Mandatory: Includes Risk-to-Reward, Money Management, and Volume check.\n// Default 50 Moving Average logic assumed for backtesting if not explicitly defined.\n\n// ... (code for trailing stop loss, volume check, etc.)\n`,
      "Risk Management (SL/TP)": `//@version=5\nstrategy("Risk Management SL/TP", overlay=true, initial_capital=10000, default_qty_type=strategy.percent_of_equity, default_qty_value=10)\n\n// Implement fixed Stop Loss (SL) and Take Profit (TP) levels\n// Mandatory: Includes Risk-to-Reward, Money Management, and Volume check.\n// Default 50 Moving Average logic assumed for backtesting if not explicitly defined.\n\n// ... (code for SL/TP, volume check, etc.)\n`,
      "RSI Crossover (Mandatory)": `//@version=5\nstrategy("RSI Crossover Strategy (Mandatory)", overlay=true)\n\n// MANDATORY STRATEGY: RSI Crossover\n// Also includes mandatory Risk-to-Reward, Money Management, and Volume check.\n// Default 50 Moving Average logic assumed for backtesting.\n\n// ... (RSI calculation and crossover logic)\n// ... (Risk management and volume check logic)\n`,
      "MACD Divergence (Optional)": `//@version=5\nstrategy("MACD Divergence Strategy (Optional)", overlay=true)\n\n// OPTIONAL STRATEGY: MACD Divergence\n// Includes mandatory Risk-to-Reward, Money Management, and Volume check.\n// Default 50 Moving Average logic assumed for backtesting.\n\n// ... (MACD calculation and divergence logic)\n// ... (Risk management and volume check logic)\n`,
    },
    MQL5: {
      default: `//+------------------------------------------------------------------+\n//|                                                MyTradingBot.mq5 |\n//|                                                     Momo Platform |\n//+------------------------------------------------------------------+\n#property copyright "Momo Platform"\n#property version   "1.00"\n#property description "Default MQL5 Trading Bot. Incl. Mandatory Rules: RTR, SL/TP, Volume Check. 50 MA default."\n\n// ... (standard MQL5 structure)\nvoid OnTick()\n  {\n   // Your MQL5 trading logic here\n   // Example: Simple buy/sell logic, assuming 50 MA is handled by indicators/logic.\n   // Implement volume check before entry and apply SL/TP for all trades.\n  }\n`,
      "Trailing Stop Loss": `//+------------------------------------------------------------------+\n//|                                            TrailingStopLoss.mq5 |\n//|                                                     Momo Platform |\n//+------------------------------------------------------------------+\n#property copyright "Momo Platform"\n#property version   "1.00"\n#property description "MQL5 Trailing Stop Loss Strategy. Incl. Mandatory Rules: RTR, SL/TP, Volume Check. 50 MA default."\n\n// ... (code for trailing stop loss, volume check, etc.)\n`,
      "Risk Management (SL/TP)": `//+------------------------------------------------------------------+\n//|                                            RiskManagement.mq5 |\n//|                                                     Momo Platform |\n//+------------------------------------------------------------------+\n#property copyright "Momo Platform"\n#property version   "1.00"\n#property description "MQL5 Risk Management (SL/TP) Strategy. Incl. Mandatory Rules: RTR, SL/TP, Volume Check. 50 MA default."\n\n// ... (code for SL/TP, volume check, etc.)\n`,
      "RSI Crossover (Mandatory)": `//+------------------------------------------------------------------+\n//|                                                RSICrossover.mq5 |\n//|                                                     Momo Platform |\n//+------------------------------------------------------------------+\n#property copyright "Momo Platform"\n#property version   "1.00"\n#property description "MQL5 RSI Crossover Strategy (Mandatory). Incl. Mandatory Rules: RTR, SL/TP, Volume Check. 50 MA default."\n\n// ... (RSI calculation and crossover logic)\n// ... (Risk management and volume check logic)\n`,
      "MACD Divergence (Optional)": `//+------------------------------------------------------------------+\n//|                                            MACDDivergence.mq5 |\n//|                                                     Momo Platform |\n//+------------------------------------------------------------------+\n#property copyright "Momo Platform"\n#property version   "1.00"\n#property description "MQL5 MACD Divergence Strategy (Optional). Incl. Mandatory Rules: RTR, SL/TP, Volume Check. 50 MA default."\n\n// ... (MACD calculation and divergence logic)\n// ... (Risk management and volume check logic)\n`,
    },
    MQL4: {
      default: `//+------------------------------------------------------------------+\n//|                                                MyTradingBot.mq4 |\n//|                                                     Momo Platform |\n//+------------------------------------------------------------------+\n#property copyright "Momo Platform"\n#property version   "1.00"\n#property description "Default MQL4 Trading Bot. Incl. Mandatory Rules: RTR, SL/TP, Volume Check. 50 MA default."\n\n// ... (standard MQL4 structure)\nint start()\n  {\n   // Your MQL4 trading logic here\n   // Example: Simple buy/sell logic, assuming 50 MA is handled by indicators/logic.\n   // Implement volume check before entry and apply SL/TP for all trades.\n   return(0);\n  }\n`,
      "Trailing Stop Loss": `//+------------------------------------------------------------------+\n//|                                            TrailingStopLoss.mq4 |\n//|                                                     Momo Platform |\n//+------------------------------------------------------------------+\n#property copyright "Momo Platform"\n#property version   "1.00"\n#property description "MQL4 Trailing Stop Loss Strategy. Incl. Mandatory Rules: RTR, SL/TP, Volume Check. 50 MA default."\n\n// ... (code for trailing stop loss, volume check, etc.)\n`,
      "Risk Management (SL/TP)": `//+------------------------------------------------------------------+\n//|                                            RiskManagement.mq4 |\n//|                                                     Momo Platform |\n//+------------------------------------------------------------------+\n#property copyright "Momo Platform"\n#property version   "1.00"\n#property description "MQL4 Risk Management (SL/TP) Strategy. Incl. Mandatory Rules: RTR, SL/TP, Volume Check. 50 MA default."\n\n// ... (code for SL/TP, volume check, etc.)\n`,
      "RSI Crossover (Mandatory)": `//+------------------------------------------------------------------+\n//|                                                RSICrossover.mq4 |\n//|                                                     Momo Platform |\n//+------------------------------------------------------------------+\n#property copyright "Momo Platform"\n#property version   "1.00"\n#property description "MQL4 RSI Crossover Strategy (Mandatory). Incl. Mandatory Rules: RTR, SL/TP, Volume Check. 50 MA default."\n\n// ... (RSI calculation and crossover logic)\n// ... (Risk management and volume check logic)\n`,
      "MACD Divergence (Optional)": `//+------------------------------------------------------------------+\n//|                                            MACDDivergence.mq4 |\n//|                                                     Momo Platform |\n//+------------------------------------------------------------------+\n#property copyright "Momo Platform"\n#property version   "1.00"\n#property description "MQL4 MACD Divergence Strategy (Optional). Incl. Mandatory Rules: RTR, SL/TP, Volume Check. 50 MA default."\n\n// ... (MACD calculation and divergence logic)\n// ... (Risk management and volume check logic)\n`,
    },
    Elixir: {
      default: `defmodule MyTradingBot do\n  @moduledoc """\n  Your Elixir trading logic here.\n  This bot follows trends using a default 50 Moving Average (assumed for backtesting).\n  Includes mandatory Risk-to-Reward, Money Management, and Volume check.\n  """\n\n  def handle_tick(data) do\n    # ... (basic trading logic, volume check, SL/TP)\n    :hold\n  end\nend\n`,
      "Trailing Stop Loss": `defmodule TrailingStopLoss do\n  @moduledoc """\n  Elixir Trailing Stop Loss Strategy.\n  Mandatory: Includes Risk-to-Reward, Money Management, and Volume check.\n  Default 50 Moving Average logic assumed for backtesting if not explicitly defined.\n  """\n\n  def handle_tick(...) do\n    # ... (code for trailing stop loss, volume check, etc.)\n    :hold\n  end\nend\n`,
      "Risk Management (SL/TP)": `defmodule RiskManagement do\n  @moduledoc """\n  Elixir Risk Management (SL/TP) Strategy.\n  Mandatory: Includes Risk-to-Reward, Money Management, and Volume check.\n  Default 50 Moving Average logic assumed for backtesting if not explicitly defined.\n  """\n\n  def handle_tick(...) do\n    # ... (code for SL/TP, volume check, etc.)\n    :hold\n  end\nend\n`,
      "RSI Crossover (Mandatory)": `defmodule RSICrossover do\n  @moduledoc """\n  MANDATORY STRATEGY: Elixir RSI Crossover.\n  Also includes mandatory Risk-to-Reward, Money Management, and Volume check.\n  Default 50 Moving Average logic assumed for backtesting.\n  """\n\n  def handle_tick(...) do\n    # ... (RSI calculation and crossover logic)\n    # ... (Risk management and volume check logic)\n    :hold\n  end\nend\n`,
      "MACD Divergence (Optional)": `defmodule MACDDivergence do\n  @moduledoc """\n  OPTIONAL STRATEGY: Elixir MACD Divergence.\n  Includes mandatory Risk-to-Reward, Money Management, and Volume check.\n  Default 50 Moving Average logic assumed for backtesting.\n  """\n\n  def handle_tick(...) do\n    # ... (MACD calculation and divergence logic)\n    # ... (Risk management and volume check logic)\n    :hold\n  end\nend\n`,
    },
    DBots: {
      default: `{\n  "name": "MyDefaultBot",\n  "description": "A basic trading bot for Momo. Includes mandatory RTR, SL/TP, Volume Check. 50 MA default.",\n  "logic": [\n    {"type": "comment", "text": "Your DBot logic here. Assumes 50 MA for decisions, enforces RTR, SL/TP, and volume checks."},\n    {\n      "type": "condition",\n      "operator": "gt",\n      "operand1": {"type": "ohlc", "field": "close"}, \n      "operand2": {"type": "ohlc", "field": "open"},\n      "then": {"type": "action", "action": "buy", "amount": 10}\n    }\n  ]\n}`,
      "Trailing Stop Loss": `{\n  "name": "TrailingStopLossBot",\n  "description": "DBot with trailing stop loss. Incl. Mandatory Rules: RTR, SL/TP, Volume Check. 50 MA default.",\n  "logic": [\n    {"type": "comment", "text": "DBot logic for trailing stop loss. Also includes mandatory RTR, SL/TP, Volume Check."}\n  ]\n}`,
      "Risk Management (SL/TP)": `{\n  "name": "RiskManagementBot",\n  "description": "DBot with fixed Stop Loss and Take Profit. Incl. Mandatory Rules: RTR, SL/TP, Volume Check. 50 MA default.",\n  "logic": [\n    {"type": "comment", "text": "DBot logic for SL/TP. Also includes mandatory RTR, SL/TP, Volume Check."}\n  ]\n}`,
      "RSI Crossover (Mandatory)": `{\n  "name": "RSICrossoverBot",\n  "description": "Mandatory: DBot using RSI crossover strategy. Incl. Mandatory Rules: RTR, SL/TP, Volume Check. 50 MA default.",\n  "logic": [\n    {"type": "comment", "text": "DBot logic for RSI Crossover. Also includes mandatory RTR, SL/TP, Volume Check."}\n  ]\n}`,
      "MACD Divergence (Optional)": `{\n  "name": "MACDDivergenceBot",\n  "description": "Optional: DBot using MACD divergence strategy. Incl. Mandatory Rules: RTR, SL/TP, Volume Check. 50 MA default.",\n  "logic": [\n    {"type": "comment", "text": "DBot logic for MACD Divergence. Also includes mandatory RTR, SL/TP, Volume Check."}\n  ]\n}`,
    },
  }

  const strategyTemplates = {
    Mandatory: [
      { label: "RSI Crossover", value: "RSI Crossover (Mandatory)" },
      { label: "Risk Management (SL/TP)", value: "Risk Management (SL/TP)" },
    ],
    Optional: [
      { label: "Default (Basic Buy/Sell)", value: "default" },
      { label: "Trailing Stop Loss", value: "Trailing Stop Loss" },
      { label: "MACD Divergence", value: "MACD Divergence (Optional)" },
    ],
  }

  const indicatorOptions = [
    { label: "Moving Average (SMA)", value: "SMA" },
    { label: "Relative Strength Index (RSI)", value: "RSI" },
    { label: "Moving Average Convergence Divergence (MACD)", value: "MACD" },
    { label: "Bollinger Bands (BB)", value: "Bollinger Bands" },
    { label: "Stochastic Oscillator", value: "Stochastic Oscillator" },
    { label: "Average True Range (ATR)", value: "ATR" },
  ]

  // Initialize botCode with default code for the initial language on mount
  useEffect(() => {
    setBotCode(defaultCodeTemplates[botLanguage as keyof typeof defaultCodeTemplates].default)
  }, [])

  const handleLanguageChange = (value: string) => {
    setBotLanguage(value)
    setSelectedTemplate("default") // Reset template when language changes
    setBotCode(defaultCodeTemplates[value as keyof typeof defaultCodeTemplates].default)
    setCompilationStatus("idle") // Reset compilation status
    setCompilationLog("")
    setNaturalLanguagePrompt("") // Clear AI prompt
    setSelectedIndicators([]) // Clear selected indicators
  }

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value)
    setBotCode(
      defaultCodeTemplates[botLanguage as keyof typeof defaultCodeTemplates][
        value as keyof (typeof defaultCodeTemplates)["Python"]
      ],
    )
    setCompilationStatus("idle") // Reset compilation status
    setCompilationLog("")
    setNaturalLanguagePrompt("") // Clear AI prompt
    setSelectedIndicators([]) // Clear selected indicators
  }

  const handleIndicatorChange = (value: string) => {
    setSelectedIndicators((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value)
      } else {
        return [...prev, value]
      }
    })
    // Optionally, update botCode based on selected indicators (conceptual)
    setBotCode((prevCode) => {
      let updatedCode = prevCode
      if (value === "SMA") {
        updatedCode += `\n# Indicator Added: Simple Moving Average (SMA)`
      } else if (value === "RSI") {
        updatedCode += `\n# Indicator Added: Relative Strength Index (RSI)`
      }
      // Add more indicator-specific code snippets here
      return updatedCode
    })
  }

  const handleCompileBot = () => {
    setCompilationStatus("compiling")
    setCompilationLog("Compiling bot code...\n")

    setTimeout(() => {
      const randomSuccess = Math.random() > 0.2 // 80% success rate for compilation
      if (randomSuccess) {
        setCompilationLog((prev) => prev + "Compilation successful! No errors found.\n")
        setCompilationStatus("success")
        toast({
          title: "Compilation Successful!",
          description: "Your bot code compiled without errors.",
          variant: "default",
        })
      } else {
        const errorMessages = [
          "Error: Syntax error on line 25: Unexpected token '}'.",
          "Error: Undefined variable 'trade_volume' at line 10.",
          "Error: Function 'calculate_profit' not found.",
          "Warning: Unused variable 'debug_mode' at line 5.",
          "Error: Division by zero in 'price_calc' function.",
          "Error: Indicator 'SMA' not properly defined for period 50.",
          "Error: Missing closing parenthesis on line 18.",
          "Error: Risk-to-Reward ratio not explicitly defined in logic.",
          "Error: Money management (SL/TP) missing for trade entry.",
          "Error: Volume check missing before trade entry.",
        ]
        const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)]
        setCompilationLog((prev) => prev + `Compilation failed:\n${randomError}\n`)
        setCompilationStatus("error")
        toast({
          title: "Compilation Failed!",
          description: "Please check the compilation log for details.",
          variant: "destructive",
        })
      }
    }, 2000) // Simulate 2-second compilation
  }

  const handleGenerateCodeWithAI = async () => {
    if (naturalLanguagePrompt.trim() === "") {
      toast({
        title: "Input Required",
        description: "Please describe your strategy in natural language.",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingCode(true)
    setCompilationStatus("idle") // Reset compilation status
    setCompilationLog("Generating code with AI...\n")
    setBotCode("") // Clear current code

    try {
      const response = await fetch("/api/generate-bot-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ language: botLanguage, prompt: naturalLanguagePrompt }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setBotCode(data.code)
      setCompilationLog((prev) => prev + "AI code generation complete. Review and compile.\n")
      toast({
        title: "Code Generated!",
        description: "AI has generated code for your strategy.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error generating code with AI:", error)
      setCompilationLog((prev) => prev + "Failed to generate code with AI. Please try again.\n")
      toast({
        title: "AI Generation Failed",
        description: "Could not generate code. Please try again or refine your prompt.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // Final step: "create" bot and redirect
      console.log("Bot Created:", { botName, botLanguage, botDescription, botCode })
      toast({
        title: "Bot Created!",
        description: `${botName} has been successfully created.`,
        variant: "default",
      })
      router.push("/bots") // Redirect to bots list
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleDownloadBot = () => {
    const element = document.createElement("a")
    const file = new Blob([botCode], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    const fileExtension =
      botLanguage.toLowerCase() === "python"
        ? "py"
        : botLanguage.toLowerCase() === "javascript"
          ? "js"
          : botLanguage.toLowerCase() === "c++"
            ? "cpp"
            : botLanguage.toLowerCase() === "rust"
              ? "rs"
              : botLanguage.toLowerCase() === "pinescript"
                ? "pine"
                : botLanguage.toLowerCase() === "mql5"
                  ? "mq5"
                  : botLanguage.toLowerCase() === "mql4"
                    ? "mq4"
                    : botLanguage.toLowerCase() === "elixir"
                      ? "ex"
                      : "json" // For DBots
    element.download = `${botName.replace(/\s/g, "_")}.${fileExtension}`
    document.body.appendChild(element) // Required for Firefox
    element.click()
    document.body.removeChild(element) // Clean up
    toast({
      title: "Bot Downloaded!",
      description: `${botName} has been downloaded.`,
      variant: "default",
    })
  }

  const handleViewCode = () => {
    setIsCodeModalOpen(true)
  }

  return (
    <>
      {isGeneratingCode && <LoadingOverlay />}
      <Card className="shadow-lg border-spotify-grey bg-spotify-dark-grey rounded-lg animate-fade-in-up">
        <CardHeader className="pb-4 border-b border-spotify-grey">
          <CardTitle className="text-xl font-semibold text-spotify-text-primary">
            {step === 1 && "Bot Details"}
            {step === 2 && "Write Your Code"}
            {step === 3 && "Review & Finish"}
          </CardTitle>
          <CardDescription className="text-sm text-spotify-text-secondary">
            {step === 1 && "Provide basic information about your new trading bot."}
            {step === 2 && "Enter or modify the source code for your bot. Compile to check for errors."}
            {step === 3 && "Review your bot's details and finalize creation."}
          </CardDescription>
          <Progress
            value={progress}
            className="w-full mt-4 h-2 bg-spotify-grey [&::-webkit-progress-bar]:bg-spotify-grey [&::-webkit-progress-value]:bg-spotify-green [&::-moz-progress-bar]:bg-spotify-green"
          />
        </CardHeader>
        <CardContent className="p-6">
          {step === 1 && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bot-name" className="text-sm text-spotify-text-primary">
                  Bot Name
                </Label>
                <Input
                  id="bot-name"
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="e.g., TrendFollower v3"
                  className="text-sm border-spotify-grey focus:border-spotify-green bg-spotify-black text-spotify-text-primary rounded-md"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bot-language" className="text-sm text-spotify-text-primary">
                  Programming Language
                </Label>
                <Select value={botLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger
                    id="bot-language"
                    className="text-sm border-spotify-grey focus:border-spotify-green bg-spotify-black text-spotify-text-primary rounded-md"
                  >
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="bg-spotify-dark-grey text-spotify-text-primary border-spotify-grey rounded-md">
                    <SelectItem value="Python">Python</SelectItem>
                    <SelectItem value="JavaScript">JavaScript</SelectItem>
                    <SelectItem value="C++">C++</SelectItem>
                    <SelectItem value="Rust">Rust</SelectItem>
                    <SelectItem value="PineScript">Pine Script</SelectItem>
                    <SelectItem value="MQL5">MQL5</SelectItem>
                    <SelectItem value="MQL4">MQL4</SelectItem>
                    <SelectItem value="Elixir">Elixir</SelectItem>
                    <SelectItem value="DBots">DBots (JSON)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bot-description" className="text-sm text-spotify-text-primary">
                  Description (Optional)
                </Label>
                <Textarea
                  id="bot-description"
                  value={botDescription}
                  onChange={(e) => setBotDescription(e.target.value)}
                  placeholder="A brief description of your bot's strategy."
                  className="text-sm border-spotify-grey focus:border-spotify-green bg-spotify-black text-spotify-text-primary rounded-md"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="strategy-template" className="text-sm text-spotify-text-primary">
                  Strategy Template
                </Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger
                    id="strategy-template"
                    className="text-sm border-spotify-grey focus:border-spotify-green bg-spotify-black text-spotify-text-primary rounded-md"
                  >
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent className="bg-spotify-dark-grey text-spotify-text-primary border-spotify-grey rounded-md">
                    <div className="px-2 py-1 text-xs font-semibold text-spotify-text-secondary">
                      Mandatory for Production Readiness
                    </div>
                    {strategyTemplates.Mandatory.map((template) => (
                      <SelectItem key={template.value} value={template.value}>
                        {template.label}
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1 text-xs font-semibold text-spotify-text-secondary mt-2">
                      Optional Strategies
                    </div>
                    {strategyTemplates.Optional.map((template) => (
                      <SelectItem key={template.value} value={template.value}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="indicators" className="text-sm text-spotify-text-primary">
                  Add Chart Tools & Indicators
                </Label>
                <Select onValueChange={handleIndicatorChange} value="">
                  {" "}
                  {/* Value is empty to allow re-selection */}
                  <SelectTrigger
                    id="indicators"
                    className="text-sm border-spotify-grey focus:border-spotify-green bg-spotify-black text-spotify-text-primary rounded-md"
                  >
                    <SelectValue placeholder="Select indicators" />
                  </SelectTrigger>
                  <SelectContent className="bg-spotify-dark-grey text-spotify-text-primary border-spotify-grey rounded-md">
                    {indicatorOptions.map((indicator) => (
                      <SelectItem key={indicator.value} value={indicator.value}>
                        {indicator.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedIndicators.map((indicator) => (
                    <Badge key={indicator} variant="secondary" className="bg-spotify-grey text-spotify-text-primary">
                      {indicator}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => setSelectedIndicators(selectedIndicators.filter((i) => i !== indicator))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="natural-language-prompt" className="text-sm text-spotify-text-primary">
                  Or, describe your strategy in natural language:
                </Label>
                <Textarea
                  id="natural-language-prompt"
                  value={naturalLanguagePrompt}
                  onChange={(e) => setNaturalLanguagePrompt(e.target.value)}
                  placeholder="e.g., 'Buy when RSI crosses below 30 and sell when it crosses above 70, ensuring a 2:1 risk-to-reward and high volume.'"
                  className="text-sm border-spotify-grey focus:border-spotify-green bg-spotify-black text-spotify-text-primary rounded-md"
                  rows={3}
                  disabled={isGeneratingCode}
                />
                <Button
                  onClick={handleGenerateCodeWithAI}
                  disabled={isGeneratingCode || naturalLanguagePrompt.trim() === ""}
                  className="w-full bg-spotify-green text-spotify-black hover:bg-spotify-green/90 transition-all duration-300 hover:scale-105 rounded-full"
                >
                  {isGeneratingCode ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Generate Code with AI
                    </>
                  )}
                </Button>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bot-code" className="text-sm text-spotify-text-primary">
                  Bot Source Code ({botLanguage})
                </Label>
                <Textarea
                  id="bot-code"
                  value={botCode}
                  onChange={(e) => setBotCode(e.target.value)}
                  placeholder={`Write your ${botLanguage} trading logic here...`}
                  className="h-96 font-mono text-sm bg-spotify-black border-spotify-grey text-spotify-text-primary rounded-md"
                />
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-spotify-text-primary flex items-center mb-2">
                  Live Chart Preview (Conceptual)
                </h3>
                <InteractiveChartPlaceholder />
                <p className="text-xs text-spotify-text-secondary mt-2">
                  This chart would dynamically update as you edit code or select indicators, visualizing their impact.
                </p>
              </div>

              <Button
                onClick={handleCompileBot}
                disabled={compilationStatus === "compiling" || botCode.trim() === ""}
                className="w-full bg-spotify-green text-spotify-black hover:bg-spotify-green/90 transition-all duration-300 hover:scale-105 rounded-full"
              >
                {compilationStatus === "compiling" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Compiling...
                  </>
                ) : (
                  <>
                    <Code className="mr-2 h-4 w-4" /> Compile & Test
                  </>
                )}
              </Button>

              {compilationStatus !== "idle" && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-spotify-text-primary flex items-center mb-2">
                    {compilationStatus === "success" && <CheckCircle className="mr-2 h-4 w-4 text-spotify-green" />}
                    {compilationStatus === "error" && <X className="mr-2 h-4 w-4 text-destructive-foreground" />}
                    Compilation Log:
                  </h3>
                  <pre className="bg-spotify-black p-3 rounded-md text-xs font-mono overflow-auto max-h-40 text-spotify-text-secondary border border-spotify-grey">
                    {compilationLog}
                  </pre>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold text-spotify-text-primary">Bot Summary</h3>
              <div className="space-y-2 text-sm text-spotify-text-primary">
                <p>
                  <span className="font-medium">Name:</span> {botName || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Language:</span> {botLanguage}
                </p>
                <p>
                  <span className="font-medium">Description:</span> {botDescription || "No description provided."}
                </p>
                <p className="text-spotify-text-secondary mt-4">
                  *Note: For production readiness, ensure your bot adheres to the mandatory RSI Crossover and Risk
                  Management (SL/TP) rules, including volume checks and a 50 MA. These are critical for passing the &gt;
                  40% accuracy threshold.
                </p>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button
                  variant="outline"
                  className="border-spotify-grey text-spotify-text-primary hover:bg-spotify-grey/50 bg-transparent transition-all duration-200 hover:scale-105 rounded-full"
                  onClick={handleViewCode}
                >
                  <Code className="mr-2 h-4 w-4" /> View Source Code
                </Button>
                <Button
                  className="bg-spotify-green text-spotify-black hover:bg-spotify-green/90 transition-all duration-300 hover:scale-105 rounded-full"
                  onClick={handleDownloadBot}
                >
                  <Download className="mr-2 h-4 w-4" /> Download Bot
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="border-spotify-grey text-spotify-text-primary hover:bg-spotify-grey/50 bg-transparent transition-all duration-200 hover:scale-105 rounded-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={step === 2 && compilationStatus !== "success"}
              className="bg-spotify-green text-spotify-black hover:bg-spotify-green/90 transition-all duration-300 hover:scale-105 rounded-full"
            >
              {step < totalSteps ? (
                <>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Finish
                </>
              )}
            </Button>
          </div>
        </CardContent>

        <Dialog open={isCodeModalOpen} onOpenChange={setIsCodeModalOpen}>
          <DialogContent className="sm:max-w-[800px] bg-spotify-dark-grey text-spotify-text-primary border-spotify-grey rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-spotify-green">Bot Source Code</DialogTitle>
              <DialogDescription className="text-spotify-text-secondary">
                This is the code for your new bot.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Textarea
                readOnly
                value={botCode}
                className="h-96 font-mono text-sm bg-spotify-black border-spotify-grey text-spotify-text-primary rounded-md"
              />
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </>
  )
}
