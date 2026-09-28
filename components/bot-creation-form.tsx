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
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Line, CartesianGrid, Tooltip } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { createBot, readBots, writeBots } from "@/lib/botforge"
// Mock CodeHighlighter (replace with react-syntax-highlighter if used)
const CodeHighlighter = ({ language, value, onChange, className, ...props }) => (
  <Textarea
    className={className}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    {...props}
  />
);


function LoadingOverlay() {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
    </div>
  )
}

export function BotCreationForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [botName, setBotName] = useState("")
  const [botLanguage, setBotLanguage] = useState("Python")
  const [botDescription, setBotDescription] = useState("")
  const [botCode, setBotCode] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("default")
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([])
  const [timeframe, setTimeframe] = useState("H1")
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [error, setError] = useState({ botName: "", botDescription: "" });
  // const [compilationLog, setCompilationLog] = useState("")
  // const [compilationStatus, setCompilationStatus] = useState<"idle" | "compiling" | "success" | "error">("idle")
  // const [naturalLanguagePrompt, setNaturalLanguagePrompt] = useState("")
  // const [isGeneratingCode, setIsGeneratingCode] = useState(false)

  const totalSteps = 3
  const progress = (step / totalSteps) * 100
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)

  const generateWithAI = async () => {
    setIsGeneratingCode(true)
    try {
      const response = await fetch("/api/generate-bot-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: botLanguage, prompt: `${botName}: ${botDescription}. Indicators: ${selectedIndicators.join(", ") || "SMA, RSI"}. Timeframe: ${timeframe}.` }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "AI generation failed")
      setBotCode(data.code || "")
      toast({ title: "Strategy generated", description: "Review the generated code before saving the bot." })
    } catch (error) {
      toast({ title: "Generation failed", description: error instanceof Error ? error.message : "Unable to generate code.", variant: "destructive" })
    } finally {
      setIsGeneratingCode(false)
    }
  }

// Define the type for defaultCodeTemplates
interface CodeTemplates {
  [language: string]: {
    [template: string]: string;
  };
}

  // Mock candlestick data for EUR/USD
  const marketData = [
    { time: "2025-08-01 00:00", open: 1.2000, high: 1.2020, low: 1.1980, close: 1.2010 },
    { time: "2025-08-01 01:00", open: 1.2010, high: 1.2035, low: 1.1995, close: 1.2025 },
    { time: "2025-08-01 02:00", open: 1.2025, high: 1.2040, low: 1.2000, close: 1.2005 },
    { time: "2025-08-01 03:00", open: 1.2005, high: 1.2025, low: 1.1990, close: 1.2015 },
    { time: "2025-08-01 04:00", open: 1.2015, high: 1.2030, low: 1.2000, close: 1.2020 },
  ]

  const defaultCodeTemplates = {
    Python: {
      default: `def trading_strategy(data):
    """
    Default trading strategy based on MQL5 standards.
    - Uses 50-period SMA for trend confirmation.
    - Implements 1:2 risk-to-reward with SL/TP.
    - Includes volume check for trade entry.
    - Risks 1% of account equity per trade.
    """
    # Input parameters
    sma_period = 50
    risk_percent = 0.01  # 1% risk per trade
    rr_ratio = 2.0      # 1:2 risk-to-reward
    min_volume = 10.0   # Minimum volume (lots)

    # Extract data
    price = data.get('close', 0.0)
    account_balance = data.get('account_balance', 10000.0)
    volume = data.get('volume', 0.0)
    sma = data.get('sma_50', 0.0)

    # Volume check
    if volume < min_volume:
        return 'HOLD', None

    # Calculate position size (1% risk)
    stop_loss_pips = 20
    pip_value = 10.0
    risk_amount = account_balance * risk_percent
    lot_size = risk_amount / (stop_loss_pips * pip_value)

    # Trading logic: Buy above SMA, Sell below SMA
    if price > sma:
        sl = price - stop_loss_pips * 0.0001
        tp = price + (stop_loss_pips * rr_ratio) * 0.0001
        return 'BUY', {'lot_size': lot_size, 'sl': sl, 'tp': tp}
    elif price < sma:
        sl = price + stop_loss_pips * 0.0001
        tp = price - (stop_loss_pips * rr_ratio) * 0.0001
        return 'SELL', {'lot_size': lot_size, 'sl': sl, 'tp': tp}
    return 'HOLD', None
`,
      "Trailing Stop Loss": `def trading_strategy(data, current_position, entry_price, high_price_since_entry):
    """
    Trailing Stop Loss strategy based on MQL5 standards.
    - Uses 50-period SMA for trend confirmation.
    - Implements trailing stop with 1:2 risk-to-reward.
    - Includes volume check for trade entry.
    - Risks 1% of account equity per trade.
    """
    # Input parameters
    sma_period = 50
    risk_percent = 0.01
    trail_pips = 15
    rr_ratio = 2.0
    min_volume = 10.0

    # Extract data
    price = data.get('close', 0.0)
    account_balance = data.get('account_balance', 10000.0)
    volume = data.get('volume', 0.0)
    sma = data.get('sma_50', 0.0)

    # Volume check
    if volume < min_volume:
        return 'HOLD', None

    # Calculate position size
    stop_loss_pips = 20
    pip_value = 10.0
    risk_amount = account_balance * risk_percent
    lot_size = risk_amount / (stop_loss_pips * pip_value)

    # Trailing stop logic
    if current_position == 'BUY' and price > high_price_since_entry:
        new_sl = price - trail_pips * 0.0001
        return 'UPDATE_SL', {'sl': new_sl}
    elif current_position == 'SELL' and price < high_price_since_entry:
        new_sl = price + trail_pips * 0.0001
        return 'UPDATE_SL', {'sl': new_sl}

    # Entry logic
    if price > sma and current_position is None:
        sl = price - stop_loss_pips * 0.0001
        tp = price + (stop_loss_pips * rr_ratio) * 0.0001
        return 'BUY', {'lot_size': lot_size, 'sl': sl, 'tp': tp}
    elif price < sma and current_position is None:
        sl = price + stop_loss_pips * 0.0001
        tp = price - (stop_loss_pips * rr_ratio) * 0.0001
        return 'SELL', {'lot_size': lot_size, 'sl': sl, 'tp': tp}
    return 'HOLD', None
`,
      "Risk Management (SL/TP)": `def trading_strategy(data):
    """
    Fixed SL/TP strategy based on MQL5 standards.
    - Uses 50-period SMA for trend confirmation.
    - Implements fixed 20-pip SL and 40-pip TP (1:2 RTR).
    - Includes volume check for trade entry.
    - Risks 1% of account equity per trade.
    """
    # Input parameters
    sma_period = 50
    risk_percent = 0.01
    stop_loss_pips = 20
    rr_ratio = 2.0
    min_volume = 10.0

    # Extract data
    price = data.get('close', 0.0)
    account_balance = data.get('account_balance', 10000.0)
    volume = data.get('volume', 0.0)
    sma = data.get('sma_50', 0.0)

    # Volume check
    if volume < min_volume:
        return 'HOLD', None

    # Calculate position size
    pip_value = 10.0
    risk_amount = account_balance * risk_percent
    lot_size = risk_amount / (stop_loss_pips * pip_value)

    # Trading logic
    if price > sma:
        sl = price - stop_loss_pips * 0.0001
        tp = price + (stop_loss_pips * rr_ratio) * 0.0001
        return 'BUY', {'lot_size': lot_size, 'sl': sl, 'tp': tp}
    elif price < sma:
        sl = price + stop_loss_pips * 0.0001
        tp = price - (stop_loss_pips * rr_ratio) * 0.0001
        return 'SELL', {'lot_size': lot_size, 'sl': sl, 'tp': tp}
    return 'HOLD', None
`,
      "RSI Crossover (Mandatory)": `def trading_strategy(data):
    """
    RSI Crossover strategy based on MQL5 standards (Mandatory).
    - Uses RSI (14) with overbought (70) and oversold (30) levels.
    - Confirms trend with 50-period SMA.
    - Implements 1:2 risk-to-reward with SL/TP.
    - Includes volume check for trade entry.
    - Risks 1% of account equity per trade.
    """
    # Input parameters
    rsi_period = 14
    overbought = 70
    oversold = 30
    sma_period = 50
    risk_percent = 0.01
    stop_loss_pips = 20
    rr_ratio = 2.0
    min_volume = 10.0

    # Extract data
    price = data.get('close', 0.0)
    rsi = data.get('rsi', 0.0)
    account_balance = data.get('account_balance', 10000.0)
    volume = data.get('volume', 0.0)
    sma = data.get('sma_50', 0.0)

    # Volume check
    if volume < min_volume:
        return 'HOLD', None

    # Calculate position size
    pip_value = 10.0
    risk_amount = account_balance * risk_percent
    lot_size = risk_amount / (stop_loss_pips * pip_value)

    # RSI crossover logic with SMA confirmation
    if rsi < oversold and price > sma:
        sl = price - stop_loss_pips * 0.0001
        tp = price + (stop_loss_pips * rr_ratio) * 0.0001
        return 'BUY', {'lot_size': lot_size, 'sl': sl, 'tp': tp}
    elif rsi > overbought and price < sma:
        sl = price + stop_loss_pips * 0.0001
        tp = price - (stop_loss_pips * rr_ratio) * 0.0001
        return 'SELL', {'lot_size': lot_size, 'sl': sl, 'tp': tp}
    return 'HOLD', None
`,
      "MACD Divergence (Optional)": `def trading_strategy(data):
    """
    MACD Divergence strategy based on MQL5 standards (Optional).
    - Uses MACD (12,26,9) for divergence detection.
    - Confirms trend with 50-period SMA.
    - Implements 1:2 risk-to-reward with SL/TP.
    - Includes volume check for trade entry.
    - Risks 1% of account equity per trade.
    """
    # Input parameters
    fast_ema = 12
    slow_ema = 26
    signal = 9
    sma_period = 50
    risk_percent = 0.01
    stop_loss_pips = 20
    rr_ratio = 2.0
    min_volume = 10.0

    # Extract data
    price = data.get('close', 0.0)
    macd = data.get('macd', 0.0)
    signal_line = data.get('signal_line', 0.0)
    account_balance = data.get('account_balance', 10000.0)
    volume = data.get('volume', 0.0)
    sma = data.get('sma_50', 0.0)

    # Volume check
    if volume < min_volume:
        return 'HOLD', None

    # Calculate position size
    pip_value = 10.0
    risk_amount = account_balance * risk_percent
    lot_size = risk_amount / (stop_loss_pips * pip_value)

    # MACD divergence logic with SMA confirmation
    if macd > signal_line and price > sma:
        sl = price - stop_loss_pips * 0.0001
        tp = price + (stop_loss_pips * rr_ratio) * 0.0001
        return 'BUY', {'lot_size': lot_size, 'sl': sl, 'tp': tp}
    elif macd < signal_line and price < sma:
        sl = price + stop_loss_pips * 0.0001
        tp = price - (stop_loss_pips * rr_ratio) * 0.0001
        return 'SELL', {'lot_size': lot_size, 'sl': sl, 'tp': tp}
    return 'HOLD', None
`,
    },
    JavaScript: {
      default: `function tradingStrategy(data) {
  /*
   * Default trading strategy based on MQL5 standards.
   * - Uses 50-period SMA for trend confirmation.
   * - Implements 1:2 risk-to-reward with SL/TP.
   * - Includes volume check for trade entry.
   * - Risks 1% of account equity per trade.
   */
  // Input parameters
  const smaPeriod = 50;
  const riskPercent = 0.01;
  const rrRatio = 2.0;
  const minVolume = 10.0;

  // Extract data
  const price = data.close || 0.0;
  const accountBalance = data.account_balance || 10000.0;
  const volume = data.volume || 0.0;
  const sma = data.sma_50 || 0.0;

  // Volume check
  if (volume < minVolume) {
    return { action: 'HOLD', params: null };
  }

  // Calculate position size
  const stopLossPips = 20;
  const pipValue = 10.0;
  const riskAmount = accountBalance * riskPercent;
  const lotSize = riskAmount / (stopLossPips * pipValue);

  // Trading logic
  if (price > sma) {
    const sl = price - stopLossPips * 0.0001;
    const tp = price + (stopLossPips * rrRatio) * 0.0001;
    return { action: 'BUY', params: { lotSize, sl, tp } };
  } else if (price < sma) {
    const sl = price + stopLossPips * 0.0001;
    const tp = price - (stopLossPips * rrRatio) * 0.0001;
    return { action: 'SELL', params: { lotSize, sl, tp } };
  }
  return { action: 'HOLD', params: null };
}
`,
      "Trailing Stop Loss": `function tradingStrategy(data, currentPosition, entryPrice, highPriceSinceEntry) {
  /*
   * Trailing Stop Loss strategy based on MQL5 standards.
   * - Uses 50-period SMA for trend confirmation.
   * - Implements trailing stop with 1:2 risk-to-reward.
   * - Includes volume check for trade entry.
   * - Risks 1% of account equity per trade.
   */
  // Input parameters
  const smaPeriod = 50;
  const riskPercent = 0.01;
  const trailPips = 15;
  const rrRatio = 2.0;
  const minVolume = 10.0;

  // Extract data
  const price = data.close || 0.0;
  const accountBalance = data.account_balance || 10000.0;
  const volume = data.volume || 0.0;
  const sma = data.sma_50 || 0.0;

  // Volume check
  if (volume < minVolume) {
    return { action: 'HOLD', params: null };
  }

  // Calculate position size
  const stopLossPips = 20;
  const pipValue = 10.0;
  const riskAmount = accountBalance * riskPercent;
  const lotSize = riskAmount / (stopLossPips * pipValue);

  // Trailing stop logic
  if (currentPosition === 'BUY' && price > highPriceSinceEntry) {
    const newSl = price - trailPips * 0.0001;
    return { action: 'UPDATE_SL', params: { sl: newSl } };
  } else if (currentPosition === 'SELL' && price < highPriceSinceEntry) {
    const newSl = price + trailPips * 0.0001;
    return { action: 'UPDATE_SL', params: { sl: newSl } };
  }

  // Entry logic
  if (price > sma && !currentPosition) {
    const sl = price - stopLossPips * 0.0001;
    const tp = price + (stopLossPips * rrRatio) * 0.0001;
    return { action: 'BUY', params: { lotSize, sl, tp } };
  } else if (price < sma && !currentPosition) {
    const sl = price + stopLossPips * 0.0001;
    const tp = price - (stopLossPips * rrRatio) * 0.0001;
    return { action: 'SELL', params: { lotSize, sl, tp } };
  }
  return { action: 'HOLD', params: null };
}
`,
      "Risk Management (SL/TP)": `function tradingStrategy(data) {
  /*
   * Fixed SL/TP strategy based on MQL5 standards.
   * - Uses 50-period SMA for trend confirmation.
   * - Implements fixed 20-pip SL and 40-pip TP (1:2 RTR).
   * - Includes volume check for trade entry.
   * - Risks 1% of account equity per trade.
   */
  // Input parameters
  const smaPeriod = 50;
  const riskPercent = 0.01;
  const stopLossPips = 20;
  const rrRatio = 2.0;
  const minVolume = 10.0;

  // Extract data
  const price = data.close || 0.0;
  const accountBalance = data.account_balance || 10000.0;
  const volume = data.volume || 0.0;
  const sma = data.sma_50 || 0.0;

  // Volume check
  if (volume < minVolume) {
    return { action: 'HOLD', params: null };
  }

  // Calculate position size
  const pipValue = 10.0;
  const riskAmount = accountBalance * riskPercent;
  const lotSize = riskAmount / (stopLossPips * pipValue);

  // Trading logic
  if (price > sma) {
    const sl = price - stopLossPips * 0.0001;
    const tp = price + (stopLossPips * rrRatio) * 0.0001;
    return { action: 'BUY', params: { lotSize, sl, tp } };
  } else if (price < sma) {
    const sl = price + stopLossPips * 0.0001;
    const tp = price - (stopLossPips * rrRatio) * 0.0001;
    return { action: 'SELL', params: { lotSize, sl, tp } };
  }
  return { action: 'HOLD', params: null };
}
`,
      "RSI Crossover (Mandatory)": `function tradingStrategy(data) {
  /*
   * RSI Crossover strategy based on MQL5 standards (Mandatory).
   * - Uses RSI (14) with overbought (70) and oversold (30) levels.
   * - Confirms trend with 50-period SMA.
   * - Implements 1:2 risk-to-reward with SL/TP.
   * - Includes volume check for trade entry.
   * - Risks 1% of account equity per trade.
   */
  // Input parameters
  const rsiPeriod = 14;
  const overbought = 70;
  const oversold = 30;
  const smaPeriod = 50;
  const riskPercent = 0.01;
  const stopLossPips = 20;
  const rrRatio = 2.0;
  const minVolume = 10.0;

  // Extract data
  const price = data.close || 0.0;
  const rsi = data.rsi || 0.0;
  const accountBalance = data.account_balance || 10000.0;
  const volume = data.volume || 0.0;
  const sma = data.sma_50 || 0.0;

  // Volume check
  if (volume < minVolume) {
    return { action: 'HOLD', params: null };
  }

  // Calculate position size
  const pipValue = 10.0;
  const riskAmount = accountBalance * riskPercent;
  const lotSize = riskAmount / (stopLossPips * pipValue);

  // RSI crossover logic with SMA confirmation
  if (rsi < oversold && price > sma) {
    const sl = price - stopLossPips * 0.0001;
    const tp = price + (stopLossPips * rrRatio) * 0.0001;
    return { action: 'BUY', params: { lotSize, sl, tp } };
  } else if (rsi > overbought && price < sma) {
    const sl = price + stopLossPips * 0.0001;
    const tp = price - (stopLossPips * rrRatio) * 0.0001;
    return { action: 'SELL', params: { lotSize, sl, tp } };
  }
  return { action: 'HOLD', params: null };
}
`,
      "MACD Divergence (Optional)": `function tradingStrategy(data) {
  /*
   * MACD Divergence strategy based on MQL5 standards (Optional).
   * - Uses MACD (12,26,9) for divergence detection.
   * - Confirms trend with 50-period SMA.
   * - Implements 1:2 risk-to-reward with SL/TP.
   * - Includes volume check for trade entry.
   * - Risks 1% of account equity per trade.
   */
  // Input parameters
  const fastEma = 12;
  const slowEma = 26;
  const signal = 9;
  const smaPeriod = 50;
  const riskPercent = 0.01;
  const stopLossPips = 20;
  const rrRatio = 2.0;
  const minVolume = 10.0;

  // Extract data
  const price = data.close || 0.0;
  const macd = data.macd || 0.0;
  const signalLine = data.signal_line || 0.0;
  const accountBalance = data.account_balance || 10000.0;
  const volume = data.volume || 0.0;
  const sma = data.sma_50 || 0.0;

  // Volume check
  if (volume < minVolume) {
    return { action: 'HOLD', params: null };
  }

  // Calculate position size
  const pipValue = 10.0;
  const riskAmount = accountBalance * riskPercent;
  const lotSize = riskAmount / (stopLossPips * pipValue);

  // MACD divergence logic with SMA confirmation
  if (macd > signalLine && price > sma) {
    const sl = price - stopLossPips * 0.0001;
    const tp = price + (stopLossPips * rrRatio) * 0.0001;
    return { action: 'BUY', params: { lotSize, sl, tp } };
  } else if (macd < signalLine && price < sma) {
    const sl = price + stopLossPips * 0.0001;
    const tp = price - (stopLossPips * rrRatio) * 0.0001;
    return { action: 'SELL', params: { lotSize, sl, tp } };
  }
  return { action: 'HOLD', params: null };
}
`,
    },
    "C++": {
      default: `#include <string>
#include <map>

std::string tradingStrategy(std::map<std::string, double> data) {
    /*
     * Default trading strategy based on MQL5 standards.
     * - Uses 50-period SMA for trend confirmation.
     * - Implements 1:2 risk-to-reward with SL/TP.
     * - Includes volume check for trade entry.
     * - Risks 1% of account equity per trade.
     */
    // Input parameters
    const int sma_period = 50;
    const double risk_percent = 0.01;
    const double rr_ratio = 2.0;
    const double min_volume = 10.0;

    // Extract data
    double price = data["close"];
    double account_balance = data["account_balance"];
    double volume = data["volume"];
    double sma = data["sma_50"];

    // Volume check
    if (volume < min_volume) {
        return "HOLD";
    }

    // Calculate position size
    const double stop_loss_pips = 20;
    const double pip_value = 10.0;
    double risk_amount = account_balance * risk_percent;
    double lot_size = risk_amount / (stop_loss_pips * pip_value);

    // Trading logic
    if (price > sma) {
        double sl = price - stop_loss_pips * 0.0001;
        double tp = price + (stop_loss_pips * rr_ratio) * 0.0001;
        return "BUY";
    } else if (price < sma) {
        double sl = price + stop_loss_pips * 0.0001;
        double tp = price - (stop_loss_pips * rr_ratio) * 0.0001;
        return "SELL";
    }
    return "HOLD";
}
`,
      "Trailing Stop Loss": `#include <string>
#include <map>

std::string tradingStrategy(std::map<std::string, double> data, std::string current_position, double entry_price, double high_price_since_entry) {
    /*
     * Trailing Stop Loss strategy based on MQL5 standards.
     * - Uses 50-period SMA for trend confirmation.
     * - Implements trailing stop with 1:2 risk-to-reward.
     * - Includes volume check for trade entry.
     * - Risks 1% of account equity per trade.
     */
    // Input parameters
    const int sma_period = 50;
    const double risk_percent = 0.01;
    const double trail_pips = 15;
    const double rr_ratio = 2.0;
    const double min_volume = 10.0;

    // Extract data
    double price = data["close"];
    double account_balance = data["account_balance"];
    double volume = data["volume"];
    double sma = data["sma_50"];

    // Volume check
    if (volume < min_volume) {
        return "HOLD";
    }

    // Calculate position size
    const double stop_loss_pips = 20;
    const double pip_value = 10.0;
    double risk_amount = account_balance * risk_percent;
    double lot_size = risk_amount / (stop_loss_pips * pip_value);

    // Trailing stop logic
    if (current_position == "BUY" && price > high_price_since_entry) {
        double new_sl = price - trail_pips * 0.0001;
        return "UPDATE_SL";
    } else if (current_position == "SELL" && price < high_price_since_entry) {
        double new_sl = price + trail_pips * 0.0001;
        return "UPDATE_SL";
    }

    // Entry logic
    if (price > sma && current_position.empty()) {
        double sl = price - stop_loss_pips * 0.0001;
        double tp = price + (stop_loss_pips * rr_ratio) * 0.0001;
        return "BUY";
    } else if (price < sma && current_position.empty()) {
        double sl = price + stop_loss_pips * 0.0001;
        double tp = price - (stop_loss_pips * rr_ratio) * 0.0001;
        return "SELL";
    }
    return "HOLD";
}
`,
      "Risk Management (SL/TP)": `#include <string>
#include <map>

std::string tradingStrategy(std::map<std::string, double> data) {
    /*
     * Fixed SL/TP strategy based on MQL5 standards.
     * - Uses 50-period SMA for trend confirmation.
     * - Implements fixed 20-pip SL and 40-pip TP (1:2 RTR).
     * - Includes volume check for trade entry.
     * - Risks 1% of account equity per trade.
     */
    // Input parameters
    const int sma_period = 50;
    const double risk_percent = 0.01;
    const double stop_loss_pips = 20;
    const double rr_ratio = 2.0;
    const double min_volume = 10.0;

    // Extract data
    double price = data["close"];
    double account_balance = data["account_balance"];
    double volume = data["volume"];
    double sma = data["sma_50"];

    // Volume check
    if (volume < min_volume) {
        return "HOLD";
    }

    // Calculate position size
    const double pip_value = 10.0;
    double risk_amount = account_balance * risk_percent;
    double lot_size = risk_amount / (stop_loss_pips * pip_value);

    // Trading logic
    if (price > sma) {
        double sl = price - stop_loss_pips * 0.0001;
        double tp = price + (stop_loss_pips * rr_ratio) * 0.0001;
        return "BUY";
    } else if (price < sma) {
        double sl = price + stop_loss_pips * 0.0001;
        double tp = price - (stop_loss_pips * rr_ratio) * 0.0001;
        return "SELL";
    }
    return "HOLD";
}
`,
      "RSI Crossover (Mandatory)": `#include <string>
#include <map>

std::string tradingStrategy(std::map<std::string, double> data) {
    /*
     * RSI Crossover strategy based on MQL5 standards (Mandatory).
     * - Uses RSI (14) with overbought (70) and oversold (30) levels.
     * - Confirms trend with 50-period SMA.
     * - Implements 1:2 risk-to-reward with SL/TP.
     * - Includes volume check for trade entry.
     * - Risks 1% of account equity per trade.
     */
    // Input parameters
    const int rsi_period = 14;
    const double overbought = 70;
    const double oversold = 30;
    const int sma_period = 50;
    const double risk_percent = 0.01;
    const double stop_loss_pips = 20;
    const double rr_ratio = 2.0;
    const double min_volume = 10.0;

    // Extract data
    double price = data["close"];
    double rsi = data["rsi"];
    double account_balance = data["account_balance"];
    double volume = data["volume"];
    double sma = data["sma_50"];

    // Volume check
    if (volume < min_volume) {
        return "HOLD";
    }

    // Calculate position size
    const double pip_value = 10.0;
    double risk_amount = account_balance * risk_percent;
    double lot_size = risk_amount / (stop_loss_pips * pip_value);

    // RSI crossover logic with SMA confirmation
    if (rsi < oversold && price > sma) {
        double sl = price - stop_loss_pips * 0.0001;
        double tp = price + (stop_loss_pips * rr_ratio) * 0.0001;
        return "BUY";
    } else if (rsi > overbought && price < sma) {
        double sl = price + stop_loss_pips * 0.0001;
        double tp = price - (stop_loss_pips * rr_ratio) * 0.0001;
        return "SELL";
    }
    return "HOLD";
}
`,
      "MACD Divergence (Optional)": `#include <string>
#include <map>

std::string tradingStrategy(std::map<std::string, double> data) {
    /*
     * MACD Divergence strategy based on MQL5 standards (Optional).
     * - Uses MACD (12,26,9) for divergence detection.
     * - Confirms trend with 50-period SMA.
     * - Implements 1:2 risk-to-reward with SL/TP.
     * - Includes volume check for trade entry.
     * - Risks 1% of account equity per trade.
     */
    // Input parameters
    const int fast_ema = 12;
    const int slow_ema = 26;
    const int signal = 9;
    const int sma_period = 50;
    const double risk_percent = 0.01;
    const double stop_loss_pips = 20;
    const double rr_ratio = 2.0;
    const double min_volume = 10.0;

    // Extract data
    double price = data["close"];
    double macd = data["macd"];
    double signal_line = data["signal_line"];
    double account_balance = data["account_balance"];
    double volume = data["volume"];
    double sma = data["sma_50"];

    // Volume check
    if (volume < min_volume) {
        return "HOLD";
    }

    // Calculate position size
    const double pip_value = 10.0;
    double risk_amount = account_balance * risk_percent;
    double lot_size = risk_amount / (stop_loss_pips * pip_value);

    // MACD divergence logic with SMA confirmation
    if (macd > signal_line && price > sma) {
        double sl = price - stop_loss_pips * 0.0001;
        double tp = price + (stop_loss_pips * rr_ratio) * 0.0001;
        return "BUY";
    } else if (macd < signal_line && price < sma) {
        double sl = price + stop_loss_pips * 0.0001;
        double tp = price - (stop_loss_pips * rr_ratio) * 0.0001;
        return "SELL";
    }
    return "HOLD";
}
`,
    },
    Rust: {
      default: `use std::collections::HashMap;

fn trading_strategy(data: &HashMap<String, f64>) -> (String, Option<HashMap<String, f64>>) {
    /*
     * Default trading strategy based on MQL5 standards.
     * - Uses 50-period SMA for trend confirmation.
     * - Implements 1:2 risk-to-reward with SL/TP.
     * - Includes volume check for trade entry.
     * - Risks 1% of account equity per trade.
     */
    // Input parameters
    const SMA_PERIOD: i32 = 50;
    const RISK_PERCENT: f64 = 0.01;
    const RR_RATIO: f64 = 2.0;
    const MIN_VOLUME: f64 = 10.0;

    // Extract data
    let price = data.get("close").copied().unwrap_or(0.0);
    let account_balance = data.get("account_balance").copied().unwrap_or(10000.0);
    let volume = data.get("volume").copied().unwrap_or(0.0);
    let sma = data.get("sma_50").copied().unwrap_or(0.0);

    // Volume check
    if volume < MIN_VOLUME {
        return ("HOLD".to_string(), None);
    }

    // Calculate position size
    let stop_loss_pips = 20.0;
    let pip_value = 10.0;
    let risk_amount = account_balance * RISK_PERCENT;
    let lot_size = risk_amount / (stop_loss_pips * pip_value);

    // Trading logic
    if price > sma {
        let sl = price - stop_loss_pips * 0.0001;
        let tp = price + (stop_loss_pips * RR_RATIO) * 0.0001;
        let params = Some(HashMap::from([
            ("lot_size".to_string(), lot_size),
            ("sl".to_string(), sl),
            ("tp".to_string(), tp),
        ]));
        return ("BUY".to_string(), params);
    } else if price < sma {
        let sl = price + stop_loss_pips * 0.0001;
        let tp = price - (stop_loss_pips * RR_RATIO) * 0.0001;
        let params = Some(HashMap::from([
            ("lot_size".to_string(), lot_size),
            ("sl".to_string(), sl),
            ("tp".to_string(), tp),
        ]));
        return ("SELL".to_string(), params);
    }
    ("HOLD".to_string(), None)
}
`,
      "Trailing Stop Loss": `use std::collections::HashMap;

fn trading_strategy(data: &HashMap<String, f64>, current_position: Option<String>, entry_price: f64, high_price_since_entry: f64) -> (String, Option<HashMap<String, f64>>) {
    /*
     * Trailing Stop Loss strategy based on MQL5 standards.
     * - Uses 50-period SMA for trend confirmation.
     * - Implements trailing stop with 1:2 risk-to-reward.
     * - Includes volume check for trade entry.
     * - Risks 1% of account equity per trade.
     */
    // Input parameters
    const SMA_PERIOD: i32 = 50;
    const RISK_PERCENT: f64 = 0.01;
    const TRAIL_PIPS: f64 = 15.0;
    const RR_RATIO: f64 = 2.0;
    const MIN_VOLUME: f64 = 10.0;

    // Extract data
    let price = data.get("close").copied().unwrap_or(0.0);
    let account_balance = data.get("account_balance").copied().unwrap_or(10000.0);
    let volume = data.get("volume").copied().unwrap_or(0.0);
    let sma = data.get("sma_50").copied().unwrap_or(0.0);

    // Volume check
    if volume < MIN_VOLUME {
        return ("HOLD".to_string(), None);
    }

    // Calculate position size
    let stop_loss_pips = 20.0;
    let pip_value = 10.0;
    let risk_amount = account_balance * RISK_PERCENT;
    let lot_size = risk_amount / (stop_loss_pips * pip_value);

    // Trailing stop logic
    if let Some(pos) = current_position {
        if pos == "BUY" && price > high_price_since_entry {
            let new_sl = price - TRAIL_PIPS * 0.0001;
            let params = Some(HashMap::from([("sl".to_string(), new_sl)]));
            return ("UPDATE_SL".to_string(), params);
        } else if pos == "SELL" && price < high_price_since_entry {
            let new_sl = price + TRAIL_PIPS * 0.0001;
            let params = Some(HashMap::from([("sl".to_string(), new_sl)]));
            return ("UPDATE_SL".to_string(), params);
        }
    }

    // Entry logic
    if price > sma && current_position.is_none() {
        let sl = price - stop_loss_pips * 0.0001;
        let tp = price + (stop_loss_pips * RR_RATIO) * 0.0001;
        let params = Some(HashMap::from([
            ("lot_size".to_string(), lot_size),
            ("sl".to_string(), sl),
            ("tp".to_string(), tp),
        ]));
        return ("BUY".to_string(), params);
    } else if (price < sma && current_position.is_none()) {
        let sl = price + stop_loss_pips * 0.0001;
        let tp = price - (stop_loss_pips * RR_RATIO) * 0.0001;
        let params = Some(HashMap::from([
            ("lot_size".to_string(), lot_size),
            ("sl".to_string(), sl),
            ("tp".to_string(), tp),
        ]));
        return ("SELL".to_string(), params);
    }
    ("HOLD".to_string(), None)
}
`,
      "Risk Management (SL/TP)": `use std::collections::HashMap;

fn trading_strategy(data: &HashMap<String, f64>) -> (String, Option<HashMap<String, f64>>) {
    /*
     * Fixed SL/TP strategy based on MQL5 standards.
     * - Uses 50-period SMA for trend confirmation.
     * - Implements fixed 20-pip SL and 40-pip TP (1:2 RTR).
     * - Includes volume check for trade entry.
     * - Risks 1% of account equity per trade.
     */
    // Input parameters
    const SMA_PERIOD: i32 = 50;
    const RISK_PERCENT: f64 = 0.01;
    const STOP_LOSS_PIPS: f64 = 20.0;
    const RR_RATIO: f64 = 2.0;
    const MIN_VOLUME: f64 = 10.0;

    // Extract data
    let price = data.get("close").copied().unwrap_or(0.0);
    let account_balance = data.get("account_balance").copied().unwrap_or(10000.0);
    let volume = data.get("volume").copied().unwrap_or(0.0);
    let sma = data.get("sma_50").copied().unwrap_or(0.0);

    // Volume check
    if volume < MIN_VOLUME {
        return ("HOLD".to_string(), None);
    }

    // Calculate position size
    let pip_value = 10.0;
    let risk_amount = account_balance * RISK_PERCENT;
    let lot_size = risk_amount / (STOP_LOSS_PIPS * pip_value);

    // Trading logic
    if price > sma {
        let sl = price - STOP_LOSS_PIPS * 0.0001;
        let tp = price + (STOP_LOSS_PIPS * RR_RATIO) * 0.0001;
        let params = Some(HashMap::from([
            ("lot_size".to_string(), lot_size),
            ("sl".to_string(), sl),
            ("tp".to_string(), tp),
        ]));
        return ("BUY".to_string(), params);
    } else if price < sma {
        let sl = price + STOP_LOSS_PIPS * 0.0001;
        let tp = price - (STOP_LOSS_PIPS * RR_RATIO) * 0.0001;
        let params = Some(HashMap::from([
            ("lot_size".to_string(), lot_size),
            ("sl".to_string(), sl),
            ("tp".to_string(), tp),
        ]));
        return ("SELL".to_string(), params);
    }
    ("HOLD".to_string(), None)
}
`,
      "RSI Crossover (Mandatory)": `use std::collections::HashMap;

fn trading_strategy(data: &HashMap<String, f64>) -> (String, Option<HashMap<String, f64>>) {
    /*
     * RSI Crossover strategy based on MQL5 standards (Mandatory).
     * - Uses RSI (14) with overbought (70) and oversold (30) levels.
     * - Confirms trend with 50-period SMA.
     * - Implements 1:2 risk-to-reward with SL/TP.
     * - Includes volume check for trade entry.
     * - Risks 1% of account equity per trade.
     */
    // Input parameters
    const RSI_PERIOD: i32 = 14;
    const OVERBOUGHT: f64 = 70.0;
    const OVERSOLD: f64 = 30.0;
    const SMA_PERIOD: i32 = 50;
    const RISK_PERCENT: f64 = 0.01;
    const STOP_LOSS_PIPS: f64 = 20.0;
    const RR_RATIO: f64 = 2.0;
    const MIN_VOLUME: f64 = 10.0;

    // Extract data
    let price = data.get("close").copied().unwrap_or(0.0);
    let rsi = data.get("rsi").copied().unwrap_or(0.0);
    let account_balance = data.get("account_balance").copied().unwrap_or(10000.0);
    let volume = data.get("volume").copied().unwrap_or(0.0);
    let sma = data.get("sma_50").copied().unwrap_or(0.0);

    // Volume check
    if volume < MIN_VOLUME {
        return ("HOLD".to_string(), None);
    }

    // Calculate position size
    let pip_value = 10.0;
    let risk_amount = account_balance * RISK_PERCENT;
    let lot_size = risk_amount / (STOP_LOSS_PIPS * pip_value);

    // RSI crossover logic with SMA confirmation
    if rsi < OVERSOLD && price > sma {
        let sl = price - STOP_LOSS_PIPS * 0.0001;
        let tp = price + (STOP_LOSS_PIPS * RR_RATIO) * 0.0001;
        let params = Some(HashMap::from([
            ("lot_size".to_string(), lot_size),
            ("sl".to_string(), sl),
            ("tp".to_string(), tp),
        ]));
        return ("BUY".to_string(), params);
    } else if rsi > OVERBOUGHT && price < sma {
        let sl = price + STOP_LOSS_PIPS * 0.0001;
        let tp = price - (STOP_LOSS_PIPS * RR_RATIO) * 0.0001;
        let params = Some(HashMap::from([
            ("lot_size".to_string(), lot_size),
            ("sl".to_string(), sl),
            ("tp".to_string(), tp),
        ]));
        return ("SELL".to_string(), params);
    }
    ("HOLD".to_string(), None)
}
`,
      "MACD Divergence (Optional)": `use std::collections::HashMap;

fn trading_strategy(data: &HashMap<String, f64>) -> (String, Option<HashMap<String, f64>>) {
    /*
     * MACD Divergence strategy based on MQL5 standards (Optional).
     * - Uses MACD (12,26,9) for divergence detection.
     * - Confirms trend with 50-period SMA.
     * - Implements 1:2 risk-to-reward with SL/TP.
     * - Includes volume check for trade entry.
     * - Risks 1% of account equity per trade.
     */
    // Input parameters
    const FAST_EMA: i32 = 12;
    const SLOW_EMA: i32 = 26;
    const SIGNAL: i32 = 9;
    const SMA_PERIOD: i32 = 50;
    const RISK_PERCENT: f64 = 0.01;
    const STOP_LOSS_PIPS: f64 = 20.0;
    const RR_RATIO: f64 = 2.0;
    const MIN_VOLUME: f64 = 10.0;

    // Extract data
    let price = data.get("close").copied().unwrap_or(0.0);
    let macd = data.get("macd").copied().unwrap_or(0.0);
    let signal_line = data.get("signal_line").copied().unwrap_or(0.0);
    let account_balance = data.get("account_balance").copied().unwrap_or(10000.0);
    let volume = data.get("volume").copied().unwrap_or(0.0);
    let sma = data.get("sma_50").copied().unwrap_or(0.0);

    // Volume check
    if volume < MIN_VOLUME {
        return ("HOLD".to_string(), None);
    }

    // Calculate position size
    let pip_value = 10.0;
    let risk_amount = account_balance * RISK_PERCENT;
    let lot_size = risk_amount / (STOP_LOSS_PIPS * pip_value);

    // MACD divergence logic with SMA confirmation
    if macd > signal_line && price > sma {
        let sl = price - STOP_LOSS_PIPS * 0.0001;
        let tp = price + (STOP_LOSS_PIPS * RR_RATIO) * 0.0001;
        let params = Some(HashMap::from([
            ("lot_size".to_string(), lot_size),
            ("sl".to_string(), sl),
            ("tp".to_string(), tp),
        ]));
        return ("BUY".to_string(), params);
    } else if macd < signal_line && price < sma {
        let sl = price + STOP_LOSS_PIPS * 0.0001;
        let tp = price - (STOP_LOSS_PIPS * RR_RATIO) * 0.0001;
        let params = Some(HashMap::from([
            ("lot_size".to_string(), lot_size),
            ("sl".to_string(), sl),
            ("tp".to_string(), tp),
        ]));
        return ("SELL".to_string(), params);
    }
    ("HOLD".to_string(), None)
}
`,
    },
    PineScript: {
      default: `//@version=5
strategy("Default Strategy", overlay=true, initial_capital=10000, default_qty_type=strategy.percent_of_equity, default_qty_value=1)
// Description:
// - Default trading strategy based on MQL5 standards.
// - Uses 50-period SMA for trend confirmation.
// - Implements 1:2 risk-to-reward with SL/TP.
// - Includes volume check for trade entry.
// - Risks 1% of account equity per trade.

// Input parameters
sma_period = 50
risk_percent = 0.01
stop_loss_pips = 20
rr_ratio = 2.0
min_volume = 10.0

// Calculate indicators
sma = ta.sma(close, sma_period)
lot_size = math.floor(strategy.equity * risk_percent / (stop_loss_pips * 10))

// Volume check
if ta.volume < min_volume
    strategy.cancel_all()
    strategy.close_all()

// Trading logic
if close > sma
    sl = close - stop_loss_pips * 0.0001
    tp = close + (stop_loss_pips * rr_ratio) * 0.0001
    strategy.entry("Long", strategy.long, qty=lot_size, stop=sl, limit=tp)
else if close < sma
    sl = close + stop_loss_pips * 0.0001
    tp = close - (stop_loss_pips * rr_ratio) * 0.0001
    strategy.entry("Short", strategy.short, qty=lot_size, stop=sl, limit=tp)
`,
      "Trailing Stop Loss": `//@version=5
strategy("Trailing Stop Loss Strategy", overlay=true, initial_capital=10000, default_qty_type=strategy.percent_of_equity, default_qty_value=1)
// Description:
// - Trailing Stop Loss strategy based on MQL5 standards.
// - Uses 50-period SMA for trend confirmation.
// - Implements trailing stop with 1:2 risk-to-reward.
// - Includes volume check for trade entry.
// - Risks 1% of account equity per trade.

// Input parameters
sma_period = 50
risk_percent = 0.01
trail_pips = 15
stop_loss_pips = 20
rr_ratio = 2.0
min_volume = 10.0

// Calculate indicators
sma = ta.sma(close, sma_period)
lot_size = math.floor(strategy.equity * risk_percent / (stop_loss_pips * 10))

// Volume check
if ta.volume < min_volume
    strategy.cancel_all()
    strategy.close_all()

// Trailing stop logic
var float trailing_sl = 0.0
if strategy.position_size > 0 and close > high[1]
    trailing_sl := math.max(trailing_sl, close - trail_pips * 0.0001)
    strategy.exit("Exit Long", "Long", stop=trailing_sl)
else if strategy.position_size < 0 and close < low[1]
    trailing_sl := math.min(trailing_sl, close + trail_pips * 0.0001)
    strategy.exit("Exit Short", "Short", stop=trailing_sl)

// Entry logic
if close > sma and strategy.position_size == 0
    sl = close - stop_loss_pips * 0.0001
    tp = close + (stop_loss_pips * rr_ratio) * 0.0001
    strategy.entry("Long", strategy.long, qty=lot_size, stop=sl, limit=tp)
else if close < sma and strategy.position_size == 0
    sl = close + stop_loss_pips * 0.0001
    tp = close - (stop_loss_pips * rr_ratio) * 0.0001
    strategy.entry("Short", strategy.short, qty=lot_size, stop=sl, limit=tp)
`,
      "Risk Management (SL/TP)": `//@version=5
strategy("Risk Management SL/TP", overlay=true, initial_capital=10000, default_qty_type=strategy.percent_of_equity, default_qty_value=1)
// Description:
// - Fixed SL/TP strategy based on MQL5 standards.
// - Uses 50-period SMA for trend confirmation.
// - Implements fixed 20-pip SL and 40-pip TP (1:2 RTR).
// - Includes volume check for trade entry.
// - Risks 1% of account equity per trade.

// Input parameters
sma_period = 50
risk_percent = 0.01
stop_loss_pips = 20
rr_ratio = 2.0
min_volume = 10.0

// Calculate indicators
sma = ta.sma(close, sma_period)
lot_size = math.floor(strategy.equity * risk_percent / (stop_loss_pips * 10))

// Volume check
if ta.volume < min_volume
    strategy.cancel_all()
    strategy.close_all()

// Trading logic
if close > sma
    sl = close - stop_loss_pips * 0.0001
    tp = close + (stop_loss_pips * rr_ratio) * 0.0001
    strategy.entry("Long", strategy.long, qty=lot_size, stop=sl, limit=tp)
else if close < sma
    sl = close + stop_loss_pips * 0.0001
    tp = close - (stop_loss_pips * rr_ratio) * 0.0001
    strategy.entry("Short", strategy.short, qty=lot_size, stop=sl, limit=tp)
`,
      "RSI Crossover (Mandatory)": `//@version=5
strategy("RSI Crossover Strategy", overlay=true, initial_capital=10000, default_qty_type=strategy.percent_of_equity, default_qty_value=1)
// Description:
// - RSI Crossover strategy based on MQL5 standards (Mandatory).
// - Uses RSI (14) with overbought (70) and oversold (30) levels.
// - Confirms trend with 50-period SMA.
// - Implements 1:2 risk-to-reward with SL/TP.
// - Includes volume check for trade entry.
// - Risks 1% of account equity per trade.

// Input parameters
rsi_period = 14
overbought = 70
oversold = 30
sma_period = 50
risk_percent = 0.01
stop_loss_pips = 20
rr_ratio = 2.0
min_volume = 10.0

// Calculate indicators
rsi = ta.rsi(close, rsi_period)
sma = ta.sma(close, sma_period)
lot_size = math.floor(strategy.equity * risk_percent / (stop_loss_pips * 10))

// Volume check
if ta.volume < min_volume
    strategy.cancel_all()
    strategy.close_all()

// Trading logic
if rsi < oversold and close > sma
    sl = close - stop_loss_pips * 0.0001
    tp = close + (stop_loss_pips * rr_ratio) * 0.0001
    strategy.entry("Long", strategy.long, qty=lot_size, stop=sl, limit=tp)
else if rsi > overbought and close < sma
    sl = close + stop_loss_pips * 0.0001
    tp = close - (stop_loss_pips * rr_ratio) * 0.0001
    strategy.entry("Short", strategy.short, qty=lot_size, stop=sl, limit=tp)
`,
      "MACD Divergence (Optional)": `//@version=5
strategy("MACD Divergence Strategy", overlay=true, initial_capital=10000, default_qty_type=strategy.percent_of_equity, default_qty_value=1)
// Description:
// - MACD Divergence strategy based on MQL5 standards (Optional).
// - Uses MACD (12,26,9) for divergence detection.
// - Confirms trend with 50-period SMA.
// - Implements 1:2 risk-to-reward with SL/TP.
// - Includes volume check for trade entry.
// - Risks 1% of account equity per trade.

// Input parameters
fast_ema = 12
slow_ema = 26
signal = 9
sma_period = 50
risk_percent = 0.01
stop_loss_pips = 20
rr_ratio = 2.0
min_volume = 10.0

// Calculate indicators
[macd, signal_line, _] = ta.macd(close, fast_ema, slow_ema, signal)
sma = ta.sma(close, sma_period)
lot_size = math.floor(strategy.equity * risk_percent / (stop_loss_pips * 10))

// Volume check
if ta.volume < min_volume
    strategy.cancel_all()
    strategy.close_all()

// Trading logic
if macd > signal_line and close > sma
    sl = close - stop_loss_pips * 0.0001
    tp = close + (stop_loss_pips * rr_ratio) * 0.0001
    strategy.entry("Long", strategy.long, qty=lot_size, stop=sl, limit=tp)
else if macd < signal_line and close < sma
    sl = close + stop_loss_pips * 0.0001
    tp = close - (stop_loss_pips * rr_ratio) * 0.0001
    strategy.entry("Short", strategy.short, qty=lot_size, stop=sl, limit=tp)
`,
    },
    MQL5: {
      default: `//+------------------------------------------------------------------+
//|                                                DefaultStrategy.mq5 |
//|                                                     Momo Platform |
//|------------------------------------------------------------------+
#property copyright "Momo Platform"
#property link      "https://momo-platform.com"
#property version   "1.00"
#property description "Default MQL5 trading strategy. Uses 50 SMA for trend confirmation, 1:2 RTR with SL/TP, volume check, 1% risk per trade."

// Input parameters
input int    sma_period = 50;          // SMA Period
input double risk_percent = 0.01;      // Risk per trade (%)
input double stop_loss_pips = 20;      // Stop Loss (pips)
input double rr_ratio = 2.0;           // Risk-to-Reward Ratio
input double min_volume = 10.0;        // Minimum Volume (lots)

// Global variables
int sma_handle;

//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit() {
   sma_handle = iMA(_Symbol, PERIOD_CURRENT, sma_period, 0, MODE_SMA, PRICE_CLOSE);
   if (sma_handle == INVALID_HANDLE) {
      Print("Error creating SMA indicator");
      return(INIT_FAILED);
   }
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                   |
//+------------------------------------------------------------------+
void OnDeinit(const int reason) {
   if (sma_handle != INVALID_HANDLE) IndicatorRelease(sma_handle);
}

//+------------------------------------------------------------------+
//| Expert tick function                                              |
//+------------------------------------------------------------------+
void OnTick() {
   // Extract data
   double price = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double account_balance = AccountBalance();
   double volume = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME);
   double sma[];
   ArraySetAsSeries(sma, true);
   CopyBuffer(sma_handle, 0, 0, 1, sma);

   // Volume check
   if (volume < min_volume) return;

   // Calculate position size
   double pip_value = 10.0; // Adjust based on symbol
   double risk_amount = account_balance * risk_percent;
   double lot_size = NormalizeDouble(risk_amount / (stop_loss_pips * pip_value), 2);

   // Trading logic
   CTrade trade;
   if (price > sma[0]) {
      double sl = price - stop_loss_pips * Point();
      double tp = price + (stop_loss_pips * rr_ratio) * Point();
      trade.Buy(lot_size, _Symbol, price, sl, tp);
   } else if (price < sma[0]) {
      double sl = price + stop_loss_pips * Point();
      double tp = price - (stop_loss_pips * rr_ratio) * Point();
      trade.Sell(lot_size, _Symbol, price, sl, tp);
   }
}
`,
      "Trailing Stop Loss": `//+------------------------------------------------------------------+
//|                                       TrailingStopLossStrategy.mq5 |
//|                                                     Momo Platform |
//|------------------------------------------------------------------+
#property copyright "Momo Platform"
#property link      "https://momo-platform.com"
#property version   "1.00"
#property description "MQL5 Trailing Stop Loss strategy. Uses 50 SMA, trailing stop, 1:2 RTR, volume check, 1% risk."

// Input parameters
input int    sma_period = 50;          // SMA Period
input double risk_percent = 0.01;      // Risk per trade (%)
input double trail_pips = 15;          // Trailing Stop (pips)
input double stop_loss_pips = 20;      // Initial Stop Loss (pips)
input double rr_ratio = 2.0;           // Risk-to-Reward Ratio
input double min_volume = 10.0;        // Minimum Volume (lots)

// Global variables
int sma_handle;

//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit() {
   sma_handle = iMA(_Symbol, PERIOD_CURRENT, sma_period, 0, MODE_SMA, PRICE_CLOSE);
   if (sma_handle == INVALID_HANDLE) {
      Print("Error creating SMA indicator");
      return(INIT_FAILED);
   }
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                   |
//+------------------------------------------------------------------+
void OnDeinit(const int reason) {
   if (sma_handle != INVALID_HANDLE) IndicatorRelease(sma_handle);
}

//+------------------------------------------------------------------+
//| Expert tick function                                              |
//+------------------------------------------------------------------+
void OnTick() {
   // Extract data
   double price = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double account_balance = AccountBalance();
   double volume = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME);
   double sma[];
   ArraySetAsSeries(sma, true);
   CopyBuffer(sma_handle, 0, 0, 1, sma);

   // Volume check
   if (volume < min_volume) return;

   // Calculate position size
   double pip_value = 10.0;
   double risk_amount = account_balance * risk_percent;
   double lot_size = NormalizeDouble(risk_amount / (stop_loss_pips * pip_value), 2);

   // Trailing stop logic
   CTrade trade;
   for (int i = PositionsTotal() - 1; i >= 0; i--) {
      ulong ticket = PositionGetTicket(i);
      if (PositionSelectByTicket(ticket)) {
         double current_sl = PositionGetDouble(POSITION_SL);
         if (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY && price > PositionGetDouble(POSITION_PRICE_OPEN)) {
            double new_sl = price - trail_pips * Point();
            if (new_sl > current_sl) trade.PositionModify(ticket, new_sl, PositionGetDouble(POSITION_TP));
         } else if (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_SELL && price < PositionGetDouble(POSITION_PRICE_OPEN)) {
            double new_sl = price + trail_pips * Point();
            if (new_sl < current_sl || current_sl == 0) trade.PositionModify(ticket, new_sl, PositionGetDouble(POSITION_TP));
         }
      }
   }

   // Entry logic
   if (PositionsTotal() == 0) {
      if (price > sma[0]) {
         double sl = price - stop_loss_pips * Point();
         double tp = price + (stop_loss_pips * rr_ratio) * Point();
         trade.Buy(lot_size, _Symbol, price, sl, tp);
      } else if (price < sma[0]) {
         double sl = price + stop_loss_pips * Point();
         double tp = price - (stop_loss_pips * rr_ratio) * Point();
         trade.Sell(lot_size, _Symbol, price, sl, tp);
      }
   }
}
`,
      "Risk Management (SL/TP)": `//+------------------------------------------------------------------+
//|                                         RiskManagementStrategy.mq5 |
//|                                                     Momo Platform |
//|------------------------------------------------------------------+
#property copyright "Momo Platform"
#property link      "https://momo-platform.com"
#property version   "1.00"
#property description "MQL5 Fixed SL/TP strategy. Uses 50 SMA, 20-pip SL, 40-pip TP (1:2 RTR), volume check, 1% risk."

// Input parameters
input int    sma_period = 50;          // SMA Period
input double risk_percent = 0.01;      // Risk per trade (%)
input double stop_loss_pips = 20;      // Stop Loss (pips)
input double rr_ratio = 2.0;           // Risk-to-Reward Ratio
input double min_volume = 10.0;        // Minimum Volume (lots)

// Global variables
int sma_handle;

//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit() {
   sma_handle = iMA(_Symbol, PERIOD_CURRENT, sma_period, 0, MODE_SMA, PRICE_CLOSE);
   if (sma_handle == INVALID_HANDLE) {
      Print("Error creating SMA indicator");
      return(INIT_FAILED);
   }
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                   |
//+------------------------------------------------------------------+
void OnDeinit(const int reason) {
   if (sma_handle != INVALID_HANDLE) IndicatorRelease(sma_handle);
}

//+------------------------------------------------------------------+
//| Expert tick function                                              |
//+------------------------------------------------------------------+
void OnTick() {
   // Extract data
   double price = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double account_balance = AccountBalance();
   double volume = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME);
   double sma[];
   ArraySetAsSeries(sma, true);
   CopyBuffer(sma_handle, 0, 0, 1, sma);

   // Volume check
   if (volume < min_volume) return;

   // Calculate position size
   double pip_value = 10.0;
   double risk_amount = account_balance * risk_percent;
   double lot_size = NormalizeDouble(risk_amount / (stop_loss_pips * pip_value), 2);

   // Trading logic
   CTrade trade;
   if (price > sma[0]) {
      double sl = price - stop_loss_pips * Point();
      double tp = price + (stop_loss_pips * rr_ratio) * Point();
      trade.Buy(lot_size, _Symbol, price, sl, tp);
   } else if (price < sma[0]) {
      double sl = price + stop_loss_pips * Point();
      double tp = price - (stop_loss_pips * rr_ratio) * Point();
      trade.Sell(lot_size, _Symbol, price, sl, tp);
   }
}
`,
      "RSI Crossover (Mandatory)": `//+------------------------------------------------------------------+
//|                                            RSICrossoverStrategy.mq5 |
//|                                                     Momo Platform |
//|------------------------------------------------------------------+
#property copyright "Momo Platform"
#property link      "https://momo-platform.com"
#property version   "1.00"
#property description "MQL5 RSI Crossover strategy (Mandatory). Uses RSI(14), 50 SMA, 1:2 RTR, volume check, 1% risk."

// Input parameters
input int    rsi_period = 14;          // RSI Period
input double overbought = 70;          // RSI Overbought Level
input double oversold = 30;            // RSI Oversold Level
input int    sma_period = 50;          // SMA Period
input double risk_percent = 0.01;      // Risk per trade (%)
input double stop_loss_pips = 20;      // Stop Loss (pips)
input double rr_ratio = 2.0;           // Risk-to-Reward Ratio
input double min_volume = 10.0;        // Minimum Volume (lots)

// Global variables
int rsi_handle;
int sma_handle;

//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit() {
   rsi_handle = iRSI(_Symbol, PERIOD_CURRENT, rsi_period, PRICE_CLOSE);
   sma_handle = iMA(_Symbol, PERIOD_CURRENT, sma_period, 0, MODE_SMA, PRICE_CLOSE);
   if (rsi_handle == INVALID_HANDLE || sma_handle == INVALID_HANDLE) {
      Print("Error creating indicators");
      return(INIT_FAILED);
   }
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                   |
//+------------------------------------------------------------------+
void OnDeinit(const int reason) {
   if (rsi_handle != INVALID_HANDLE) IndicatorRelease(rsi_handle);
   if (sma_handle != INVALID_HANDLE) IndicatorRelease(sma_handle);
}

//+------------------------------------------------------------------+
//| Expert tick function                                              |
//+------------------------------------------------------------------+
void OnTick() {
   // Extract data
   double price = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double account_balance = AccountBalance();
   double volume = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME);
   double rsi[];
   double sma[];
   ArraySetAsSeries(rsi, true);
   ArraySetAsSeries(sma, true);
   CopyBuffer(rsi_handle, 0, 0, 1, rsi);
   CopyBuffer(sma_handle, 0, 0, 1, sma);

   // Volume check
   if (volume < min_volume) return;

   // Calculate position size
   double pip_value = 10.0;
   double risk_amount = account_balance * risk_percent;
   double lot_size = NormalizeDouble(risk_amount / (stop_loss_pips * pip_value), 2);

   // Trading logic
   CTrade trade;
   if (rsi[0] < oversold && price > sma[0]) {
      double sl = price - stop_loss_pips * Point();
      double tp = price + (stop_loss_pips * rr_ratio) * Point();
      trade.Buy(lot_size, _Symbol, price, sl, tp);
   } else if (rsi[0] > overbought && price < sma[0]) {
      double sl = price + stop_loss_pips * Point();
      double tp = price - (stop_loss_pips * rr_ratio) * Point();
      trade.Sell(lot_size, _Symbol, price, sl, tp);
   }
}
`,
      "MACD Divergence (Optional)": `//+------------------------------------------------------------------+
//|                                          MACDDivergenceStrategy.mq5 |
//|                                                     Momo Platform |
//|------------------------------------------------------------------+
#property copyright "Momo Platform"
#property link      "https://momo-platform.com"
#property version   "1.00"
#property description "MQL5 MACD Divergence strategy (Optional). Uses MACD(12,26,9), 50 SMA, 1:2 RTR, volume check, 1% risk."

// Input parameters
input int    fast_ema = 12;            // MACD Fast EMA
input int    slow_ema = 26;            // MACD Slow EMA
input int    signal = 9;               // MACD Signal Line
input int    sma_period = 50;          // SMA Period
input double risk_percent = 0.01;      // Risk per trade (%)
input double stop_loss_pips = 20;      // Stop Loss (pips)
input double rr_ratio = 2.0;           // Risk-to-Reward Ratio
input double min_volume = 10.0;        // Minimum Volume (lots)

// Global variables
int macd_handle;
int sma_handle;

//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit() {
   macd_handle = iMACD(_Symbol, PERIOD_CURRENT, fast_ema, slow_ema, signal, PRICE_CLOSE);
   sma_handle = iMA(_Symbol, PERIOD_CURRENT, sma_period, 0, MODE_SMA, PRICE_CLOSE);
   if (macd_handle == INVALID_HANDLE || sma_handle == INVALID_HANDLE) {
      Print("Error creating indicators");
      return(INIT_FAILED);
   }
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                   |
//+------------------------------------------------------------------+
void OnDeinit(const int reason) {
   if (macd_handle != INVALID_HANDLE) IndicatorRelease(macd_handle);
   if (sma_handle != INVALID_HANDLE) IndicatorRelease(sma_handle);
}

//+------------------------------------------------------------------+
//| Expert tick function                                              |
//+------------------------------------------------------------------+
void OnTick() {
   // Extract data
   double price = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double account_balance = AccountBalance();
   double volume = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME);
   double macd[], signal_line[], sma[];
   ArraySetAsSeries(macd, true);
   ArraySetAsSeries(signal_line, true);
   ArraySetAsSeries(sma, true);
   CopyBuffer(macd_handle, MAIN_LINE, 0, 1, macd);
   CopyBuffer(macd_handle, SIGNAL_LINE, 0, 1, signal_line);
   CopyBuffer(sma_handle, 0, 0, 1, sma);

   // Volume check
   if (volume < min_volume) return;

   // Calculate position size
   double pip_value = 10.0;
   double risk_amount = account_balance * risk_percent;
   double lot_size = NormalizeDouble(risk_amount / (stop_loss_pips * pip_value), 2);

   // Trading logic
   CTrade trade;
   if (macd[0] > signal_line[0] && price > sma[0]) {
      double sl = price - stop_loss_pips * Point();
      double tp = price + (stop_loss_pips * rr_ratio) * Point();
      trade.Buy(lot_size, _Symbol, price, sl, tp);
   } else if (macd[0] < signal_line[0] && price < sma[0]) {
      double sl = price + stop_loss_pips * Point();
      double tp = price - (stop_loss_pips * rr_ratio) * Point();
      trade.Sell(lot_size, _Symbol, price, sl, tp);
   }
}

`
    }, "MQL4": {
  default: `//+------------------------------------------------------------------+
//|                                             DefaultStrategy.mq4   |
//|                                                     Momo Platform |
//|------------------------------------------------------------------+
#property copyright "Momo Platform"
#property link      "https://momo-platform.com"
#property version   "1.00"
#property description "Default MQL4 trading strategy. Uses 50 SMA for trend confirmation, 1:2 RTR with SL/TP, volume check, 1% risk per trade."
// Input parameters
input int    sma_period = 50;          // SMA Period
input double risk_percent = 0.01;      // Risk per trade (%)
input double stop_loss_pips = 20;      // Stop Loss (pips)
input double rr_ratio = 2.0;           // Risk-to-Reward Ratio
input double min_volume = 10.0;        // Minimum Volume (lots)
//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit() {
   return(INIT_SUCCEEDED);
}
//+------------------------------------------------------------------+
//| Expert deinitialization function                                   |
//+------------------------------------------------------------------+
void OnDeinit(const int reason) {
   // No indicator handles to release in MQL4
}
//+------------------------------------------------------------------+
//| Expert tick function                                              |
//+------------------------------------------------------------------+
void OnTick() {
   // Extract data
   double price = MarketInfo(_Symbol, MODE_BID);
   double account_balance = AccountBalance();
   double volume = MarketInfo(_Symbol, MODE_VOLUME);
   double sma = iMA(_Symbol, PERIOD_CURRENT, sma_period, 0, MODE_SMA, PRICE_CLOSE, 0);
   // Volume check
   if (volume < min_volume) return;
   // Calculate position size
   double pip_value = 10.0;
   double risk_amount = account_balance * risk_percent;
   double lot_size = NormalizeDouble(risk_amount / (stop_loss_pips * pip_value), 2);
   // Check for open positions
   if (OrdersTotal() == 0) {
      // Trading logic
      if (price > sma) {
         double sl = price - stop_loss_pips * Point;
         double tp = price + (stop_loss_pips * rr_ratio) * Point;
         OrderSend(_Symbol, OP_BUY, lot_size, price, 3, sl, tp, "Default Buy", 0, 0, clrGreen);
      } else if (price < sma) {
         double sl = price + stop_loss_pips * Point;
         double tp = price - (stop_loss_pips * rr_ratio) * Point;
         OrderSend(_Symbol, OP_SELL, lot_size, price, 3, sl, tp, "Default Sell", 0, 0, clrRed);
      }
   }
}
`,
  "Trailing Stop Loss": `//+------------------------------------------------------------------+
//|                                    TrailingStopLossStrategy.mq4   |
//|                                                     Momo Platform |
//|------------------------------------------------------------------+
#property copyright "Momo Platform"
#property link      "https://momo-platform.com"
#property version   "1.00"
#property description "MQL4 Trailing Stop Loss strategy. Uses 50 SMA, trailing stop, 1:2 RTR, volume check, 1% risk."
// Input parameters
input int    sma_period = 50;          // SMA Period
input double risk_percent = 0.01;      // Risk per trade (%)
input double trail_pips = 15;          // Trailing Stop (pips)
input double stop_loss_pips = 20;      // Initial Stop Loss (pips)
input double rr_ratio = 2.0;           // Risk-to-Reward Ratio
input double min_volume = 10.0;        // Minimum Volume (lots)
//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit() {
   return(INIT_SUCCEEDED);
}
//+------------------------------------------------------------------+
//| Expert deinitialization function                                   |
//+------------------------------------------------------------------+
void OnDeinit(const int reason) {
   // No indicator handles to release
}
//+------------------------------------------------------------------+
//| Expert tick function                                              |
//+------------------------------------------------------------------+
void OnTick() {
   // Extract data
   double price = MarketInfo(_Symbol, MODE_BID);
   double account_balance = AccountBalance();
   double volume = MarketInfo(_Symbol, MODE_VOLUME);
   double sma = iMA(_Symbol, PERIOD_CURRENT, sma_period, 0, MODE_SMA, PRICE_CLOSE, 0);
   // Volume check
   if (volume < min_volume) return;
   // Calculate position size
   double pip_value = 10.0;
   double risk_amount = account_balance * risk_percent;
   double lot_size = NormalizeDouble(risk_amount / (stop_loss_pips * pip_value), 2);
   // Trailing stop logic
   for (int i = 0; i < OrdersTotal(); i++) {
      if (OrderSelect(i, SELECT_BY_POS, MODE_TRADES)) {
         if (OrderSymbol() == _Symbol) {
            double current_sl = OrderStopLoss();
            if (OrderType() == OP_BUY && price > OrderOpenPrice()) {
               double new_sl = price - trail_pips * Point;
               if (new_sl > current_sl) OrderModify(OrderTicket(), OrderOpenPrice(), new_sl, OrderTakeProfit(), 0, clrGreen);
            } else if (OrderType() == OP_SELL && price < OrderOpenPrice()) {
               double new_sl = price + trail_pips * Point;
               if (new_sl < current_sl || current_sl == 0) OrderModify(OrderTicket(), OrderOpenPrice(), new_sl, OrderTakeProfit(), 0, clrRed);
            }
         }
      }
   }
   // Entry logic
   if (OrdersTotal() == 0) {
      if (price > sma) {
         double sl = price - stop_loss_pips * Point;
         double tp = price + (stop_loss_pips * rr_ratio) * Point;
         OrderSend(_Symbol, OP_BUY, lot_size, price, 3, sl, tp, "Trailing Buy", 0, 0, clrGreen);
      } else if (price < sma) {
         double sl = price + stop_loss_pips * Point;
         double tp = price - (stop_loss_pips * rr_ratio) * Point;
         OrderSend(_Symbol, OP_SELL, lot_size, price, 3, sl, tp, "Trailing Sell", 0, 0, clrRed);
      }
   }
}
`,
  "Risk Management (SL/TP)": `//+------------------------------------------------------------------+
//|                                     RiskManagementStrategy.mq4    |
//|                                                     Momo Platform |
//|------------------------------------------------------------------+
#property copyright "Momo Platform"
#property link      "https://momo-platform.com"
#property version   "1.00"
#property description "MQL4 Fixed SL/TP strategy. Uses 50 SMA, 20-pip SL, 40-pip TP (1:2 RTR), volume check, 1% risk."
// Input parameters
input int    sma_period = 50;          // SMA Period
input double risk_percent = 0.01;      // Risk per trade (%)
input double stop_loss_pips = 20;      // Stop Loss (pips)
input double rr_ratio = 2.0;           // Risk-to-Reward Ratio
input double min_volume = 10.0;        // Minimum Volume (lots)
//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit() {
   return(INIT_SUCCEEDED);
}
//+------------------------------------------------------------------+
//| Expert deinitialization function                                   |
//+------------------------------------------------------------------+
void OnDeinit(const int reason) {
   // No indicator handles to release
}
//+------------------------------------------------------------------+
//| Expert tick function                                              |
//+------------------------------------------------------------------+
void OnTick() {
   // Extract data
   double price = MarketInfo(_Symbol, MODE_BID);
   double account_balance = AccountBalance();
   double volume = MarketInfo(_Symbol, MODE_VOLUME);
   double sma = iMA(_Symbol, PERIOD_CURRENT, sma_period, 0, MODE_SMA, PRICE_CLOSE, 0);
   // Volume check
   if (volume < min_volume) return;
   // Calculate position size
   double pip_value = 10.0;
   double risk_amount = account_balance * risk_percent;
   double lot_size = NormalizeDouble(risk_amount / (stop_loss_pips * pip_value), 2);
   // Trading logic
   if (OrdersTotal() == 0) {
      if (price > sma) {
         double sl = price - stop_loss_pips * Point;
         double tp = price + (stop_loss_pips * rr_ratio) * Point;
         OrderSend(_Symbol, OP_BUY, lot_size, price, 3, sl, tp, "Risk Buy", 0, 0, clrGreen);
      } else if (price < sma) {
         double sl = price + stop_loss_pips * Point;
         double tp = price - (stop_loss_pips * rr_ratio) * Point;
         OrderSend(_Symbol, OP_SELL, lot_size, price, 3, sl, tp, "Risk Sell", 0, 0, clrRed);
      }
   }
}
`,
  "RSI Crossover (Mandatory)": `//+------------------------------------------------------------------+
//|                                        RSICrossoverStrategy.mq4   |
//|                                                     Momo Platform |
//|------------------------------------------------------------------+
#property copyright "Momo Platform"
#property link      "https://momo-platform.com"
#property version   "1.00"
#property description "MQL4 RSI Crossover strategy (Mandatory). Uses RSI(14), 50 SMA, 1:2 RTR, volume check, 1% risk."
// Input parameters
input int    rsi_period = 14;          // RSI Period
input double overbought = 70;          // RSI Overbought Level
input double oversold = 30;            // RSI Oversold Level
input int    sma_period = 50;          // SMA Period
input double risk_percent = 0.01;      // Risk per trade (%)
input double stop_loss_pips = 20;      // Stop Loss (pips)
input double rr_ratio = 2.0;           // Risk-to-Reward Ratio
input double min_volume = 10.0;        // Minimum Volume (lots)
//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit() {
   return(INIT_SUCCEEDED);
}
//+------------------------------------------------------------------+
//| Expert deinitialization function                                   |
//+------------------------------------------------------------------+
void OnDeinit(const int reason) {
   // No indicator handles to release
}
//+------------------------------------------------------------------+
//| Expert tick function                                              |
//+------------------------------------------------------------------+
void OnTick() {
   // Extract data
   double price = MarketInfo(_Symbol, MODE_BID);
   double account_balance = AccountBalance();
   double volume = MarketInfo(_Symbol, MODE_VOLUME);
   double rsi = iRSI(_Symbol, PERIOD_CURRENT, rsi_period, PRICE_CLOSE, 0);
   double sma = iMA(_Symbol, PERIOD_CURRENT, sma_period, 0, MODE_SMA, PRICE_CLOSE, 0);
   // Volume check
   if (volume < min_volume) return;
   // Calculate position size
   double pip_value = 10.0;
   double risk_amount = account_balance * risk_percent;
   double lot_size = NormalizeDouble(risk_amount / (stop_loss_pips * pip_value), 2);
   // Trading logic
   if (OrdersTotal() == 0) {
      if (rsi < oversold && price > sma) {
         double sl = price - stop_loss_pips * Point;
         double tp = price + (stop_loss_pips * rr_ratio) * Point;
         OrderSend(_Symbol, OP_BUY, lot_size, price, 3, sl, tp, "RSI Buy", 0, 0, clrGreen);
      } else if (rsi > overbought && price < sma) {
         double sl = price + stop_loss_pips * Point;
         double tp = price - (stop_loss_pips * rr_ratio) * Point;
         OrderSend(_Symbol, OP_SELL, lot_size, price, 3, sl, tp, "RSI Sell", 0, 0, clrRed);
      }
   }
}
`,
  "MACD Divergence (Optional)": `//+------------------------------------------------------------------+
//|                                      MACDDivergenceStrategy.mq4   |
//|                                                     Momo Platform |
//|------------------------------------------------------------------+
#property copyright "Momo Platform"
#property link      "https://momo-platform.com"
#property version   "1.00"
#property description "MQL4 MACD Divergence strategy (Optional). Uses MACD(12,26,9), 50 SMA, 1:2 RTR, volume check, 1% risk."
// Input parameters
input int    fast_ema = 12;            // MACD Fast EMA
input int    slow_ema = 26;            // MACD Slow EMA
input int    signal = 9;               // MACD Signal Line
input int    sma_period = 50;          // SMA Period
input double risk_percent = 0.01;      // Risk per trade (%)
input double stop_loss_pips = 20;      // Stop Loss (pips)
input double rr_ratio = 2.0;           // Risk-to-Reward Ratio
input double min_volume = 10.0;        // Minimum Volume (lots)
//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit() {
   return(INIT_SUCCEEDED);
}
//+------------------------------------------------------------------+
//| Expert deinitialization function                                   |
//+------------------------------------------------------------------+
void OnDeinit(const int reason) {
   // No indicator handles to release
}
//+------------------------------------------------------------------+
//| Expert tick function                                              |
//+------------------------------------------------------------------+
void OnTick() {
   // Extract data
   double price = MarketInfo(_Symbol, MODE_BID);
   double account_balance = AccountBalance();
   double volume = MarketInfo(_Symbol, MODE_VOLUME);
   double macd = iMACD(_Symbol, PERIOD_CURRENT, fast_ema, slow_ema, signal, PRICE_CLOSE, MODE_MAIN, 0);
   double signal_line = iMACD(_Symbol, PERIOD_CURRENT, fast_ema, slow_ema, signal, PRICE_CLOSE, MODE_SIGNAL, 0);
   double sma = iMA(_Symbol, PERIOD_CURRENT, sma_period, 0, MODE_SMA, PRICE_CLOSE, 0);
   // Volume check
   if (volume < min_volume) return;
   // Calculate position size
   double pip_value = 10.0;
   double risk_amount = account_balance * risk_percent;
   double lot_size = NormalizeDouble(risk_amount / (stop_loss_pips * pip_value), 2);
   // Trading logic
   if (OrdersTotal() == 0) {
      if (macd > signal_line && price > sma) {
         double sl = price - stop_loss_pips * Point;
         double tp = price + (stop_loss_pips * rr_ratio) * Point;
         OrderSend(_Symbol, OP_BUY, lot_size, price, 3, sl, tp, "MACD Buy", 0, 0, clrGreen);
      } else if (macd < signal_line && price < sma) {
         double sl = price + stop_loss_pips * Point;
         double tp = price - (stop_loss_pips * rr_ratio) * Point;
         OrderSend(_Symbol, OP_SELL, lot_size, price, 3, sl, tp, "MACD Sell", 0, 0, clrRed);
      }
   }
}
`
},


Elixir: {
  default: `
defmodule TradingStrategy do
  @moduledoc """
  Default trading strategy based on MQL5 standards.
  - Uses 50-period SMA for trend confirmation.
  - Implements 1:2 risk-to-reward with SL/TP.
  - Includes volume check for trade entry.
  - Risks 1% of account equity per trade.
  """

  def trading_strategy(data) do
    # Input parameters
    sma_period = 50
    risk_percent = 0.01
    rr_ratio = 2.0
    min_volume = 10.0
    stop_loss_pips = 20

    # Extract data
    price = Map.get(data, :close, 0.0)
    account_balance = Map.get(data, :account_balance, 10_000.0)
    volume = Map.get(data, :volume, 0.0)
    sma = Map.get(data, :sma_50, 0.0)

    # Volume check
    if volume < min_volume do
      {:hold, nil}
    else
      # Calculate position size
      pip_value = 10.0
      risk_amount = account_balance * risk_percent
      lot_size = Float.round(risk_amount / (stop_loss_pips * pip_value), 2)

      # Trading logic
      cond do
        price > sma ->
          sl = price - stop_loss_pips * 0.0001
          tp = price + stop_loss_pips * rr_ratio * 0.0001
          {:buy, %{lot_size: lot_size, sl: sl, tp: tp}}
        price < sma ->
          sl = price + stop_loss_pips * 0.0001
          tp = price - stop_loss_pips * rr_ratio * 0.0001
          {:sell, %{lot_size: lot_size, sl: sl, tp: tp}}
        true ->
          {:hold, nil}
      end
    end
  end
end
`,
  "Trailing Stop Loss": `
defmodule TradingStrategy do
  @moduledoc """
  Trailing Stop Loss strategy based on MQL5 standards.
  - Uses 50-period SMA for trend confirmation.
  - Implements trailing stop with 1:2 risk-to-reward.
  - Includes volume check for trade entry.
  - Risks 1% of account equity per trade.
  """

  def trading_strategy(data, current_position, entry_price, high_price_since_entry) do
    # Input parameters
    sma_period = 50
    risk_percent = 0.01
    trail_pips = 15
    stop_loss_pips = 20
    rr_ratio = 2.0
    min_volume = 10.0

    # Extract data
    price = Map.get(data, :close, 0.0)
    account_balance = Map.get(data, :account_balance, 10_000.0)
    volume = Map.get(data, :volume, 0.0)
    sma = Map.get(data, :sma_50, 0.0)

    # Volume check
    if volume < min_volume do
      {:hold, nil}
    else
      # Calculate position size
      pip_value = 10.0
      risk_amount = account_balance * risk_percent
      lot_size = Float.round(risk_amount / (stop_loss_pips * pip_value), 2)

      # Trailing stop logic
      case current_position do
        :buy when price > high_price_since_entry ->
          new_sl = price - trail_pips * 0.0001
          {:update_sl, %{sl: new_sl}}
        :sell when price < high_price_since_entry ->
          new_sl = price + trail_pips * 0.0001
          {:update_sl, %{sl: new_sl}}
        _ ->
          # Entry logic
          if current_position == nil do
            cond do
              price > sma ->
                sl = price - stop_loss_pips * 0.0001
                tp = price + stop_loss_pips * rr_ratio * 0.0001
                {:buy, %{lot_size: lot_size, sl: sl, tp: tp}}
              price < sma ->
                sl = price + stop_loss_pips * 0.0001
                tp = price - stop_loss_pips * rr_ratio * 0.0001
                {:sell, %{lot_size: lot_size, sl: sl, tp: tp}}
              true ->
                {:hold, nil}
            end
          else
            {:hold, nil}
          end
      end
    end
  end
end
`,
  "Risk Management (SL/TP)": `
defmodule TradingStrategy do
  @moduledoc """
  Fixed SL/TP strategy based on MQL5 standards.
  - Uses 50-period SMA for trend confirmation.
  - Implements fixed 20-pip SL and 40-pip TP (1:2 RTR).
  - Includes volume check for trade entry.
  - Risks 1% of account equity per trade.
  """

  def trading_strategy(data) do
    # Input parameters
    sma_period = 50
    risk_percent = 0.01
    stop_loss_pips = 20
    rr_ratio = 2.0
    min_volume = 10.0

    # Extract data
    price = Map.get(data, :close, 0.0)
    account_balance = Map.get(data, :account_balance, 10_000.0)
    volume = Map.get(data, :volume, 0.0)
    sma = Map.get(data, :sma_50, 0.0)

    # Volume check
    if volume < min_volume do
      {:hold, nil}
    else
      # Calculate position size
      pip_value = 10.0
      risk_amount = account_balance * risk_percent
      lot_size = Float.round(risk_amount / (stop_loss_pips * pip_value), 2)

      # Trading logic
      cond do
        price > sma ->
          sl = price - stop_loss_pips * 0.0001
          tp = price + stop_loss_pips * rr_ratio * 0.0001
          {:buy, %{lot_size: lot_size, sl: sl, tp: tp}}
        price < sma ->
          sl = price + stop_loss_pips * 0.0001
          tp = price - stop_loss_pips * rr_ratio * 0.0001
          {:sell, %{lot_size: lot_size, sl: sl, tp: tp}}
        true ->
          {:hold, nil}
      end
    end
  end
end
`,
  "RSI Crossover (Mandatory)": `
defmodule TradingStrategy do
  @moduledoc """
  RSI Crossover strategy based on MQL5 standards (Mandatory).
  - Uses RSI (14) with overbought (70) and oversold (30) levels.
  - Confirms trend with 50-period SMA.
  - Implements 1:2 risk-to-reward with SL/TP.
  - Includes volume check for trade entry.
  - Risks 1% of account equity per trade.
  """

  def trading_strategy(data) do
    # Input parameters
    rsi_period = 14
    overbought = 70
    oversold = 30
    sma_period = 50
    risk_percent = 0.01
    stop_loss_pips = 20
    rr_ratio = 2.0
    min_volume = 10.0

    # Extract data
    price = Map.get(data, :close, 0.0)
    rsi = Map.get(data, :rsi, 0.0)
    account_balance = Map.get(data, :account_balance, 10_000.0)
    volume = Map.get(data, :volume, 0.0)
    sma = Map.get(data, :sma_50, 0.0)

    # Volume check
    if volume < min_volume do
      {:hold, nil}
    else
      # Calculate position size
      pip_value = 10.0
      risk_amount = account_balance * risk_percent
      lot_size = Float.round(risk_amount / (stop_loss_pips * pip_value), 2)

      # Trading logic
      cond do
        rsi < oversold and price > sma ->
          sl = price - stop_loss_pips * 0.0001
          tp = price + stop_loss_pips * rr_ratio * 0.0001
          {:buy, %{lot_size: lot_size, sl: sl, tp: tp}}
        rsi > overbought and price < sma ->
          sl = price + stop_loss_pips * 0.0001
          tp = price - stop_loss_pips * rr_ratio * 0.0001
          {:sell, %{lot_size: lot_size, sl: sl, tp: tp}}
        true ->
          {:hold, nil}
      end
    end
  end
end
`,
  "MACD Divergence (Optional)": `
defmodule TradingStrategy do
  @moduledoc """
  MACD Divergence strategy based on MQL5 standards (Optional).
  - Uses MACD (12,26,9) for divergence detection.
  - Confirms trend with 50-period SMA.
  - Implements 1:2 risk-to-reward with SL/TP.
  - Includes volume check for trade entry.
  - Risks 1% of account equity per trade.
  """

  def trading_strategy(data) do
    # Input parameters
    fast_ema = 12
    slow_ema = 26
    signal = 9
    sma_period = 50
    risk_percent = 0.01
    stop_loss_pips = 20
    rr_ratio = 2.0
    min_volume = 10.0

    # Extract data
    price = Map.get(data, :close, 0.0)
    macd = Map.get(data, :macd, 0.0)
    signal_line = Map.get(data, :signal_line, 0.0)
    account_balance = Map.get(data, :account_balance, 10_000.0)
    volume = Map.get(data, :volume, 0.0)
    sma = Map.get(data, :sma_50, 0.0)

    # Volume check
    if volume < min_volume do
      {:hold, nil}
    else
      # Calculate position size
      pip_value = 10.0
      risk_amount = account_balance * risk_percent
      lot_size = Float.round(risk_amount / (stop_loss_pips * pip_value), 2)

      # Trading logic
      cond do
        macd > signal_line and price > sma ->
          sl = price - stop_loss_pips * 0.0001
          tp = price + stop_loss_pips * rr_ratio * 0.0001
          {:buy, %{lot_size: lot_size, sl: sl, tp: tp}}
        macd < signal_line and price < sma ->
          sl = price + stop_loss_pips * 0.0001
          tp = price - stop_loss_pips * rr_ratio * 0.0001
          {:sell, %{lot_size: lot_size, sl: sl, tp: tp}}
        true ->
          {:hold, nil}
      end
    end
  end
end
`
},


DBots: {
  default: `
{
  "strategy": "DefaultStrategy",
  "description": "Default trading strategy based on MQL5 standards. Uses 50 SMA for trend confirmation, 1:2 RTR with SL/TP, volume check, 1% risk per trade.",
  "parameters": {
    "sma_period": 50,
    "risk_percent": 0.01,
    "stop_loss_pips": 20,
    "rr_ratio": 2.0,
    "min_volume": 10.0
  },
  "logic": {
    "on_tick": {
      "conditions": [
        {
          "if": "volume < min_volume",
          "then": {
            "action": "HOLD",
            "params": null
          }
        },
        {
          "if": "price > sma_50",
          "then": {
            "action": "BUY",
            "params": {
              "lot_size": "account_balance * risk_percent / (stop_loss_pips * 10.0)",
              "sl": "price - stop_loss_pips * 0.0001",
              "tp": "price + (stop_loss_pips * rr_ratio) * 0.0001"
            }
          }
        },
        {
          "if": "price < sma_50",
          "then": {
            "action": "SELL",
            "params": {
              "lot_size": "account_balance * risk_percent / (stop_loss_pips * 10.0)",
              "sl": "price + stop_loss_pips * 0.0001",
              "tp": "price - (stop_loss_pips * rr_ratio) * 0.0001"
            }
          }
        }
      ],
      "default": {
        "action": "HOLD",
        "params": null
      }
    }
  }
}
`,
  "Trailing Stop Loss": `
{
  "strategy": "TrailingStopLossStrategy",
  "description": "Trailing Stop Loss strategy based on MQL5 standards. Uses 50 SMA, trailing stop, 1:2 RTR, volume check, 1% risk.",
  "parameters": {
    "sma_period": 50,
    "risk_percent": 0.01,
    "trail_pips": 15,
    "stop_loss_pips": 20,
    "rr_ratio": 2.0,
    "min_volume": 10.0
  },
  "logic": {
    "on_tick": {
      "conditions": [
        {
          "if": "volume < min_volume",
          "then": {
            "action": "HOLD",
            "params": null
          }
        },
        {
          "if": "position == 'BUY' && price > high_price_since_entry",
          "then": {
            "action": "UPDATE_SL",
            "params": {
              "sl": "price - trail_pips * 0.0001"
            }
          }
        },
        {
          "if": "position == 'SELL' && price < high_price_since_entry",
          "then": {
            "action": "UPDATE_SL",
            "params": {
              "sl": "price + trail_pips * 0.0001"
            }
          }
        },
        {
          "if": "position == null && price > sma_50",
          "then": {
            "action": "BUY",
            "params": {
              "lot_size": "account_balance * risk_percent / (stop_loss_pips * 10.0)",
              "sl": "price - stop_loss_pips * 0.0001",
              "tp": "price + (stop_loss_pips * rr_ratio) * 0.0001"
            }
          }
        },
        {
          "if": "position == null && price < sma_50",
          "then": {
            "action": "SELL",
            "params": {
              "lot_size": "account_balance * risk_percent / (stop_loss_pips * 10.0)",
              "sl": "price + stop_loss_pips * 0.0001",
              "tp": "price - (stop_loss_pips * rr_ratio) * 0.0001"
            }
          }
        }
      ],
      "default": {
        "action": "HOLD",
        "params": null
      }
    }
  }
}
`,
  "Risk Management (SL/TP)": `
{
  "strategy": "RiskManagementStrategy",
  "description": "Fixed SL/TP strategy based on MQL5 standards. Uses 50 SMA, 20-pip SL, 40-pip TP (1:2 RTR), volume check, 1% risk.",
  "parameters": {
    "sma_period": 50,
    "risk_percent": 0.01,
    "stop_loss_pips": 20,
    "rr_ratio": 2.0,
    "min_volume": 10.0
  },
  "logic": {
    "on_tick": {
      "conditions": [
        {
          "if": "volume < min_volume",
          "then": {
            "action": "HOLD",
            "params": null
          }
        },
        {
          "if": "price > sma_50",
          "then": {
            "action": "BUY",
            "params": {
              "lot_size": "account_balance * risk_percent / (stop_loss_pips * 10.0)",
              "sl": "price - stop_loss_pips * 0.0001",
              "tp": "price + (stop_loss_pips * rr_ratio) * 0.0001"
            }
          }
        },
        {
          "if": "price < sma_50",
          "then": {
            "action": "SELL",
            "params": {
              "lot_size": "account_balance * risk_percent / (stop_loss_pips * 10.0)",
              "sl": "price + stop_loss_pips * 0.0001",
              "tp": "price - (stop_loss_pips * rr_ratio) * 0.0001"
            }
          }
        }
      ],
      "default": {
        "action": "HOLD",
        "params": null
      }
    }
  }
}
`,
  "RSI Crossover (Mandatory)": `
{
  "strategy": "RSICrossoverStrategy",
  "description": "RSI Crossover strategy based on MQL5 standards (Mandatory). Uses RSI(14), 50 SMA, 1:2 RTR, volume check, 1% risk.",
  "parameters": {
    "rsi_period": 14,
    "overbought": 70,
    "oversold": 30,
    "sma_period": 50,
    "risk_percent": 0.01,
    "stop_loss_pips": 20,
    "rr_ratio": 2.0,
    "min_volume": 10.0
  },
  "logic": {
    "on_tick": {
      "conditions": [
        {
          "if": "volume < min_volume",
          "then": {
            "action": "HOLD",
            "params": null
          }
        },
        {
          "if": "rsi < oversold && price > sma_50",
          "then": {
            "action": "BUY",
            "params": {
              "lot_size": "account_balance * risk_percent / (stop_loss_pips * 10.0)",
              "sl": "price - stop_loss_pips * 0.0001",
              "tp": "price + (stop_loss_pips * rr_ratio) * 0.0001"
            }
          }
        },
        {
          "if": "rsi > overbought && price < sma_50",
          "then": {
            "action": "SELL",
            "params": {
              "lot_size": "account_balance * risk_percent / (stop_loss_pips * 10.0)",
              "sl": "price + stop_loss_pips * 0.0001",
              "tp": "price - (stop_loss_pips * rr_ratio) * 0.0001"
            }
          }
        }
      ],
      "default": {
        "action": "HOLD",
        "params": null
      }
    }
  }
}
`,
  "MACD Divergence (Optional)": `
{
  "strategy": "MACDDivergenceStrategy",
  "description": "MACD Divergence strategy based on MQL5 standards (Optional). Uses MACD(12,26,9), 50 SMA, 1:2 RTR, volume check, 1% risk.",
  "parameters": {
    "fast_ema": 12,
    "slow_ema": 26,
    "signal": 9,
    "sma_period": 50,
    "risk_percent": 0.01,
    "stop_loss_pips": 20,
    "rr_ratio": 2.0,
    "min_volume": 10.0
  },
  "logic": {
    "on_tick": {
      "conditions": [
        {
          "if": "volume < min_volume",
          "then": {
            "action": "HOLD",
            "params": null
          }
        },
        {
          "if": "macd > signal_line && price > sma_50",
          "then": {
            "action": "BUY",
            "params": {
              "lot_size": "account_balance * risk_percent / (stop_loss_pips * 10.0)",
              "sl": "price - stop_loss_pips * 0.0001",
              "tp": "price + (stop_loss_pips * rr_ratio) * 0.0001"
            }
          }
        },
        {
          "if": "macd < signal_line && price < sma_50",
          "then": {
            "action": "SELL",
            "params": {
              "lot_size": "account_balance * risk_percent / (stop_loss_pips * 10.0)",
              "sl": "price + stop_loss_pips * 0.0001",
              "tp": "price - (stop_loss_pips * rr_ratio) * 0.0001"
            }
          }
        }
      ],
      "default": {
        "action": "HOLD",
        "params": null
      }
    }
  }
}
`
}}

return (
  <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl">Create Your Trading Bot</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Step {step} of {totalSteps}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={progress} className="mb-6" aria-label="Progress through form steps" />
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="botName" className="text-sm font-medium">
                Bot Name
              </Label>
              <Input
                id="botName"
                value={botName}
                onChange={(e) => {
                  setBotName(e.target.value);
                  if (e.target.value.trim()) setError((prev) => ({ ...prev, botName: "" }));
                }}
                placeholder="Enter bot name"
                aria-invalid={!!error.botName}
                aria-describedby="botName-error"
                className={error.botName ? "border-red-500" : ""}
              />
              {error.botName && (
                <p id="botName-error" className="text-red-500 text-xs mt-1">
                  {error.botName}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="botLanguage" className="text-sm font-medium">
                Programming Language
              </Label>
              <Select value={botLanguage} onValueChange={setBotLanguage}>
                <SelectTrigger aria-label="Select programming language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {["Python", "JavaScript", "C++", "Rust", "PineScript", "MQL5", "MQL4", "Elixir", "DBots"].map(
                    (lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="botDescription" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="botDescription"
                value={botDescription}
                onChange={(e) => {
                  setBotDescription(e.target.value);
                  if (e.target.value.trim()) setError((prev) => ({ ...prev, botDescription: "" }));
                }}
                placeholder="Describe your bot's strategy"
                aria-invalid={!!error.botDescription}
                aria-describedby="botDescription-error"
                className={error.botDescription ? "border-red-500" : ""}
              />
              {error.botDescription && (
                <p id="botDescription-error" className="text-red-500 text-xs mt-1">
                  {error.botDescription}
                </p>
              )}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="template" className="text-sm font-medium">
                Strategy Template
              </Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger aria-label="Select strategy template">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "default",
                    "Trailing Stop Loss",
                    "Risk Management (SL/TP)",
                    "RSI Crossover (Mandatory)",
                    "MACD Divergence (Optional)",
                  ].map((template) => (
                    <SelectItem key={template} value={template}>
                      {template}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timeframe" className="text-sm font-medium">
                Timeframe
              </Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger aria-label="Select timeframe">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {["M1", "M5", "M15", "M30", "H1", "H4", "D1"].map((tf) => (
                    <SelectItem key={tf} value={tf}>
                      {tf === "M1"
                        ? "1 Minute"
                        : tf === "M5"
                        ? "5 Minutes"
                        : tf === "M15"
                        ? "15 Minutes"
                        : tf === "M30"
                        ? "30 Minutes"
                        : tf === "H1"
                        ? "1 Hour"
                        : tf === "H4"
                        ? "4 Hours"
                        : "Daily"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Technical Indicators</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["SMA", "RSI", "MACD", "Bollinger Bands"].map((indicator) => (
                  <Badge
                    key={indicator}
                    variant={selectedIndicators.includes(indicator) ? "default" : "outline"}
                    onClick={() =>
                      setSelectedIndicators((prev) =>
                        prev.includes(indicator)
                          ? prev.filter((i) => i !== indicator)
                          : [...prev, indicator]
                      )
                    }
                    className="cursor-pointer text-sm px-3 py-1"
                    aria-pressed={selectedIndicators.includes(indicator)}
                  >
                    {indicator}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Market Data Preview</Label>
              <ChartContainer
                config={{
                  close: { label: "Close Price", color: "hsl(var(--chart-1))" },
                }}
                className="h-[200px] w-full mt-2"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={marketData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="close" stroke="var(--color-close)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="botCode" className="text-sm font-medium">
                Bot Code
              </Label>
              <CodeHighlighter
                language={botLanguage.toLowerCase()}
                value={botCode || defaultCodeTemplates[botLanguage][selectedTemplate]}
                onChange={(value) => setBotCode(value)}
                className="font-mono h-64 w-full rounded-md border p-2"
                aria-label="Edit bot code"
              />
            </div>
            <Button onClick={generateWithAI} disabled={isGeneratingCode} variant="secondary">
                {isGeneratingCode ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isGeneratingCode ? "Generating..." : "Generate with AI"}
              </Button>
              <Button onClick={() => setIsCodeModalOpen(true)} variant="secondary">
              <Code className="mr-2 h-4 w-4" /> View Code in Modal
            </Button>
          </div>
        )}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            disabled={step === 1}
            aria-label="Go to previous step"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button
            onClick={() => {
              if (step === 1) {
                let hasError = false;
                if (!botName.trim()) {
                  setError((prev) => ({ ...prev, botName: "Bot name is required" }));
                  hasError = true;
                }
                if (!botDescription.trim()) {
                  setError((prev) => ({ ...prev, botDescription: "Description is required" }));
                  hasError = true;
                }
                if (hasError) {
                  toast({
                    title: "Validation Error",
                    description: "Please fill in all required fields.",
                    variant: "destructive",
                  });
                  return;
                }
              }
              if (step < totalSteps) {
                setStep((prev) => prev + 1);
              } else {
                const code = botCode || defaultCodeTemplates[botLanguage][selectedTemplate]
                const bot = createBot({
                  name: botName.trim(),
                  language: botLanguage,
                  status: "Production Ready",
                  code,
                  description: botDescription.trim(),
                  symbol: "BTCUSDT",
                  timeframe,
                  indicators: selectedIndicators,
                })
                writeBots([...readBots(), bot])
                toast({
                  title: "Bot Created",
                  description: `${bot.name} is saved in your BotForge workspace.`,
                })
                router.push("/bots");
              }
            }}
            disabled={step === 1 && (!botName.trim() || !botDescription.trim())}
            aria-label={step === totalSteps ? "Finish creating bot" : "Go to next step"}
          >
            {step === totalSteps ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" /> Finish
              </>
            ) : (
              <>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
    <Dialog open={isCodeModalOpen} onOpenChange={setIsCodeModalOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bot Code</DialogTitle>
          <DialogDescription>Review and edit your bot's code.</DialogDescription>
        </DialogHeader>
        <CodeHighlighter
          language={botLanguage.toLowerCase()}
          value={botCode || defaultCodeTemplates[botLanguage][selectedTemplate]}
          onChange={(value) => setBotCode(value)}
          className="font-mono h-[500px] w-full rounded-md border p-2"
          aria-label="Edit bot code in modal"
        />
      </DialogContent>
    </Dialog>
  </div>
);
}


