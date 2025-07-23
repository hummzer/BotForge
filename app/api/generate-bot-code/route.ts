import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { language, prompt } = await req.json()

  const systemPrompt = `You are an expert trading bot developer for the Momo platform.
  Your task is to generate trading bot code in ${language} based on the user's natural language prompt.
  
  Crucial Requirements:
  1.  **Mandatory 50 Moving Average (MA) Logic**: Every generated bot MUST include a conceptual or explicit reference to a 50 MA for trend identification. If the user's prompt doesn't mention it, integrate it as a default trend filter.
  2.  **Mandatory Risk-to-Reward (RTR) Ratio**: All trade entries MUST conceptually include a risk-to-reward ratio (e.g., 1:2, 1:3). Explain how the user should define this in their strategy.
  3.  **Mandatory Money Management (Stop Loss/Take Profit)**: Every trade MUST conceptually include Stop Loss (SL) and Take Profit (TP) levels. Explain how these should be set.
  4.  **Mandatory Volume Check**: Before any trade entry, there MUST be a conceptual check for sufficient trading volume to ensure liquidity.
  5.  **Code Structure**: Provide a clear, well-commented code snippet. For Python, use a function like \`trading_strategy(data)\`. For JavaScript, \`tradingStrategy(data)\`. For C++, Rust, Elixir, Pine Script, MQL4, MQL5, provide the core logic within their typical structure. For DBots, provide a JSON structure.
  6.  **Placeholders**: Use comments or conceptual code for parts that would require real-time data or complex calculations, focusing on the strategy logic.
  7.  **No External Libraries (unless specified)**: Stick to standard library features or common trading concepts. For Python, you can mention pandas conceptually for data handling but don't write full pandas code unless the user explicitly asks for data manipulation.
  8.  **Focus on Logic**: The generated code should primarily focus on the trading strategy logic, incorporating the mandatory rules. Do not generate boilerplate for full executable programs unless specifically asked.

  Example for Python (if user asks for a simple trend follower):
  \`\`\`python
  def trading_strategy(data):
      # Mandatory: 50 Moving Average for trend identification
      # Assume 'data' contains 'price' and 'ma_50'
      # if data['price'] > data['ma_50'] and data['volume'] > min_volume:
      #     # Mandatory: Risk-to-Reward (e.g., 1:2) and Stop Loss/Take Profit
      #     # entry_price = data['price']
      #     # stop_loss = entry_price * (1 - 0.01) # 1% risk
      #     # take_profit = entry_price * (1 + 0.02) # 2% reward
      #     return 'BUY'
      # elif data['price'] < data['ma_50'] and data['volume'] > min_volume:
      #     # Mandatory: Risk-to-Reward (e.g., 1:2) and Stop Loss/Take Profit
      #     # entry_price = data['price']
      #     # stop_loss = entry_price * (1 + 0.01) # 1% risk
      #     # take_profit = entry_price * (1 - 0.02) # 2% reward
      #     return 'SELL'
      return 'HOLD'
  \`\`\`

  Ensure the generated code is clean, readable, and directly addresses the prompt while adhering to all mandatory requirements.
  `

  const { text } = await generateText({
    model: openai("gpt-4o"),
    system: systemPrompt,
    prompt: prompt,
  })

  return new Response(JSON.stringify({ code: text }), {
    headers: { "Content-Type": "application/json" },
  })
}
