//+------------------------------------------------------------------+
//| RiskMoney.mqh — BotForge risk, lots, SL/TP helpers               |
//+------------------------------------------------------------------+
#ifndef BOTFORGE_RISKMONEY_MQH
#define BOTFORGE_RISKMONEY_MQH

double PipSize(const string symbol)
{
   double point = SymbolInfoDouble(symbol, SYMBOL_POINT);
   int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
   return (digits == 3 || digits == 5) ? point * 10.0 : point;
}

double BrokerMinStop(const string symbol)
{
   long stops = SymbolInfoInteger(symbol, SYMBOL_TRADE_STOPS_LEVEL);
   return stops * SymbolInfoDouble(symbol, SYMBOL_POINT);
}

double NormalizePrice(const string symbol, double price)
{
   int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
   return NormalizeDouble(price, digits);
}

double NormalizeLots(const string symbol, double lots)
{
   double minLot = SymbolInfoDouble(symbol, SYMBOL_VOLUME_MIN);
   double maxLot = SymbolInfoDouble(symbol, SYMBOL_VOLUME_MAX);
   double step   = SymbolInfoDouble(symbol, SYMBOL_VOLUME_STEP);
   lots = MathFloor(lots / step) * step;
   if(lots < minLot) lots = minLot;
   if(lots > maxLot) lots = maxLot;
   return NormalizeDouble(lots, 2);
}

double PipValue(const string symbol, double lots)
{
   double tickValue = SymbolInfoDouble(symbol, SYMBOL_TRADE_TICK_VALUE);
   double tickSize  = SymbolInfoDouble(symbol, SYMBOL_TRADE_TICK_SIZE);
   double pip = PipSize(symbol);
   if(tickSize <= 0) return 0;
   return (pip / tickSize) * tickValue * lots;
}

double LotsFromRisk(const string symbol, double riskPercent, double stopPips)
{
   if(stopPips <= 0) return SymbolInfoDouble(symbol, SYMBOL_VOLUME_MIN);
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double riskMoney = balance * (riskPercent / 100.0);
   double pv = PipValue(symbol, 1.0);
   if(pv <= 0) return SymbolInfoDouble(symbol, SYMBOL_VOLUME_MIN);
   return NormalizeLots(symbol, riskMoney / (stopPips * pv));
}

double AtrStopDistance(const string symbol, ENUM_TIMEFRAMES tf, int period, double mult)
{
   int handle = iATR(symbol, tf, period);
   if(handle == INVALID_HANDLE) return 0;
   double buf[];
   ArraySetAsSeries(buf, true);
   if(CopyBuffer(handle, 0, 0, 1, buf) < 1) return 0;
   return buf[0] * mult;
}

struct TradePlan
{
   double lots;
   double sl;
   double tp;
   double entry;
   bool   valid;
};

TradePlan BuildTradePlan(const string symbol, int side, double entry, double riskPercent, double rr,
                         double stopDist, double slippagePips = 0)
{
   TradePlan p;
   p.valid = false;
   p.entry = entry;
   double pip = PipSize(symbol);
   double minStop = BrokerMinStop(symbol);
   if(stopDist < minStop) stopDist = minStop;
   double stopPips = stopDist / pip;
   p.lots = LotsFromRisk(symbol, riskPercent, stopPips);
   if(side > 0)
   {
      p.sl = NormalizePrice(symbol, entry - stopDist);
      p.tp = NormalizePrice(symbol, entry + stopDist * rr);
   }
   else
   {
      p.sl = NormalizePrice(symbol, entry + stopDist);
      p.tp = NormalizePrice(symbol, entry - stopDist * rr);
   }
   p.valid = (p.lots > 0 && stopDist > 0);
   return p;
}

bool MarginOk(const string symbol, double lots, ENUM_ORDER_TYPE type)
{
   double margin = 0;
   if(!OrderCalcMargin(type, symbol, lots, SymbolInfoDouble(symbol, SYMBOL_ASK), margin)) return false;
   return (AccountInfoDouble(ACCOUNT_MARGIN_FREE) > margin * 1.1);
}

#endif // BOTFORGE_RISKMONEY_MQH
