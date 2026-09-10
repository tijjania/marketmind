import type { MarketAsset } from "@/lib/cmc/types";

export type TokenSignal = {
  type: "momentum" | "volume" | "trend" | "risk" | "anomaly";
  score: number;
  title: string;
  description: string;
};

export type TokenAnalysis = {
  trend: "bullish" | "bearish" | "mixed";
  momentumScore: number;
  riskLevel: "low" | "medium" | "high";
  signals: TokenSignal[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function calculateMomentum(asset: MarketAsset) {
  return clamp(
    asset.percentChange24h * 5 +
      asset.percentChange7d * 2 +
      asset.volumeChange24h * 0.15,
    -100,
    100
  );
}

function getTrend(
  momentum: number
): TokenAnalysis["trend"] {
  if (momentum >= 20) return "bullish";
  if (momentum <= -20) return "bearish";
  return "mixed";
}

function getRiskLevel(
  asset: MarketAsset
): TokenAnalysis["riskLevel"] {
  const volatilitySignal =
    Math.abs(asset.percentChange24h) +
    Math.abs(asset.percentChange7d) * 0.5;

  const volumeSignal = Math.max(asset.volumeChange24h, 0) * 0.1;

  const riskScore = volatilitySignal + volumeSignal;

  if (riskScore >= 35) return "high";
  if (riskScore >= 15) return "medium";

  return "low";
}

export function analyzeToken(
  asset: MarketAsset
): TokenAnalysis {
  const momentum = calculateMomentum(asset);
  const trend = getTrend(momentum);
  const riskLevel = getRiskLevel(asset);

  const signals: TokenSignal[] = [];

  if (Math.abs(momentum) >= 20) {
    signals.push({
      type: "momentum",
      score: Math.round(Math.abs(momentum)),
      title:
        momentum > 0
          ? "Positive momentum"
          : "Negative momentum",
      description:
        `${asset.symbol} has a momentum score of ${Math.round(
          momentum
        )}, based on recent price performance and volume behavior.`,
    });
  }

  if (asset.volumeChange24h >= 30) {
    signals.push({
      type: "volume",
      score: Math.round(
        clamp(asset.volumeChange24h, 0, 100)
      ),
      title: "Volume expansion",
      description:
        `24h trading volume is up ${asset.volumeChange24h.toFixed(
          2
        )}% compared with the previous period.`,
    });
  }

  if (
    asset.percentChange24h > 2 &&
    asset.percentChange7d > 5
  ) {
    signals.push({
      type: "trend",
      score: Math.round(
        clamp(
          asset.percentChange24h * 5 +
            asset.percentChange7d * 2,
          0,
          100
        )
      ),
      title: "Short and medium-term trend alignment",
      description:
        `${asset.symbol} is positive across both the 24h and 7d timeframes.`,
    });
  }

  if (
    asset.percentChange24h < -2 &&
    asset.percentChange7d < -5
  ) {
    signals.push({
      type: "trend",
      score: Math.round(
        clamp(
          Math.abs(asset.percentChange24h) * 5 +
            Math.abs(asset.percentChange7d) * 2,
          0,
          100
        )
      ),
      title: "Persistent downside trend",
      description:
        `${asset.symbol} is negative across both the 24h and 7d timeframes.`,
    });
  }

  if (
    Math.abs(asset.percentChange24h) >= 8 &&
    asset.volumeChange24h >= 30
  ) {
    signals.push({
      type: "anomaly",
      score: Math.round(
        clamp(
          Math.abs(asset.percentChange24h) * 4 +
            asset.volumeChange24h * 0.5,
          0,
          100
        )
      ),
      title: "Unusual price and volume activity",
      description:
        `${asset.symbol} moved ${asset.percentChange24h.toFixed(
          2
        )}% in 24h while volume changed ${asset.volumeChange24h.toFixed(
          2
        )}%.`,
    });
  }

  if (riskLevel === "high") {
    signals.push({
      type: "risk",
      score: 75,
      title: "Elevated market risk",
      description:
        `${asset.symbol} is showing elevated risk based on recent price movement and volume behavior.`,
    });
  }

  signals.sort((a, b) => b.score - a.score);

  return {
    trend,
    momentumScore: Math.round(momentum),
    riskLevel,
    signals: signals.slice(0, 8),
  };
}