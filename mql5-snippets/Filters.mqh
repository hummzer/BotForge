//+------------------------------------------------------------------+
//| Filters.mqh — BotForge session, spread, news, new-bar filters    |
//+------------------------------------------------------------------+
#ifndef BOTFORGE_FILTERS_MQH
#define BOTFORGE_FILTERS_MQH

datetime g_lastBarTime = 0;

bool IsNewBar(const string symbol = NULL, ENUM_TIMEFRAMES tf = PERIOD_CURRENT)
{
   datetime t = iTime(symbol == NULL ? _Symbol : symbol, tf, 0);
   if(t != g_lastBarTime) { g_lastBarTime = t; return true; }
   return false;
}

bool SessionOk(int startHour, int endHour)
{
   MqlDateTime dt;
   TimeToStruct(TimeCurrent(), dt);
   if(startHour < endHour) return (dt.hour >= startHour && dt.hour < endHour);
   return (dt.hour >= startHour || dt.hour < endHour);
}

bool SpreadOk(const string symbol, double maxPips)
{
   double point = SymbolInfoDouble(symbol, SYMBOL_POINT);
   int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
   double pip = (digits == 3 || digits == 5) ? point * 10 : point;
   double spread = (SymbolInfoDouble(symbol, SYMBOL_ASK) - SymbolInfoDouble(symbol, SYMBOL_BID)) / pip;
   return spread <= maxPips;
}

bool DailyLossOk(double maxLossPercent)
{
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   if(balance <= 0) return false;
   double lossPct = (balance - equity) / balance * 100.0;
   return lossPct < maxLossPercent;
}

bool OneTradePerSymbol(const string symbol)
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(PositionSelectByTicket(PositionGetTicket(i)))
         if(PositionGetString(POSITION_SYMBOL) == symbol) return false;
   }
   return true;
}

#endif // BOTFORGE_FILTERS_MQH
