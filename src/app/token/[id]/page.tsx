"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TokenChart from "@/components/TokenChart";

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

type TokenSignal = {
  type: "momentum" | "volume" | "trend" | "risk" | "anomaly";
  score: number;
  title: string;
  description: string;
};

type TokenAnalysis = {
  trend: "bullish" | "bearish" | "mixed";
  momentumScore: number;
  riskLevel: "low" | "medium" | "high";
  signals: TokenSignal[];
};

type TokenResponse = {
  success: boolean;
  source: string;
  data: MarketAsset;
  analysis: TokenAnalysis;
  error?: string;
};

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

function trendLabel(trend: TokenAnalysis["trend"]) {
  if (trend === "bullish") return "Bullish";
  if (trend === "bearish") return "Bearish";
  return "Mixed";
}

export default function TokenPage() {
  const params = useParams();
  const id = params.id;

  const [token, setToken] = useState<TokenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function loadToken() {
      try {
        setLoading(true);

        const response = await fetch(`/api/token?id=${id}`, {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || "Failed to load token data"
          );
        }

        setToken(result);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load token data"
        );
      } finally {
        setLoading(false);
      }
    }

    loadToken();
  }, [id]);

  async function askMarketMind(customQuestion?: string) {
    const currentQuestion = (customQuestion ?? question).trim();

    if (!currentQuestion || askLoading || !id) return;

    try {
      setAskLoading(true);
      setAskError("");

      if (customQuestion) {
        setQuestion(customQuestion);
      }

      const response = await fetch("/api/token/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          question: currentQuestion,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to generate token analysis"
        );
      }

      setAnswer(result.answer ?? "");
    } catch (err) {
      setAskError(
        err instanceof Error
          ? err.message
          : "Failed to generate token analysis"
      );
    } finally {
      setAskLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#05070b] px-6 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />

            <p className="text-sm text-zinc-400">
              Loading token intelligence...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !token) {
    return (
      <main className="min-h-screen bg-[#05070b] px-6 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <Link
  href="/"
  className="text-sm text-zinc-500 transition hover:text-white"
>
  ← Back to MarketMind
</Link>
          <div className="mt-8 rounded-3xl border border-red-500/20 bg-red-500/5 p-8">
            <h1 className="text-lg font-semibold text-red-400">
              Token unavailable
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              {error || "Unable to load this token."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const asset = token.data;
  const analysis = token.analysis;

  const performanceChartData = [
    { label: "1H", value: asset.percentChange1h },
    { label: "24H", value: asset.percentChange24h },
    { label: "7D", value: asset.percentChange7d },
    { label: "30D", value: asset.percentChange30d },
  ];

  return (
    <main className="min-h-screen bg-[#05070b] text-white">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <a
  href="#ask"
  className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
>
  Ask MarketMind
</a>

          <span className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-xs text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            LIVE DATA
          </span>
        </header>

        {/* Token Overview */}
        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-7">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white font-bold text-black">
                  {asset.symbol.slice(0, 1)}
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-semibold">
                      {asset.name}
                    </h1>

                    <span className="text-sm text-zinc-500">
                      {asset.symbol}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-zinc-600">
                    Rank #{asset.rank ?? "—"} · CMC ID {asset.id}
                  </p>
                </div>
              </div>

              <div className="mt-7">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Current Price
                </p>

                <div className="mt-2 flex items-end gap-4">
                  <span className="text-4xl font-semibold">
                    {formatPrice(asset.price)}
                  </span>

                  <span className="mb-1 text-sm">
                    <Change value={asset.percentChange24h} />
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Metric
                label="Market Cap"
                value={`$${formatCompact(asset.marketCap)}`}
              />

              <Metric
                label="24h Volume"
                value={`$${formatCompact(asset.volume24h)}`}
              />

              <Metric
                label="Dominance"
                value={`${asset.marketCapDominance.toFixed(2)}%`}
              />
            </div>
          </div>
        </section>

        {/* Performance */}
        <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard
            label="1 Hour"
            value={<Change value={asset.percentChange1h} />}
          />

          <MetricCard
            label="24 Hours"
            value={<Change value={asset.percentChange24h} />}
          />

          <MetricCard
            label="7 Days"
            value={<Change value={asset.percentChange7d} />}
          />

          <MetricCard
            label="30 Days"
            value={<Change value={asset.percentChange30d} />}
          />
        </section>

        {/* Token Performance Chart */}
        <section className="mb-6">
          <TokenChart
            data={performanceChartData}
            symbol={asset.symbol}
          />
        </section>

        {/* Intelligence */}
        <section className="mb-6 grid gap-6 md:grid-cols-3">
          <IntelligenceCard
            label="Momentum Score"
            value={`${analysis.momentumScore}`}
            subtitle="/ 100"
          />

          <IntelligenceCard
            label="Trend"
            value={trendLabel(analysis.trend)}
            subtitle="Current structure"
          />

          <IntelligenceCard
            label="Risk Level"
            value={
              analysis.riskLevel.charAt(0).toUpperCase() +
              analysis.riskLevel.slice(1)
            }
            subtitle="Market behavior"
          />
        </section>

        {/* AI Analyst */}
        <section id="ask" className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              AI Analyst
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Ask MarketMind about {asset.symbol}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Ask about this token&apos;s momentum, trend, volume, risk, or
              detected signals. MarketMind uses the live token data above.
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
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={`Why is ${asset.symbol} showing this momentum?`}
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
            {[
              `Why is ${asset.symbol} moving this way?`,
              `What is driving ${asset.symbol}'s momentum?`,
              `Is volume confirming the ${asset.symbol} trend?`,
              `What are the main risks for ${asset.symbol}?`,
            ].map((item) => (
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
              <p className="text-sm text-red-400">{askError}</p>
            </div>
          )}

          {askLoading && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
                <p className="text-sm text-zinc-400">
                  MarketMind is analyzing live {asset.symbol} signals...
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
                  Live token context
                </span>
              </div>

              <div className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                {answer}
              </div>
            </div>
          )}
        </section>

        {/* Signals */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Token Intelligence
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Signals detected for {asset.symbol}
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              These signals are calculated from live price and volume
              metrics supplied by CoinMarketCap.
            </p>
          </div>

          {analysis.signals.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-zinc-500">
              No significant signals detected right now.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {analysis.signals.map((signal, index) => (
                <div
                  key={`${signal.type}-${index}`}
                  className="rounded-2xl border border-white/10 bg-black/20 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] uppercase tracking-wider text-zinc-400">
                      {signal.type}
                    </span>

                    <span className="text-xs text-zinc-600">
                      {signal.score}/100
                    </span>
                  </div>

                  <h3 className="mt-4 text-sm font-semibold">
                    {signal.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-zinc-500">
                    {signal.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-8 border-t border-white/5 pt-6 text-xs text-zinc-600">
          MarketMind · Token Intelligence · Data source:{" "}
          {token.source}
        </footer>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs text-zinc-500">{label}</p>

      <p className="mt-3 text-xl font-semibold">{value}</p>
    </div>
  );
}

function IntelligenceCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
        {label}
      </p>

      <p className="mt-5 text-3xl font-semibold">{value}</p>

      <p className="mt-2 text-xs text-zinc-600">{subtitle}</p>
    </div>
  );
}