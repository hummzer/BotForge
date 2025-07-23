import { BotCreationForm } from "@/components/bot-creation-form"

export default function CreateBotPage() {
  return (
    <div className="min-h-screen bg-spotify-black font-sans text-spotify-text-primary py-8">
      <div className="container mx-auto max-w-3xl px-4">
        <h1 className="font-display text-3xl font-bold text-spotify-text-primary mb-4 animate-fade-in-up">
          Create New Trading Bot
        </h1>
        <p className="text-spotify-text-secondary text-sm mb-8 animate-fade-in-up animation-delay-200">
          Follow the steps to define your bot's strategy and generate its code.
        </p>
        <BotCreationForm />
      </div>
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
