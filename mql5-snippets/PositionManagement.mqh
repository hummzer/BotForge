//+------------------------------------------------------------------+
//| PositionManagement.mqh — BotForge position management helpers    |
//+------------------------------------------------------------------+
#ifndef BOTFORGE_POSITIONMANAGEMENT_MQH
#define BOTFORGE_POSITIONMANAGEMENT_MQH

#include <Trade/Trade.mqh>

// Shared trade object for modify/close helpers (EA may also declare its own)
CTrade g_botforge_trade;

int CountPositions(const string symbol)
{
   int n = 0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(PositionSelectByTicket(PositionGetTicket(i)))
         if(PositionGetString(POSITION_SYMBOL) == symbol) n++;
   }
   return n;
}

void MoveToBreakeven(const string symbol, double bufferPips = 1)
{
   double pip = SymbolInfoDouble(symbol, SYMBOL_POINT);
   int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
   if(digits == 3 || digits == 5) pip *= 10;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(!PositionSelectByTicket(ticket)) continue;
      if(PositionGetString(POSITION_SYMBOL) != symbol) continue;
      double open = PositionGetDouble(POSITION_PRICE_OPEN);
      double sl = PositionGetDouble(POSITION_SL);
      long type = PositionGetInteger(POSITION_TYPE);
      double be = (type == POSITION_TYPE_BUY) ? open + bufferPips * pip : open - bufferPips * pip;
      be = NormalizeDouble(be, digits);
      if(type == POSITION_TYPE_BUY && (sl < open || sl == 0))
         g_botforge_trade.PositionModify(ticket, be, PositionGetDouble(POSITION_TP));
      if(type == POSITION_TYPE_SELL && (sl > open || sl == 0))
         g_botforge_trade.PositionModify(ticket, be, PositionGetDouble(POSITION_TP));
   }
}

void TrailByPips(const string symbol, double trailPips)
{
   double pip = SymbolInfoDouble(symbol, SYMBOL_POINT);
   int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
   if(digits == 3 || digits == 5) pip *= 10;
   double trail = trailPips * pip;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(!PositionSelectByTicket(ticket)) continue;
      if(PositionGetString(POSITION_SYMBOL) != symbol) continue;
      double open = PositionGetDouble(POSITION_PRICE_OPEN);
      double sl = PositionGetDouble(POSITION_SL);
      long type = PositionGetInteger(POSITION_TYPE);
      double bid = SymbolInfoDouble(symbol, SYMBOL_BID);
      double ask = SymbolInfoDouble(symbol, SYMBOL_ASK);
      if(type == POSITION_TYPE_BUY)
      {
         double ns = NormalizeDouble(bid - trail, digits);
         if(ns > sl && ns > open) g_botforge_trade.PositionModify(ticket, ns, PositionGetDouble(POSITION_TP));
      }
      else
      {
         double ns = NormalizeDouble(ask + trail, digits);
         if((ns < sl || sl == 0) && ns < open) g_botforge_trade.PositionModify(ticket, ns, PositionGetDouble(POSITION_TP));
      }
   }
}

void CloseAll(const string symbol)
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(!PositionSelectByTicket(ticket)) continue;
      if(PositionGetString(POSITION_SYMBOL) != symbol) continue;
      g_botforge_trade.PositionClose(ticket);
   }
}

#endif // BOTFORGE_POSITIONMANAGEMENT_MQH
