"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MarketChartPoint = {
  label: string;
  value: number;
};

type MarketChartProps = {
  data: MarketChartPoint[];
  label?: string;
};

export default function MarketChart({
  data,
  label = "Market Score",
}: MarketChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
        <p className="text-sm text-zinc-500">No chart data available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
          Market Trend
        </p>

        <h3 className="mt-1 text-lg font-semibold text-white">{label}</h3>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
            />

            <XAxis
              dataKey="label"
              tick={{
                fill: "#71717a",
                fontSize: 11,
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{
                fill: "#71717a",
                fontSize: 11,
              }}
              axisLine={false}
              tickLine={false}
              width={45}
            />

            <Tooltip
              contentStyle={{
                background: "#09090b",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "#fff",
              }}
              labelStyle={{
                color: "#a1a1aa",
              }}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#ffffff"              dot={false}
              activeDot={{
                r: 4,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}