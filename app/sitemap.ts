import type { MetadataRoute } from "next"

const base = "https://bot-forge-ten.vercel.app"

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/pricing",
    "/login",
    "/calendar",
    "/strategies",
    "/bots",
    "/bots/create",
    "/backtest",
    "/backtest/report",
    "/chart",
    "/journal",
    "/brokers",
    "/settings",
    "/live-bots",
  ]
  return paths.map((p) => ({
    url: `${base}${p || "/"}`,
    lastModified: new Date(),
    changeFrequency: p === "" || p === "/pricing" ? "weekly" : "monthly",
    priority: p === "" ? 1 : p === "/pricing" ? 0.9 : 0.7,
  }))
}
