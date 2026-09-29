# BotForge

Spotify-themed algorithmic trading workspace: **compile strategies**, **backtest real candles**, **journal**, **chart**, **connect brokers**, **run paper bots**.

## Stack

- Next.js 15 · TypeScript · Tailwind · Radix
- Engine: `lib/engine/` (spec → indicators → backtest → 8 generators)
- Market: `/api/market/candles` (Binance proxy), `/api/market/gold` (XAUUSD banner)
- Payments: Daraja STK + PayPal Orders
- Workspace: browser localStorage with full JSON export/import

## Core flow

1. **Sign in** → Strategies / Bots / Backtest unlock  
2. **Describe strategy** → compiler → **Save as bot**  
3. **Backtest / Forward / Optimize** on Binance data → **Report**  
4. **Run / Pause / Stop** bots · **VPS** links · **Live** paper BTC stream  
5. **Journal** with vibes · **Chart** (TradingView) · **Brokers** (OANDA live, Binance key validate)  
6. **Settings** → export/import workspace backup  

## Key APIs

| Route | Role |
|-------|------|
| `POST /api/generate-bot-code` | Deterministic multi-lang compiler |
| `GET /api/market/candles` | Binance klines proxy |
| `GET /api/market/gold` | Gold quote for XAUUSD strip |
| `POST /api/brokers/oanda/connect` | OANDA practice REST |
| `POST /api/brokers/binance/validate` | Binance API key check |
| `POST /api/payments/mpesa/stk` | Daraja production STK |
| `POST /api/payments/paypal/create` | PayPal Orders |

## Env (Vercel)

```
OPENAI_API_KEY=                 # optional AI fallback
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_PASSKEY=
MPESA_SHORTCODE=
MPESA_CALLBACK_URL=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

## Scripts

```bash
npm install && npm run dev
npm run build
npm run typecheck
npm run test:engine
```

## What remains

- Production OAuth (next-auth already in deps)
- Persist workspace to a database (currently local browser)
- Full REST adapters beyond OANDA + Binance validate
- Payment webhook → plan entitlement
- Deeper generator parity for edge-case specs

Built by [Hummzer](https://hummzer.vercel.app/)
