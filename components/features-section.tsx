import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, TrendingUp, Cloud, Brain, ShieldCheck, Zap } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Code,
      title: "AI-Powered Code Generation",
      description: "Generate complex trading strategies from natural language prompts in multiple languages.",
    },
    {
      icon: TrendingUp,
      title: "Advanced Backtesting",
      description: "Rigorously test your bots against historical data with detailed performance metrics and charts.",
    },
    {
      icon: Cloud,
      title: "Seamless Cloud Deployment",
      description: "Deploy your bots to Momo's managed VPS or connect your own cloud services for 24/7 operation.",
    },
    {
      icon: Brain,
      title: "Intelligent Optimization",
      description: "Receive AI-driven suggestions to fine-tune your strategies for maximum profitability.",
    },
    {
      icon: ShieldCheck,
      title: "Robust Risk Management",
      description: "Built-in tools for Stop Loss, Take Profit, and Risk-to-Reward ratios to protect your capital.",
    },
    {
      icon: Zap,
      title: "Real-time Market Data",
      description: "Access live data feeds and connect to popular brokers like Deriv, Binance, and Kraken.",
    },
  ]

  return (
    <section className="py-16 bg-spotify-black">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="font-display text-4xl font-bold text-center text-spotify-text-primary mb-12 animate-fade-in-up">
          Why Choose Momo?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-spotify-dark-grey border-spotify-grey shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up rounded-lg"
              style={{ animationDelay: `${100 + index * 75}ms` }}
            >
              <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                <feature.icon className="h-8 w-8 text-spotify-green" />
                <CardTitle className="text-xl font-semibold text-spotify-text-primary">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-spotify-text-secondary text-sm">{feature.description}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
