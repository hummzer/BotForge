# BotForge MQL5 Snippet Library

Reusable, drop-in building blocks used throughout generated Expert
Advisors and available for your own manual MQL5 projects. Copy the `.mqh` files into
`MQL5/Include/BotForge/` in your terminal's data folder, then:

```mql5
#include <BotForge/Structure.mqh>
#include <BotForge/RiskMoney.mqh>
#include <BotForge/PositionManagement.mqh>
#include <BotForge/Filters.mqh>
```

BotForge's Strategy Builder generates each MQL5 bot by selecting **only the
snippets a given strategy actually needs** (so generated EAs stay short and
readable) from this same library — see `lib/engine/gen/mql5.ts`.

## Structure.mqh — market structure (snippets 1–6)
Swing high/low detection, a `MarketStructure` trend/BOS/CHoCH state machine,
BOS + Fibonacci-pullback entry detection, liquidity sweep detection, and a
50-level Fibonacci retracement grid (`GetFibLevels`).

## RiskMoney.mqh — risk, lots, SL/TP (snippets 7–17)
Pip-size math, broker minimum stop distance, price/lot normalization, pip
value, lot sizing from risk %, ATR-based auto stop loss, a full `BuildTradePlan`
(SL/TP/lots with broker specs + slippage), and a pre-trade margin check.

## PositionManagement.mqh — managing trades (snippets 18–28)
Manage-all / manage-open / manage-losing / manage-in-profit position
selectors, breakeven, trailing stop (pips and ATR), partial close, and
close-all for positions and pending orders.

## Filters.mqh — guards, execution, utilities (snippets 29–43)
New-bar detection, session/spread/daily-loss/margin/news-blackout filters,
one-trade-per-symbol guard, retrying order send, retcode-to-string logging,
an on-chart dashboard helper, currency conversion, a higher-timeframe MA
read, a volume-spike filter, basic RSI divergence detection, and a
support/resistance proximity check.

Every function takes the symbol/timeframe/handle explicitly rather than
assuming `_Symbol`/`_Period`, so the same snippet works unmodified across
multiple charts or a multi-symbol EA.
