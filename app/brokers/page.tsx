"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Link2, Wifi } from "lucide-react"

const STORAGE_KEY = "botforge_broker"

const BROKERS = [
  { id: "mt5", name: "MetaTrader 5", status: "live", desc: "EA deploy + account bridge" },
  { id: "mt4", name: "MetaTrader 4", status: "live", desc: "EA deploy + account bridge" },
  { id: "oanda", name: "OANDA", status: "live", desc: "REST practice / live token" },
  { id: "ctrader", name: "cTrader", status: "beta", desc: "Open API bridge" },
  { id: "deriv", name: "Deriv", status: "beta", desc: "CFDs API" },
  { id: "binance", name: "Binance", status: "beta", desc: "Spot + futures keys" },
  { id: "ibkr", name: "Interactive Brokers", status: "planned", desc: "TWS / Gateway" },
  { id: "bybit", name: "Bybit", status: "planned", desc: "Unified API" },
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
          setMessage("Connected to OANDA practice.")
          setLoading(false)
          return
        }
        setMessage(d.error || "OANDA connection failed")
        setLoading(false)
        return
      }

      const next: BrokerAccount = {
        accountId: accountId.trim(),
        balance: 0,
        equity: 0,
        marginUsed: 0,
        freeMargin: 0,
        currency: "USD",
        leverage: "—",
        server: `${brokerId.toUpperCase()}-session`,
        brokerId,
        connectedAt: new Date().toISOString(),
      }
      setAccount(next)
      setConnected(true)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setPassword("")
      setMessage(
        `Session stored for ${BROKERS.find((b) => b.id === brokerId)?.name}. Live balances require that broker’s API credentials on the server.`,
      )
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
    <div className="bf-page">
      <div className="bf-container bf-section-gap">
        <div>
          <p className="bf-kicker">Brokers</p>
          <h1 className="bf-title">Connect account</h1>
          <p className="bf-sub">
            OANDA practice uses live REST when you paste a real token. MT and others store a session for the workspace until
            full adapters are enabled with API keys.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BROKERS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBrokerId(b.id)}
              className={
                brokerId === b.id
                  ? "rounded-2xl border border-spotify-green bg-spotify-green/10 p-4 text-left"
                  : "bf-card-pad text-left hover:border-spotify-green/40"
              }
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">{b.name}</p>
                <Badge
                  className={
                    b.status === "live"
                      ? "bg-spotify-green/15 text-spotify-green border-0"
                      : b.status === "beta"
                        ? "bg-amber-500/15 text-amber-300 border-0"
                        : "bg-spotify-grey text-spotify-text-secondary border-0"
                  }
                >
                  {b.status}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-spotify-text-secondary">{b.desc}</p>
            </button>
          ))}
        </div>

        <Card className="border-spotify-grey bg-spotify-dark-grey">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-spotify-green" />
              {BROKERS.find((b) => b.id === brokerId)?.name} credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {connected && account ? (
              <>
                <div className="flex items-center justify-between">
                  <Badge className="gap-1 bg-spotify-green text-spotify-black">
                    <Wifi className="h-3 w-3" /> CONNECTED
                  </Badge>
                  <Button variant="outline" size="sm" onClick={disconnect} className="border-spotify-grey text-red-400">
                    Disconnect
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Account", account.accountId],
                    ["Broker", account.brokerId],
                    ["Balance", `${account.currency} ${account.balance.toFixed(2)}`],
                    ["Equity", `${account.currency} ${account.equity.toFixed(2)}`],
                    ["Server", account.server],
                    ["Connected", new Date(account.connectedAt).toLocaleString()],
                  ].map(([label, val]) => (
                    <div key={label} className="rounded-xl border border-spotify-grey bg-spotify-black p-4">
                      <p className="text-xs text-spotify-text-secondary">{label}</p>
                      <p className="mt-1 font-mono text-sm">{val}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label className="text-spotify-text-secondary">Account / key id</Label>
                  <Input
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="mt-2 h-12 border-spotify-grey bg-spotify-black"
                  />
                </div>
                <div>
                  <Label className="text-spotify-text-secondary">Password / API token</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 h-12 border-spotify-grey bg-spotify-black"
                  />
                </div>
                <Button onClick={connect} disabled={loading} className="bf-btn-primary w-full">
                  {loading ? "Connecting…" : "Connect"}
                </Button>
              </>
            )}
            {message && <p className="text-sm text-spotify-text-secondary">{message}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
