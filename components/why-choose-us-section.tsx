import { CheckCircle } from "lucide-react"

export function WhyChooseUsSection() {
  const advantages = [
    "Intuitive, user-friendly interface for all skill levels.",
    "Cutting-edge AI for strategy generation and optimization.",
    "Comprehensive backtesting with detailed performance reports.",
    "Secure and reliable infrastructure for live trading.",
    "Multi-language support for bot development (Python, JS, C++, Rust, Pine Script, MQL4/5, Elixir, DBots).",
    "Seamless integration with major brokers and cloud VPS providers.",
    "Dedicated support to help you succeed.",
    "Focus on risk management and capital preservation.",
  ]

  return (
    <section className="py-16 bg-spotify-black">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="font-display text-4xl font-bold text-center text-spotify-text-primary mb-12 animate-fade-in-up">
          Our Advantages
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {advantages.map((advantage, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 animate-fade-in-up"
              style={{ animationDelay: `${100 + index * 50}ms` }}
            >
              <CheckCircle className="h-6 w-6 text-spotify-green flex-shrink-0 mt-1" />
              <p className="text-lg text-spotify-text-primary">{advantage}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
