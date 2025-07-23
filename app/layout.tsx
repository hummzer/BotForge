import type React from "react"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import ClientLayout from "./ClientLayout"

export const metadata = {
  title: "Momo - AI Trading Bot Platform",
  description: "Build, backtest, and deploy AI-powered trading bots with ease.",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientLayout>
      {children}
      <Toaster />
    </ClientLayout>
  )
}
