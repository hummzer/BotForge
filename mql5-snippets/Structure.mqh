//+------------------------------------------------------------------+
//| Structure.mqh — BotForge reusable MQL5 snippet library           |
//| Market structure: swing detection, BOS + pullback, CHoCH,        |
//| liquidity sweeps, and a 50-level Fibonacci retracement grid.     |
//| Drop this file into MQL5/Include/BotForge/ and #include it.      |
//+------------------------------------------------------------------+
#ifndef BOTFORGE_STRUCTURE_MQH
#define BOTFORGE_STRUCTURE_MQH

//--- Swing high/low detection (lookback n bars either side)
bool IsSwingHigh(const string symbol, ENUM_TIMEFRAMES tf, int shift, int n)
{
   double h = iHigh(symbol, tf, shift);
   for(int j = 1; j <= n; j++)
   {
      if(iHigh(symbol, tf, shift + j) >= h) return false;
      if(iHigh(symbol, tf, shift - j) > h)  return false;
   }
   return true;
}

bool IsSwingLow(const string symbol, ENUM_TIMEFRAMES tf, int shift, int n)
{
   double l = iLow(symbol, tf, shift);
   for(int j = 1; j <= n; j++)
   {
      if(iLow(symbol, tf, shift + j) <= l) return false;
      if(iLow(symbol, tf, shift - j) < l)  return false;
   }
   return true;
}

//--- Market structure state machine (BOS / CHoCH)
class MarketStructure
{
public:
   int    trend;      // +1 bull, -1 bear, 0 unknown
   double lastSH;
   double lastSL;
   double legHigh;
   double legLow;
   int    swingN;

   MarketStructure(int n = 3) : trend(0), lastSH(0), lastSL(0), legHigh(0), legLow(0), swingN(n) {}

   void Update(const string symbol, ENUM_TIMEFRAMES tf)
   {
      // scan recent bars for new swings
      for(int s = swingN; s < swingN + 20; s++)
      {
         if(IsSwingHigh(symbol, tf, s, swingN))
         {
            double h = iHigh(symbol, tf, s);
            if(h > lastSH || lastSH == 0) lastSH = h;
            break;
         }
      }
      for(int s = swingN; s < swingN + 20; s++)
      {
         if(IsSwingLow(symbol, tf, s, swingN))
         {
            double l = iLow(symbol, tf, s);
            if(l < lastSL || lastSL == 0) lastSL = l;
            break;
         }
      }
      double close0 = iClose(symbol, tf, 0);
      double close1 = iClose(symbol, tf, 1);
      // BOS
      if(lastSH > 0 && close0 > lastSH && close1 <= lastSH && lastSL > 0)
      { trend = 1; legLow = lastSL; legHigh = iHigh(symbol, tf, 0); }
      else if(lastSL > 0 && close0 < lastSL && close1 >= lastSL && lastSH > 0)
      { trend = -1; legHigh = lastSH; legLow = iLow(symbol, tf, 0); }
      else if(trend == 1) legHigh = MathMax(legHigh, iHigh(symbol, tf, 0));
      else if(trend == -1) legLow = MathMin(legLow, iLow(symbol, tf, 0));
   }

   bool BullishPullback(double fibMin, double fibMax) const
   {
      if(trend != 1 || legHigh <= legLow) return false;
      double close0 = iClose(_Symbol, PERIOD_CURRENT, 0); // caller should pass symbol
      double r = (legHigh - close0) / (legHigh - legLow);
      return (r >= fibMin && r <= fibMax && close0 > iOpen(_Symbol, PERIOD_CURRENT, 0));
   }
};

//--- BOS + Fibonacci pullback entry detection
bool DetectBosPullbackLong(const string symbol, ENUM_TIMEFRAMES tf, int swing, double fibMin, double fibMax)
{
   MarketStructure ms(swing);
   ms.Update(symbol, tf);
   if(ms.trend != 1 || ms.legHigh <= ms.legLow) return false;
   double close0 = iClose(symbol, tf, 0);
   double open0  = iOpen(symbol, tf, 0);
   double r = (ms.legHigh - close0) / (ms.legHigh - ms.legLow);
   return (r >= fibMin && r <= fibMax && close0 > open0);
}

bool DetectBosPullbackShort(const string symbol, ENUM_TIMEFRAMES tf, int swing, double fibMin, double fibMax)
{
   MarketStructure ms(swing);
   ms.Update(symbol, tf);
   if(ms.trend != -1 || ms.legHigh <= ms.legLow) return false;
   double close0 = iClose(symbol, tf, 0);
   double open0  = iOpen(symbol, tf, 0);
   double r = (close0 - ms.legLow) / (ms.legHigh - ms.legLow);
   return (r >= fibMin && r <= fibMax && close0 < open0);
}

//--- Liquidity sweep detection
bool DetectSweepLong(const string symbol, ENUM_TIMEFRAMES tf, int swing)
{
   // Find last swing low
   double lastSL = 0;
   for(int s = swing; s < swing + 50; s++)
   {
      if(IsSwingLow(symbol, tf, s, swing)) { lastSL = iLow(symbol, tf, s); break; }
   }
   if(lastSL == 0) return false;
   double low0 = iLow(symbol, tf, 0);
   double close0 = iClose(symbol, tf, 0);
   return (low0 < lastSL && close0 > lastSL);
}

bool DetectSweepShort(const string symbol, ENUM_TIMEFRAMES tf, int swing)
{
   double lastSH = 0;
   for(int s = swing; s < swing + 50; s++)
   {
      if(IsSwingHigh(symbol, tf, s, swing)) { lastSH = iHigh(symbol, tf, s); break; }
   }
   if(lastSH == 0) return false;
   double high0 = iHigh(symbol, tf, 0);
   double close0 = iClose(symbol, tf, 0);
   return (high0 > lastSH && close0 < lastSH);
}

//--- 50-level Fibonacci retracement grid
struct FibLevels
{
   double levels[50];
   int    count;
};

FibLevels GetFibLevels(double high, double low)
{
   FibLevels f;
   f.count = 0;
   if(high <= low) return f;
   double range = high - low;
   double ratios[] = {0.0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0, 1.272, 1.618, 2.0};
   int n = ArraySize(ratios);
   for(int i = 0; i < n && f.count < 50; i++)
      f.levels[f.count++] = high - range * ratios[i];
   return f;
}

#endif // BOTFORGE_STRUCTURE_MQH
