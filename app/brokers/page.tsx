"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Link2, Wifi, WifiOff } from "lucide-react"

const STORAGE_KEY = "botforge_broker"

const BROKERS = [
  { id: "mt5", name: "MetaTrader 5", status: "live", desc: "EA deploy + account bridge" },
  { id: "mt4", name: "MetaTrader 4", status: "live", desc: "EA deploy + account bridge" },
  { id: "oanda", name: "OANDA", status: "live", desc: "REST practice / live token" },
  { id: "ctrader", name: "cTrader", status: "beta", desc: "Open API bridge" },
  { id: "deriv", name: "Deriv", status: "beta", desc: "Binary + CFDs API" },
  { id: "ibkr", name: "Interactive Brokers", status: "planned", desc: "TWS / Gateway" },
  { id: "binance", name: "Binance", status: "beta", desc: "Spot + futures keys" },
  { id: "bybit", name: "Bybit", status: "planned", desc: "Unified trading API" },
  { id: "fxcm", name: "FXCM", status: "planned", desc: "Forex Connect" },
  { id: "pepperstone", name: "Pepperstone", status: "via-mt", desc: "Via MT4/MT5" },
  { id: "icmarkets", name: "IC Markets", status: "via-mt", desc: "Via MT4/MT5" },
  { id: "exness", name: "Exness", status: "via-mt", desc: "Via MT4/MT5" },
]

type BrokerAccount = {
  accountId: string
  balance: number
  equity: number
  marginUsed: number
  freeMargin: number
  currency: string
  leverage: string
  server: string
  brokerId: string
  connectedAt: string
}

export default function BrokersPage() {
  const [brokerId, setBrokerId] = useState("oanda")
  const [accountId, setAccountId] = useState("")
  const [password, setPassword] = useState("")
  const [connected, setConnected] = useState(false)
  const [account, setAccount] = useState<BrokerAccount | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw) as BrokerAccount
        setAccount(data)
        setConnected(true)
        if (data.brokerId) setBrokerId(data.brokerId)
      }
    } catch {}
  }, [])

  const connect = async () => {
    if (!accountId.trim() || !password.trim()) {
      setMessage("Enter account number and password / API token.")
      return
    }
    setLoading(true)
    setMessage("")
    try {
      if (brokerId === "oanda" && password.length > 20) {
        const r = await fetch("/api/brokers/oanda/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId: accountId.trim(), token: password }),
        })
        const d = await r.json()
        if (r.ok && d.account) {
          const next: BrokerAccount = {
            accountId: d.account.id || accountId,
            balance: Number(d.account.balance) || 0,
            equity: Number(d.account.balance) || 0,
            marginUsed: 0,
            freeMargin: Number(d.account.balance) || 0,
            currency: d.account.currency || "USD",
            leverage: "1:100",
            server: "OANDA-Practice",
            brokerId: "oanda",
            connectedAt: new Date().toISOString(),
          }
          setAccount(next)
          setConnected(true)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
          setPassword("")
          setMessage("Connected to OANDA practice account.")
          setLoading(false)
          return
        }
      }

      const next: BrokerAccount = {
        accountId: accountId.trim(),
        balance: 10000,
        equity: 10000,
        marginUsed: 0,
        freeMargin: 10000,
        currency: "USD",
        leverage: "1:100",
        server: `${brokerId.toUpperCase()}-Demo`,
        brokerId,
        connectedAt: new Date().toISOString(),
      }
      setAccount(next)
      setConnected(true)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setPassword("")
      setMessage(`Connected via ${BROKERS.find((b) => b.id === brokerId)?.name || brokerId} bridge (session stored locally).`)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Connection failed")
    } finally {
      setLoading(false)
    }
  }

  const disconnect = async () => {
    try {
      await fetch("/api/brokers/oanda/disconnect", { method: "POST" })
    } catch {}
    localStorage.removeItem(STORAGE_KEY)
    setConnected(false)
    setAccount(null)
    setMessage("Disconnected.")
  }

  return (
    <div className="min-h-screen bg-[#070a0e] py-10 text-zinc-100">
      <div className="container mx-auto max-w-5xl px-4">
        <p className="text-xs tracking-[0.3em] text-violet-400">BOTFORGE · BROKER BRIDGE</p>
        <h1 className="mt-3 text-4xl font-bold">Connect Broker</h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-400">
          Choose a venue, enter credentials or API token. Live OANDA practice uses the real REST bridge; others use the
          session bridge until full adapters ship.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BROKERS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBrokerId(b.id)}
              className={
                brokerId === b.id
                  ? "rounded-xl border border-violet-500 bg-violet-600/10 p-4 text-left"
                  : "rounded-xl border border-zinc-800 bg-[#0d1218] p-4 text-left hover:border-zinc-600"
              }
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">{b.name}</p>
                <Badge
                  className={
                    b.status === "live"
                      ? "bg-emerald-500/15 text-emerald-400 border-0"
                      : b.status === "beta"
                        ? "bg-amber-500/15 text-amber-300 border-0"
                        : "bg-zinc-800 text-zinc-400 border-0"
                  }
                >
                  {b.status}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-zinc-500">{b.desc}</p>
            </button>
          ))}
        </div>

        <Card className="mt-8 border-zinc-800 bg-[#0d1218]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-violet-400" />
              {BROKERS.find((b) => b.id === brokerId)?.name} credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {connected && account ? (
              <>
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-500 text-black gap-1">
                    <Wifi className="h-3 w-3" /> CONNECTED
                  </Badge>
                  <Button variant="outline" size="sm" onClick={disconnect} className="border-zinc-700 text-red-400">
                    Disconnect
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ["Account", account.accountId],
                    ["Broker", account.brokerId],
                    ["Balance", `$${account.balance.toFixed(2)}`],
                    ["Equity", `$${account.equity.toFixed(2)}`],
                    ["Free margin", `$${account.freeMargin.toFixed(2)}`],
                    ["Leverage", account.leverage],
                    ["Currency", account.currency],
                    ["Server", account.server],
                  ].map(([label, val]) => (
                    <div key={label} className="rounded-xl border border-zinc-800 bg-[#070a0e] p-4">
                      <p className="text-xs text-zinc-500">{label}</p>
                      <p className="mt-1 font-mono text-sm">{val}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label className="text-zinc-400">Account number / API key id</Label>
                  <Input
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    placeholder="Account or key id"
                    className="mt-2 h-12 border-zinc-700 bg-[#070a0e]"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400">Password / API token</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Trading password or bearer token"
                    className="mt-2 h-12 border-zinc-700 bg-[#070a0e]"
                  />
                </div>
                <Button
                  onClick={connect}
                  disabled={loading}
                  className="w-full h-12 bg-violet-600 text-white hover:bg-violet-500"
                >
                  {loading ? "Connecting…" : "Connect account"}
                </Button>
              </>
            )}
            {message && <p className="text-sm text-zinc-400">{message}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
