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

type TokenChartPoint = {
  label: string;
  value: number;
};

type TokenChartProps = {
  data: TokenChartPoint[];
  symbol: string;
};

export default function TokenChart({
  data,
  symbol,
}: TokenChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
        <p className="text-sm text-zinc-500">
          No performance data available.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
          Performance
        </p>

        <h3 className="mt-1 text-lg font-semibold text-white">
          {symbol} price performance
        </h3>
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
              formatter={(value) => [
                `${Number(value).toFixed(2)}%`,
                "Change",
              ]}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}