"use client"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Key, User, Server, Wallet } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export default function SettingsPage() {
  const { toast } = useToast()
  const [vpsProvider, setVpsProvider] = useState("momo")
  const [isConnectingVps, setIsConnectingVps] = useState(false)
  const [isConnectingWallet, setIsConnectingWallet] = useState(false)

  const handleConnectVps = () => {
    setIsConnectingVps(true)
    toast({
      title: "Connecting VPS...",
      description: `Attempting to connect to ${vpsProvider} VPS.`,
      variant: "default",
    })
    setTimeout(() => {
      toast({
        title: "VPS Connected!",
        description: `Successfully connected to ${vpsProvider} VPS.`,
        variant: "success",
      })
      setIsConnectingVps(false)
    }, 2000)
  }

  const handleConnectWallet = () => {
    setIsConnectingWallet(true)
    toast({
      title: "Connecting Wallet...",
      description: "Attempting to connect your wallet.",
      variant: "default",
    })
    setTimeout(() => {
      toast({
        title: "Wallet Connected!",
        description: "Your wallet has been successfully connected.",
        variant: "success",
      })
      setIsConnectingWallet(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-spotify-black font-sans text-spotify-text-primary py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <h1 className="font-display text-3xl font-bold text-spotify-text-primary mb-4 animate-fade-in-up">
          Account Settings
        </h1>
        <p className="text-spotify-text-secondary text-sm mb-8 animate-fade-in-up animation-delay-200">
          Manage your profile, security, and preferences.
        </p>

        <Tabs defaultValue="profile" className="w-full animate-fade-in-up animation-delay-300">
          <TabsList className="grid w-full grid-cols-4 bg-spotify-grey text-spotify-text-primary rounded-lg mb-6">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-spotify-dark-grey data-[state=active]:text-spotify-green"
            >
              <User className="mr-2 h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-spotify-dark-grey data-[state=active]:text-spotify-green"
            >
              <Key className="mr-2 h-4 w-4" /> Security
            </TabsTrigger>
            <TabsTrigger
              value="vps"
              className="data-[state=active]:bg-spotify-dark-grey data-[state=active]:text-spotify-green"
            >
              <Server className="mr-2 h-4 w-4" /> VPS Services
            </TabsTrigger>
            <TabsTrigger
              value="wallet"
              className="data-[state=active]:bg-spotify-dark-grey data-[state=active]:text-spotify-green"
            >
              <Wallet className="mr-2 h-4 w-4" /> Wallet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="shadow-sm border-spotify-grey bg-spotify-dark-grey p-6 rounded-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-spotify-text-primary flex items-center">
                  <User className="mr-2 h-5 w-5 text-spotify-green" /> Profile Information
                </CardTitle>
                <CardDescription className="text-sm text-spotify-text-secondary">
                  Update your personal details.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-sm text-spotify-text-primary">
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    defaultValue="John Doe"
                    className="text-sm border-spotify-grey focus:border-spotify-green bg-spotify-black text-spotify-text-primary rounded-md"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm text-spotify-text-primary">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="john.doe@example.com"
                    disabled
                    className="text-sm border-spotify-grey bg-spotify-black/50 text-spotify-text-secondary cursor-not-allowed rounded-md"
                  />
                </div>
                <Button className="bg-spotify-green text-spotify-black hover:bg-spotify-green/90 text-sm transition-all duration-300 hover:scale-105 rounded-full">
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="shadow-sm border-spotify-grey bg-spotify-dark-grey p-6 rounded-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-spotify-text-primary flex items-center">
                  <Key className="mr-2 h-5 w-5 text-spotify-green" /> Change Password
                </CardTitle>
                <CardDescription className="text-sm text-spotify-text-secondary">
                  Update your account password.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password" className="text-sm text-spotify-text-primary">
                    Current Password
                  </Label>
                  <Input
                    id="current-password"
                    type="password"
                    className="text-sm border-spotify-grey focus:border-spotify-green bg-spotify-black text-spotify-text-primary rounded-md"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password" className="text-sm text-spotify-text-primary">
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    className="text-sm border-spotify-grey focus:border-spotify-green bg-spotify-black text-spotify-text-primary rounded-md"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-new-password" className="text-sm text-spotify-text-primary">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    className="text-sm border-spotify-grey focus:border-spotify-green bg-spotify-black text-spotify-text-primary rounded-md"
                  />
                </div>
                <Button className="bg-spotify-green text-spotify-black hover:bg-spotify-green/90 text-sm transition-all duration-300 hover:scale-105 rounded-full">
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vps">
            <Card className="shadow-sm border-spotify-grey bg-spotify-dark-grey p-6 rounded-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-spotify-text-primary flex items-center">
                  <Server className="mr-2 h-5 w-5 text-spotify-green" /> VPS Services
                </CardTitle>
                <CardDescription className="text-sm text-spotify-text-secondary">
                  Order Momo VPS or connect your existing cloud VPS for 24/7 bot operation.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="vps-provider" className="text-sm text-spotify-text-primary">
                    Select VPS Provider
                  </Label>
                  <Select value={vpsProvider} onValueChange={setVpsProvider}>
                    <SelectTrigger
                      id="vps-provider"
                      className="text-sm border-spotify-grey focus:border-spotify-green bg-spotify-black text-spotify-text-primary rounded-md"
                    >
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent className="bg-spotify-dark-grey text-spotify-text-primary border-spotify-grey rounded-md">
                      <SelectItem value="momo">Momo Managed VPS</SelectItem>
                      <SelectItem value="aws">AWS</SelectItem>
                      <SelectItem value="google-cloud">Google Cloud</SelectItem>
                      <SelectItem value="azure">Azure</SelectItem>
                      <SelectItem value="digitalocean">DigitalOcean</SelectItem>
                      <SelectItem value="vultr">Vultr</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {vpsProvider !== "momo" && (
                  <div className="grid gap-2">
                    <Label htmlFor="api-key" className="text-sm text-spotify-text-primary">
                      API Key / Access Token
                    </Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder={`Enter your ${vpsProvider} API Key`}
                      className="text-sm border-spotify-grey focus:border-spotify-green bg-spotify-black text-spotify-text-primary rounded-md"
                    />
                  </div>
                )}
                <Button
                  onClick={handleConnectVps}
                  disabled={isConnectingVps}
                  className="bg-spotify-green text-spotify-black hover:bg-spotify-green/90 text-sm transition-all duration-300 hover:scale-105 rounded-full"
                >
                  {isConnectingVps ? "Connecting..." : "Connect VPS"}
                </Button>
                {vpsProvider === "momo" && (
                  <p className="text-xs text-spotify-text-secondary mt-2">
                    Momo Managed VPS offers optimized performance and simplified setup.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet">
            <Card className="shadow-sm border-spotify-grey bg-spotify-dark-grey p-6 rounded-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-spotify-text-primary flex items-center">
                  <Wallet className="mr-2 h-5 w-5 text-spotify-green" /> Wallet Connection
                </CardTitle>
                <CardDescription className="text-sm text-spotify-text-secondary">
                  Connect your crypto or traditional wallet for seamless fund management.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="wallet-type" className="text-sm text-spotify-text-primary">
                    Wallet Type
                  </Label>
                  <Select defaultValue="crypto">
                    <SelectTrigger
                      id="wallet-type"
                      className="text-sm border-spotify-grey focus:border-spotify-green bg-spotify-black text-spotify-text-primary rounded-md"
                    >
                      <SelectValue placeholder="Select wallet type" />
                    </SelectTrigger>
                    <SelectContent className="bg-spotify-dark-grey text-spotify-text-primary border-spotify-grey rounded-md">
                      <SelectItem value="crypto">Crypto Wallet (e.g., MetaMask, Trust Wallet)</SelectItem>
                      <SelectItem value="traditional">Traditional Bank Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wallet-address" className="text-sm text-spotify-text-primary">
                    Wallet Address / Account Number
                  </Label>
                  <Input
                    id="wallet-address"
                    type="text"
                    placeholder="Enter your wallet address or account number"
                    className="text-sm border-spotify-grey focus:border-spotify-green bg-spotify-black text-spotify-text-primary rounded-md"
                  />
                </div>
                <Button
                  onClick={handleConnectWallet}
                  disabled={isConnectingWallet}
                  className="bg-spotify-green text-spotify-black hover:bg-spotify-green/90 text-sm transition-all duration-300 hover:scale-105 rounded-full"
                >
                  {isConnectingWallet ? "Connecting..." : "Connect Wallet"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Page-specific CTA */}
        <div className="mt-12 text-center animate-fade-in-up animation-delay-600">
          <h2 className="font-display text-2xl font-bold text-spotify-text-primary mb-4">Need Assistance?</h2>
          <p className="text-spotify-text-secondary text-sm mb-6">
            Our support team is here to help you with any questions or issues.
          </p>
          <Button
            size="lg"
            className="bg-spotify-green text-spotify-black hover:bg-spotify-green/90 transition-all duration-300 hover:scale-105 rounded-full"
          >
            Contact Support
          </Button>
        </div>
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
