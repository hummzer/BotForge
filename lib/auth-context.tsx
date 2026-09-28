"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

export type AuthUser = {
  id: string
  name: string
  email: string
  image?: string | null
  provider: "google" | "github"
  plan: "Free" | "Pro" | "Quant"
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (provider: "google" | "github") => Promise<void>
  logout: () => void
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

  const login = useCallback(async (provider: "google" | "github") => {
    // Production: replace with next-auth signIn(provider).
    // This provides a working Google/GitHub-style login flow that persists
    // until real OAuth client IDs are configured in the environment.
    await new Promise((r) => setTimeout(r, 700))
    const profile =
      provider === "google"
        ? {
            id: "google_" + crypto.randomUUID().slice(0, 8),
            name: "Trader",
            email: "trader@gmail.com",
            image: null,
            provider: "google" as const,
            plan: "Free" as const,
          }
        : {
            id: "github_" + crypto.randomUUID().slice(0, 8),
            name: "DevTrader",
            email: "dev@users.noreply.github.com",
            image: null,
            provider: "github" as const,
            plan: "Free" as const,
          }
    setUser(profile)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
