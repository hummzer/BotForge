import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://bot-forge-ten.vercel.app"
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/bots/create`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/backtest`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/live-bots`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/data`, changeFrequency: "weekly", priority: 0.7 },
  ]
}
