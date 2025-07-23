"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Bot, X, Loader2 } from "lucide-react"
import { useChat } from "ai/react"
import { cn } from "@/lib/utils"

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const placeholderStrategies = [
    "Generate a bot that uses RSI crossover...",
    "Write a scalping strategy for EUR/USD...",
    "Create a bot with MACD divergence and volume checks...",
    "Develop a trend-following bot with dynamic stop-loss...",
  ]
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0)
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("")
  const [isTypingPlaceholder, setIsTypingPlaceholder] = useState(true)
  const typingSpeed = 50 // ms per character
  const deletingSpeed = 30 // ms per character
  const pauseBetweenStrategies = 1500 // ms

  useEffect(() => {
    let typingTimeout: NodeJS.Timeout
    let deletingTimeout: NodeJS.Timeout
    let pauseTimeout: NodeJS.Timeout

    const type = () => {
      if (displayedPlaceholder.length < placeholderStrategies[currentPlaceholderIndex].length) {
        setDisplayedPlaceholder(
          placeholderStrategies[currentPlaceholderIndex].substring(0, displayedPlaceholder.length + 1),
        )
        typingTimeout = setTimeout(type, typingSpeed)
      } else {
        setIsTypingPlaceholder(false)
        pauseTimeout = setTimeout(del, pauseBetweenStrategies)
      }
    }

    const del = () => {
      if (displayedPlaceholder.length > 0) {
        setDisplayedPlaceholder(displayedPlaceholder.substring(0, displayedPlaceholder.length - 1))
        deletingTimeout = setTimeout(del, deletingSpeed)
      } else {
        setIsTypingPlaceholder(true)
        setCurrentPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholderStrategies.length)
      }
    }

    if (isTypingPlaceholder) {
      type()
    }

    return () => {
      clearTimeout(typingTimeout)
      clearTimeout(deletingTimeout)
      clearTimeout(pauseTimeout)
    }
  }, [displayedPlaceholder, currentPlaceholderIndex, isTypingPlaceholder])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const toggleChatbot = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <Button
        onClick={toggleChatbot}
        className="fixed bottom-4 right-4 bg-spotify-green text-spotify-black hover:bg-spotify-green/90 rounded-full p-4 shadow-lg z-50 transition-all duration-300 hover:scale-110"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>

      {isOpen && (
        <Card className="fixed bottom-20 right-4 w-full max-w-md h-[500px] bg-spotify-dark-grey border-spotify-grey shadow-xl flex flex-col z-50 rounded-lg animate-fade-in-up">
          <CardHeader className="flex flex-row items-center justify-between border-b border-spotify-grey py-3 px-4">
            <CardTitle className="text-lg font-semibold text-spotify-green flex items-center">
              <Bot className="mr-2 h-5 w-5" /> Momo AI Assistant
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={toggleChatbot} className="text-spotify-text-secondary">
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-4 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-spotify-text-secondary text-sm py-8">
                    <p>Hello! I'm Momo AI. How can I assist you today?</p>
                    <p className="mt-2">Try asking me to generate a trading bot strategy!</p>
                  </div>
                )}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn("flex items-start gap-3", m.role === "user" ? "justify-end" : "justify-start")}
                  >
                    {m.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "rounded-lg p-3 text-sm max-w-[75%]",
                        m.role === "user"
                          ? "bg-spotify-green text-spotify-black rounded-br-none"
                          : "bg-spotify-grey text-spotify-text-primary rounded-bl-none",
                      )}
                    >
                      {m.content}
                    </div>
                    {m.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        <AvatarFallback>YOU</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && messages.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 text-sm bg-spotify-grey text-spotify-text-primary rounded-bl-none">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t border-spotify-grey p-4">
            <form onSubmit={handleSubmit} className="flex w-full space-x-2">
              <Input
                placeholder={displayedPlaceholder}
                value={input}
                onChange={handleInputChange}
                className="flex-1 text-sm border-spotify-grey focus:border-spotify-green bg-spotify-black text-spotify-text-primary rounded-md"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="bg-spotify-green text-spotify-black hover:bg-spotify-green/90 transition-all duration-300 rounded-full"
                disabled={isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  )
}
