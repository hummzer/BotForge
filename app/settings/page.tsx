"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import {
  downloadWorkspace,
  importWorkspace,
  clearWorkspaceData,
  workspaceStats,
} from "@/lib/workspace"
import {
  readTradingViewUsername,
  writeTradingViewUsername,
} from "@/lib/botforge"
import { Download, Upload, Trash2, User, Database, LineChart } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const { user } = useAuth()
  const [tv, setTv] = useState("")
  const [stats, setStats] = useState({ bots: 0, running: 0, tests: 0, journal: 0 })
  const [msg, setMsg] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const refresh = () => {
    setTv(readTradingViewUsername())
    setStats(workspaceStats())
  }

  useEffect(() => {
    refresh()
    const onUp = () => refresh()
    window.addEventListener("botforge-workspace-updated", onUp)
    return () => window.removeEventListener("botforge-workspace-updated", onUp)
  }, [])

  const onImport = async (file: File) => {
    const text = await file.text()
    const res = importWorkspace(text)
    setMsg(res.ok ? "Workspace imported." : res.error || "Import failed")
    refresh()
  }

  const onClear = () => {
    if (!confirm("Clear bots, tests, journal, and broker session from this browser? Auth stays.")) return
    clearWorkspaceData()
    setMsg("Workspace cleared.")
    refresh()
  }

  return (
    <div className="bf-page">
      <div className="bf-container bf-section-gap">
        <div>
          <p className="bf-kicker">Settings</p>
          <h1 className="bf-title">Workspace</h1>
          <p className="bf-sub">
            Profile, TradingView handle, and full backup of everything stored in this browser.
          </p>
        </div>

        <div className="bf-grid-stats">
          <div className="bf-stat">
            <p className="bf-stat-label">Bots</p>
            <p className="bf-stat-value">{stats.bots}</p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Running</p>
            <p className="bf-stat-value text-spotify-green">{stats.running}</p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Tests</p>
            <p className="bf-stat-value">{stats.tests}</p>
          </div>
          <div className="bf-stat">
            <p className="bf-stat-label">Journal rows</p>
            <p className="bf-stat-value">{stats.journal}</p>
          </div>
        </div>

        <Card className="border-spotify-grey bg-spotify-dark-grey">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-spotify-green" /> Account
            </CardTitle>
            <CardDescription>From your current session (local until OAuth is wired).</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-spotify-grey bg-spotify-black p-4">
              <p className="text-xs text-spotify-text-secondary">Name</p>
              <p className="mt-1 font-medium">{user?.name || "—"}</p>
            </div>
            <div className="rounded-xl border border-spotify-grey bg-spotify-black p-4">
              <p className="text-xs text-spotify-text-secondary">Email</p>
              <p className="mt-1 font-medium">{user?.email || "—"}</p>
            </div>
            <div className="rounded-xl border border-spotify-grey bg-spotify-black p-4">
              <p className="text-xs text-spotify-text-secondary">Provider</p>
              <p className="mt-1 font-medium capitalize">{user?.provider || "—"}</p>
            </div>
            <div className="rounded-xl border border-spotify-grey bg-spotify-black p-4">
              <p className="text-xs text-spotify-text-secondary">Plan</p>
              <p className="mt-1 font-medium">{user?.plan || "Free"}</p>
            </div>
            <Link href="/pricing" className="sm:col-span-2">
              <Button className="bf-btn-primary w-full sm:w-auto">Manage plan</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-spotify-grey bg-spotify-dark-grey">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-spotify-green" /> TradingView
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-spotify-text-secondary">Username</Label>
              <Input
                value={tv}
                onChange={(e) => setTv(e.target.value)}
                className="mt-2 border-spotify-grey bg-spotify-black"
                placeholder="your_tv_handle"
              />
            </div>
            <Button
              className="bf-btn-primary"
              onClick={() => {
                writeTradingViewUsername(tv.trim())
                setMsg("TradingView username saved.")
              }}
            >
              Save
            </Button>
            <Link href="/chart">
              <Button variant="outline" className="border-spotify-grey">
                Open chart
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-spotify-grey bg-spotify-dark-grey">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-spotify-green" /> Data
            </CardTitle>
            <CardDescription>
              Export a full JSON backup or restore on another device. Clear removes local trading data only.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button className="bf-btn-primary" onClick={() => downloadWorkspace()}>
              <Download className="mr-2 h-4 w-4" /> Export workspace
            </Button>
            <Button
              variant="outline"
              className="border-spotify-grey"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" /> Import JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) onImport(f)
                e.target.value = ""
              }}
            />
            <Button variant="outline" className="border-spotify-grey text-red-400" onClick={onClear}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear local data
            </Button>
          </CardContent>
        </Card>

        {msg && <p className="text-sm text-spotify-green">{msg}</p>}
      </div>
    </div>
  )
}
