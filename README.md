# BotForge

Spotify-themed algorithmic trading workspace.

## What works now

- **Hero live markets**: BTC/USDT stream + XAU/USD (gold) card *below* it (not in the navbar)
- **6-step bot builder**: identity → market → prompt → AI provider (BotForge / OpenAI) → compile all 8 languages → review
- **Free plan**: all 8 sources generated; **run target** limited to Python, MQL5, Pine Script
- **My Bots**: multi-language source tabs, set run language, download, VPS links
- **Strategy tester**: MetaTrader-style Expert / Symbol / Period / Deposit / Start / Report (no RSI UI clutter)
- **Economic calendar**: Investing.com embed (`/calendar`)
- **Auth**: Google · GitHub · **MQL5 Community** login fields
- **TradingView**: real sign-in popup on tradingview.com (session cookies); partner OAuth still requires TV agreement
- **OANDA**: connect + **transaction history** API when token is set
- **Workspace**: export / import JSON · Settings
- **SEO**: expanded metadata, sitemap, robots

## Env keys only (you set these)

```
OPENAI_API_KEY=
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_PASSKEY=
MPESA_SHORTCODE=
MPESA_CALLBACK_URL=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

Optional later: `NEXTAUTH_*`, MetaQuotes / TradingView partner client IDs.

## What remains

1. **Production OAuth** — wire next-auth Google/GitHub; MetaQuotes official app OAuth for MQL5
2. **TradingView partner SSO** — public widgets cannot fully SSO without a TV commercial agreement
3. **Database** — move bots/journal/tests off localStorage
4. **Payment → plan** — webhook unlocks Pro/Quant (today plan can be set in session after pay)
5. **Full broker REST** — IBKR, cTrader, live MT bridge beyond session + OANDA
6. **Investing.com calendar** — iframe styling depends on their widget; fallback if blocked by adblock

Built by [Hummzer](https://hummzer.vercel.app/)
