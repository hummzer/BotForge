import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Code, BarChart, Rocket } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      icon: Lightbulb,
      title: "1. Define Your Strategy",
      description: "Use natural language or select from templates to describe your trading logic.",
    },
    {
      icon: Code,
      title: "2. Generate & Refine Code",
      description: "Our AI generates the bot code. Customize it in our integrated editor.",
    },
    {
      icon: BarChart,
      title: "3. Backtest & Optimize",
      description: "Test your bot against historical data, analyze performance, and get AI suggestions.",
    },
    {
      icon: Rocket,
      title: "4. Deploy Live",
      description: "Connect to your preferred broker and deploy your bot to trade 24/7.",
    },
  ]

  return (
    <section className="py-16 bg-spotify-black">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="font-display text-4xl font-bold text-center text-spotify-text-primary mb-12 animate-fade-in-up">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="bg-spotify-dark-grey border-spotify-grey shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up rounded-lg"
              style={{ animationDelay: `${100 + index * 75}ms` }}
            >
              <CardHeader className="flex flex-col items-center text-center pb-2">
                <step.icon className="h-10 w-10 text-spotify-green mb-4" />
                <CardTitle className="text-xl font-semibold text-spotify-text-primary">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-spotify-text-secondary text-sm text-center">{step.description}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
