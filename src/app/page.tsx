"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MarketChart from "@/components/MarketChart";

type MarketAsset = {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  rank: number | null;
  price: number | null;
  marketCap: number | null;
  volume24h: number;
  volumeChange24h: number;
  percentChange1h: number;
  percentChange24h: number;
  percentChange7d: number;
  percentChange30d: number;
  marketCapDominance: number;
  lastUpdated: string;
};
  type MarketSignal = {
  type:
    | "momentum"
    | "volume_surge"
    | "selloff"
    | "anomaly"
    | "confirmation"
    | "divergence"
    | "absorption";
  score: number;
  title: string;
  description: string;
  asset: MarketAsset;
};

function getSignalStyle(type: MarketSignal["type"]) {
  switch (type) {
    case "confirmation":
      return {
        badge:
          "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        accent: "border-emerald-500/20",
      };

    case "divergence":
      return {
        badge:
          "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        accent: "border-amber-500/20",
      };

    case "selloff":
      return {
        badge: "bg-red-500/10 text-red-400 border border-red-500/20",
        accent: "border-red-500/20",
      };

    case "volume_surge":
      return {
        badge: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
        accent: "border-blue-500/20",
      };

    case "anomaly":
      return {
        badge:
          "bg-purple-500/10 text-purple-400 border border-purple-500/20",
        accent: "border-purple-500/20",
      };
    case "absorption":
       return {
          badge:
            "bg-orange-500/10 text-orange-400 border border-orange-500/20",
          accent: "border-orange-500/20",
        };
    case "momentum":
    default:
      return {
        badge: "bg-white/5 text-zinc-400 border border-white/10",
        accent: "border-white/10",
      };
  }
}

type MarketAnalysis = {
  marketBias: "bullish" | "bearish" | "mixed";
  marketScore: number;
  signals: MarketSignal[];
  topGainers: MarketAsset[];
  topLosers: MarketAsset[];
  volumeLeaders: MarketAsset[];
};

type MarketResponse = {
  success: boolean;
  source: string;
  count: number;
  data: MarketAsset[];
  analysis: MarketAnalysis;
  error?: string;
};

type AskResponse = {
  success: boolean;
  answer?: string;
  error?: string;
  source?: string;
};

const suggestedQuestions = [
  "Why is the market moving this way?",
  "What assets show unusual activity?",
  "Which assets have the strongest momentum?",
  "Is volume confirming the current trend?",
];

function formatPrice(value: number | null) {
  if (value === null) return "—";

  if (value >= 1000) {
    return `$${value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })}`;
  }

  if (value >= 1) {
    return `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })}`;
  }

  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  })}`;
}

function formatCompact(value: number | null) {
  if (value === null) return "—";

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

function Change({ value }: { value: number }) {
  const positive = value >= 0;

  return (
    <span className={positive ? "text-emerald-400" : "text-red-400"}>
      {positive ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

export default function Home() {
  const [market, setMarket] = useState<MarketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState("");

  useEffect(() => {
    async function loadMarket() {
      try {
        setLoading(true);

        const response = await fetch("/api/market", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to load market data");
        }

        setMarket(result);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load market data"
        );
      } finally {
        setLoading(false);
      }
    }

    loadMarket();
  }, []);

  async function askMarketMind(customQuestion?: string) {
    const currentQuestion = (customQuestion ?? question).trim();

    if (!currentQuestion || askLoading) return;

    try {
      setAskLoading(true);
      setAskError("");

      if (customQuestion) {
        setQuestion(customQuestion);
      }

      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion,
        }),
      });

      const result: AskResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to generate market analysis"
        );
      }

      setAnswer(result.answer ?? "");
    } catch (err) {
      setAskError(
        err instanceof Error
          ? err.message
          : "Failed to generate market analysis"
      );
    } finally {
      setAskLoading(false);
    }
  }

  const btc = useMemo(
    () => market?.data.find((asset) => asset.id === 1) ?? null,
    [market]
  );

  const totalVolume = useMemo(
    () =>
      market?.data.reduce(
        (total, asset) => total + asset.volume24h,
        0
      ) ?? 0,
    [market]
  );

  const positiveAssets = useMemo(
    () =>
      market?.data.filter(
        (asset) => asset.percentChange24h > 0
      ).length ?? 0,
    [market]
  );

  const breadth = market
    ? `${positiveAssets}/${market.count}`
    : "—";

  const marketChartData = useMemo(
    () =>
      btc
        ? [
            { label: "1H", value: btc.percentChange1h },
            { label: "24H", value: btc.percentChange24h },
            { label: "7D", value: btc.percentChange7d },
            { label: "30D", value: btc.percentChange30d },
          ]
        : [],
    [btc]
  );

  return (
    <main className="min-h-screen bg-[#05070b] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-black text-black">
                M
              </div>

              <h1 className="text-2xl font-bold tracking-tight">
                MarketMind
              </h1>
            </div>

            <p className="mt-2 text-sm text-zinc-500">
              Don&apos;t just see what moved. Ask why.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-xs text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            LIVE MARKET DATA
          </div>
        </header>

        {loading && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />

            <p className="text-sm text-zinc-400">
              Analyzing the market...
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <p className="text-sm font-medium text-red-400">
              Market data unavailable
            </p>

            <p className="mt-2 text-xs text-zinc-500">
              {error}
            </p>
          </div>
        )}

        {market && !loading && (
          <>
            {/* Hero + Ask MarketMind */}
            <section className="mb-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

                <div className="relative">
  <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
    AI-Powered Crypto Intelligence
  </p>

  <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
    Don&apos;t just see what moved.
    <br />
    <span className="text-zinc-500">
      Ask MarketMind why.
    </span>
  </h2>

  <p className="mt-5 max-w-xl text-sm leading-6 text-zinc-400">
    MarketMind analyzes live CoinMarketCap market data to uncover
    momentum, volume shifts, anomalies and market-wide signals —
    then explains what the data means.
  </p>

  <div className="mt-7 flex flex-wrap gap-3">
    <a
      href="#ask"
      className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
    >
      Ask MarketMind
    </a>

    <span className="rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-400">
      Powered by {market.source}
    </span>
  </div>
</div>
              </div>

              {/* Market Score */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Market Score
                </p>

                <div className="mt-6 flex items-end gap-3">
                  <span className="text-6xl font-semibold tracking-tight">
                    {market.analysis.marketScore}
                  </span>

                  <span className="mb-2 text-sm text-zinc-500">
                    / 100
                  </span>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all ${
  market.analysis.marketBias === "bullish"
    ? "bg-emerald-400"
    : market.analysis.marketBias === "bearish"
      ? "bg-red-400"
      : "bg-zinc-400"
}`}
                    style={{
                      width: `${market.analysis.marketScore}%`,
                    }}
                  />
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm text-zinc-500">
                    Current bias
                  </span>

                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium capitalize">
                    {market.analysis.marketBias}
                  </span>
                </div>
              </div>
            </section>

            {/* Ask MarketMind */}
            <section
              id="ask"
              className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  AI Analyst
                </p>

                <h3 className="mt-1 text-2xl font-semibold">
                  Ask MarketMind
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                  Ask questions about the current market. MarketMind
                  analyzes live CMC data and explains the signals behind
                  the move.
                </p>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void askMarketMind();
                }}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <input
                  value={question}
                  onChange={(event) =>
                    setQuestion(event.target.value)
                  }
                  placeholder="Why is the market moving this way?"
                  className="min-h-12 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/20"
                />

                <button
                  type="submit"
                  disabled={!question.trim() || askLoading}
                  className="min-h-12 rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {askLoading ? "Analyzing..." : "Analyze"}
                </button>
              </form>

              <div className="mt-4 flex flex-wrap gap-2">
                {suggestedQuestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => void askMarketMind(item)}
                    disabled={askLoading}
                    className="rounded-full border border-white/10 px-3 py-2 text-xs text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white disabled:opacity-40"
                  >
                    {item}
                  </button>
                ))}
              </div>

              {askError && (
                <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-sm text-red-400">
                    {askError}
                  </p>
                </div>
              )}

              {askLoading && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />

                    <p className="text-sm text-zinc-400">
                      MarketMind is analyzing live market signals...
                    </p>
                  </div>
                </div>
              )}

              {answer && !askLoading && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                      MarketMind Analysis
                    </span>

                    <span className="text-xs text-zinc-600">
                      Live market context
                    </span>
                  </div>

                  <div className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                    {answer}
                  </div>
                </div>
              )}
            </section>

            {/* Stats */}
            <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs text-zinc-500">BTC Price</p>

                <p className="mt-2 text-xl font-semibold">
                  {formatPrice(btc?.price ?? null)}
                </p>

                {btc && (
                  <p className="mt-1 text-xs">
                    <Change value={btc.percentChange24h} />
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs text-zinc-500">
                  BTC Dominance
                </p>

                <p className="mt-2 text-xl font-semibold">
                  {btc
                    ? `${btc.marketCapDominance.toFixed(2)}%`
                    : "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs text-zinc-500">
                  24h Volume
                </p>

                <p className="mt-2 text-xl font-semibold">
                  ${formatCompact(totalVolume)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs text-zinc-500">
                  Market Breadth
                </p>

                <p className="mt-2 text-xl font-semibold">
                  {breadth}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  assets up / tracked
                </p>
              </div>
            </section>

            {/* Market Chart */}
            <section className="mb-6">
              <MarketChart
                data={marketChartData}
                label="Bitcoin performance across key timeframes"
              />
            </section>

            {/* Signals */}
            <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Intelligence Feed
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    What the market is saying
                  </h3>
                </div>

                <span className="text-xs text-zinc-500">
                  {market.analysis.signals.length} signals
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {market.analysis.signals
                  .slice(0, 6)
                 .map((signal, index) => {
  const signalStyle = getSignalStyle(signal.type);

  return (
    <div
      key={`${signal.asset.id}-${signal.type}-${index}`}
      className={`rounded-2xl border bg-black/20 p-5 transition ${signalStyle.accent} hover:bg-white/[0.03]`}
    >
      <div className="flex items-start justify-between gap-3">
  <div className="flex flex-wrap items-center gap-2">
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider ${signalStyle.badge}`}
    >
      {signal.type.replace("_", " ")}
    </span>

    <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
      {signal.asset.symbol}
    </span>
  </div>

  <span className="text-xs text-zinc-600">
    {signal.score}/100
  </span>
</div>

      <h4 className="mt-4 text-sm font-semibold">
        {signal.title}
      </h4>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
        {signal.description}
      </p>
    </div>
  );
})}
              </div>
            </section>

            {/* Movers */}
            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Market Movers
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    Top gainers
                  </h3>
                </div>

               <div className="space-y-2">
                 {market.analysis.topGainers.map((asset) => (
                   <Link
                     key={asset.id}
                     href={`/token/${asset.id}`}
                      className="flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-white/[0.04]"
                   >
                     <div className="flex items-center gap-3">
                       <span className="w-5 text-xs text-zinc-600">
                         {asset.rank}
                       </span>

                      <div>
                        <p className="text-sm font-medium">
                          {asset.name}
                        </p>

                         <p className="text-[11px] text-zinc-600">
                           {asset.symbol}
                        </p>
                       </div>
                  </div>

                   <div className="text-right">
                     <p className="text-sm">
                        {formatPrice(asset.price)}
                     </p>

                     <p className="text-xs">
                       <Change value={asset.percentChange24h} />
                     </p>
                   </div>
                 </Link>
               ))}
             </div>
            </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Volume Intelligence
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    Biggest volume shifts
                  </h3>
                </div>

                <div className="space-y-2">
                  {market.analysis.volumeLeaders.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-xs text-zinc-600">
                          {asset.rank}
                        </span>

                        <div>
                          <p className="text-sm font-medium">
                            {asset.name}
                          </p>

                          <p className="text-[11px] text-zinc-600">
                            {asset.symbol}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm">
                          ${formatCompact(asset.volume24h)}
                        </p>

                        <p className="text-xs">
                          <Change value={asset.volumeChange24h} />
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="mt-10 flex flex-col gap-2 border-t border-white/5 pt-6 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
              <span>
                MarketMind · AI-powered crypto market intelligence
              </span>

              <span>
                Data source: {market.source}
              </span>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}