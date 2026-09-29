# BotForge

Trading workspace: **browse strategies**, **compile plain-English strategies** into 8 languages, **backtest**, **journal**, and **connect brokers**. Dark UI inspired by TraderDev / TradingKit.

**Repo:** [hummzer/BotForge](https://github.com/hummzer/BotForge)

## Stack

- Next.js 15 + TypeScript + Tailwind + Radix UI
- Strategy engine: `lib/engine/` (spec → indicators → backtest → generators)
- Payments: Safaricom Daraja (M-Pesa production STK) + PayPal Orders API
- Broker bridge: OANDA practice REST + session bridges for MT4/MT5 and others

## Quick start

```bash
npm install
npm run dev
```

```bash
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run test:engine  # smoke-test engines + generators
```

## Main routes

| Path | Purpose |
|------|---------|
| `/strategies` | Browse Strategies (leaderboard-style cards + filters) |
| `/backtest` | Run backtests |
| `/backtest/report` | TradingKit-style performance report |
| `/bots` · `/bots/create` | Saved bots · strategy builder / code gen |
| `/brokers` | Connect MT4/MT5, OANDA, cTrader, Deriv, IBKR, Binance, … |
| `/journal` | Trade journal |
| `/pricing` | Plans + M-Pesa / PayPal checkout |
| `/settings` | Account settings |

`/data` (Market Data import) was removed and redirects to `/strategies`.

## Strategy engine

```
lib/engine/
  spec.ts          StrategySpec (Zod) — entry rules, risk, management, filters
  indicators.ts    SMA/EMA/RSI/MACD/BB/ATR/Stoch/Donchian + BOS/sweep structure
  backtest.ts      Bar-by-bar simulation
  gen/             python · mql4 · mql5 · pine · javascript · cpp · rust · elixir
mql5-snippets/     Structure · RiskMoney · PositionManagement · Filters
```

API: `POST /api/generate-bot-code` compiles a free-text prompt or structured `spec` into source for selected languages (deterministic engine; optional `useAi: true`).

## Brokers

| Venue | Status | Notes |
|-------|--------|--------|
| MetaTrader 5 / 4 | live (session) | Credentials stored in browser session for dashboard |
| OANDA | live | Practice REST; token + account id → `/api/brokers/oanda/connect` |
| cTrader, Deriv, Binance | beta | Session bridge |
| IBKR, Bybit, FXCM | planned | UI listed |
| Pepperstone, IC Markets, Exness | via MT | Use MT4/MT5 bridge |

Set a real OANDA practice token (long string) as password with the account id for live practice equity.

## Payments

| Method | Endpoint | Env |
|--------|----------|-----|
| M-Pesa STK | `POST /api/payments/mpesa/stk` | `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`, `MPESA_SHORTCODE`, `MPESA_CALLBACK_URL` |
| M-Pesa callback | `POST /api/payments/mpesa/callback` | (production Daraja) |
| PayPal | `POST /api/payments/paypal/create` | `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` |

Manual fallbacks on `/pricing`:
- M-Pesa: **0716 475 923**
- PayPal: **salimhamza371@gmail.com**

Without env vars, APIs return `503` with setup instructions and the UI falls back to manual pay.

## Environment (Vercel)

```
OPENAI_API_KEY=              # optional AI fallback for generate-bot-code
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_PASSKEY=
MPESA_SHORTCODE=
MPESA_CALLBACK_URL=https://<your-domain>/api/payments/mpesa/callback
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

## What remains / known gaps

1. **Generators depth** — Core paths work for all 8 languages; full parity with the original zip (richer MQL / C++ / Rust bodies) can be deepened further.
2. **MQL5 private repo** — `hummzer/MQL5` is mostly compiled `.ex4`/`.ex5` EAs, not `.mqh` sources. Snippets in `mql5-snippets/` are maintained here for automation.
3. **Live strategy leaderboard data** — Browse page uses demo leaderboard cards; wire to a DB/API when ready.
4. **Broker adapters** — Only OANDA practice is full REST; others use local session until each API adapter is finished.
5. **Auth** — Client-side auth context; production should use a real provider (Clerk/Auth.js) + server session.
6. **Payment fulfillment** — STK/PayPal create orders; persist `ResultCode 0` / captured orders and unlock Pro/Quant entitlements in DB.
7. **npm audit** — Several dependency advisories; run `npm audit` and upgrade carefully on Next 15.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run test:engine` | Engine + generator smoke test |

---

Built by [Hummzer](https://hummzer.vercel.app/)
