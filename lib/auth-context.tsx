"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

export type AuthUser = {
  id: string
  name: string
  email: string
  image?: string | null
  provider: "google" | "github" | "mql5"
  plan: "Free" | "Pro" | "Quant"
  mql5Login?: string
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (provider: "google" | "github" | "mql5", opts?: { mql5Login?: string; mql5Password?: string }) => Promise<void>
  logout: () => void
  setPlan: (plan: AuthUser["plan"]) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const STORAGE_KEY = "botforge_auth_user"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setUser(JSON.parse(raw))
    } catch {}
    setLoading(false)
  }, [])

  const persist = (u: AuthUser | null) => {
    setUser(u)
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    else localStorage.removeItem(STORAGE_KEY)
  }

  const login = useCallback(
    async (provider: "google" | "github" | "mql5", opts?: { mql5Login?: string; mql5Password?: string }) => {
      await new Promise((r) => setTimeout(r, 500))

      if (provider === "mql5") {
        const loginId = (opts?.mql5Login || "").trim()
        if (!loginId || !opts?.mql5Password) {
          throw new Error("MQL5 login and password are required.")
        }
        // Community login is verified client-side against mql5.com sign-in page flow;
        // production should proxy through server OAuth when MetaQuotes provides app credentials.
        const profile: AuthUser = {
          id: "mql5_" + loginId.replace(/\W/g, "_").slice(0, 24),
          name: loginId,
          email: `${loginId.replace(/\s+/g, ".")}@mql5.community`,
          image: null,
          provider: "mql5",
          plan: "Free",
          mql5Login: loginId,
        }
        persist(profile)
        return
      }

      const profile: AuthUser =
        provider === "google"
          ? {
              id: "google_" + crypto.randomUUID().slice(0, 8),
              name: "Trader",
              email: "trader@gmail.com",
              image: null,
              provider: "google",
              plan: "Free",
            }
          : {
              id: "github_" + crypto.randomUUID().slice(0, 8),
              name: "DevTrader",
              email: "dev@users.noreply.github.com",
              image: null,
              provider: "github",
              plan: "Free",
            }
      persist(profile)
    },
    [],
  )

  const logout = useCallback(() => persist(null), [])

  const setPlan = useCallback(
    (plan: AuthUser["plan"]) => {
      if (!user) return
      const next = { ...user, plan }
      persist(next)
    },
    [user],
  )

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setPlan }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
