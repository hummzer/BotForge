import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { WhyChooseUsSection } from "@/components/why-choose-us-section"
import { CallToActionSection } from "@/components/call-to-action-section"
import { NewsPanel } from "@/components/news-panel"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-spotify-black font-sans text-spotify-text-primary">
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <WhyChooseUsSection />
        <NewsPanel />
        <CallToActionSection />
      </main>
      <footer className="border-t border-spotify-grey bg-spotify-dark-grey py-8 text-center text-xs text-spotify-text-secondary">
        <div className="container mx-auto max-w-6xl px-4">
          &copy; {new Date().getFullYear()} BotForge. All rights reserved. Built by{" "}
          <a href="https://hummzer.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-spotify-green hover:underline">Hummzer</a>.
        </div>
      </footer>
    </div>
  )
}
