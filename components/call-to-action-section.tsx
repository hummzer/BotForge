import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Rocket } from "lucide-react"

export function CallToActionSection() {
  return (
    <section className="py-16 bg-spotify-dark-grey text-center rounded-lg mx-4 md:mx-auto max-w-6xl shadow-xl animate-fade-in-up animation-delay-100">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-4xl font-bold text-spotify-text-primary mb-6">
          Ready to Transform Your Trading?
        </h2>
        <p className="text-lg text-spotify-text-secondary mb-8">
          Join Momo today and take control of your financial future with intelligent automation.
        </p>
        <Link href="/bots/create">
          <Button
            size="lg"
            className="bg-spotify-green text-spotify-black hover:bg-spotify-green/90 transition-all duration-300 hover:scale-105 rounded-full shadow-lg"
          >
            <Rocket className="mr-2 h-5 w-5" /> Get Started for Free
          </Button>
        </Link>
      </div>
    </section>
  )
}
