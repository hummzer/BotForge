import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CallToActionSection() {
  return (
    <section className="bg-spotify-dark-grey py-20 text-center">
      <div className="container mx-auto max-w-4xl px-4">
        <h2 className="mb-4 font-display text-3xl font-bold text-spotify-text-primary">Build the strategy. Test the logic. Watch it run.</h2>
        <p className="mb-8 text-sm text-spotify-text-secondary">BotForge keeps strategy development, historical testing and real-time paper monitoring in one place.</p>
        <Link href="/bots/create"><Button size="lg" className="rounded-full bg-spotify-green text-spotify-black">Create Your First Bot</Button></Link>
      </div>
    </section>
  )
}
