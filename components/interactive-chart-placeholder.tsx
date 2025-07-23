import { LineChart, BarChart } from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

interface InteractiveChartPlaceholderProps {
  isLive?: boolean
}

export function InteractiveChartPlaceholder({ isLive = false }: InteractiveChartPlaceholderProps) {
  // Generate mock data for a line chart
  const generateMockData = (numPoints: number) => {
    const data = []
    let value = 100
    for (let i = 0; i < numPoints; i++) {
      value += Math.random() * 10 - 5 // Random fluctuation
      data.push({ name: `Point ${i + 1}`, value: Number.parseFloat(value.toFixed(2)) })
    }
    return data
  }

  const chartData = generateMockData(isLive ? 20 : 50) // Fewer points for live, more for static

  return (
    <div className="w-full bg-spotify-black border border-spotify-grey rounded-lg p-4 relative overflow-hidden">
      <div className="flex justify-between items-center text-spotify-text-secondary text-sm mb-2">
        <span>BTC/USD - 1H</span>
        <span>Current Price: {chartData[chartData.length - 1].value.toFixed(2)}</span>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--spotify-green))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--spotify-green))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--spotify-grey))" vertical={false} />
            <XAxis dataKey="name" hide />
            <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--spotify-dark-grey))",
                borderColor: "hsl(var(--spotify-grey))",
                color: "hsl(var(--spotify-text-primary))",
              }}
              itemStyle={{ color: "hsl(var(--spotify-text-primary))" }}
              labelStyle={{ color: "hsl(var(--spotify-green))" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--spotify-green))"
              fill="url(#colorUv)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between items-center text-spotify-text-secondary text-xs mt-2">
        <span>
          Indicators: SMA(50), RSI(14) <LineChart className="inline-block h-3 w-3 ml-1" />
        </span>
        <span>
          Volume <BarChart className="inline-block h-3 w-3 ml-1" />
        </span>
      </div>
    </div>
  )
}
