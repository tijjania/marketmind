import type { MarketAsset } from "@/lib/cmc/types";

export type MarketSignal = {
  type: "momentum" | "volume_surge" | "selloff" | "anomaly";
  score: number;
  title: string;
  description: string;
  asset: MarketAsset;
};

export type MarketAnalysis = {
  marketBias: "bullish" | "bearish" | "mixed";
  marketScore: number;
  signals: MarketSignal[];
  topGainers: MarketAsset[];
  topLosers: MarketAsset[];
  volumeLeaders: MarketAsset[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function calculateMomentum(asset: MarketAsset) {
  const shortTerm = asset.percentChange24h;
  const mediumTerm = asset.percentChange7d;

  return clamp(
    shortTerm * 5 +
      mediumTerm * 2 +
      asset.volumeChange24h * 0.15,
    -100,
    100
  );
}

function calculateMarketScore(assets: MarketAsset[]) {
  if (!assets.length) return 50;

  const validAssets = assets.filter(
    (asset) =>
      asset.percentChange24h !== null &&
      asset.marketCap !== null &&
      asset.marketCap > 0
  );

  if (!validAssets.length) return 50;

  const positive = validAssets.filter(
    (asset) => asset.percentChange24h > 0
  ).length;

  const breadth = positive / validAssets.length;

  const weightedChange =
    validAssets.reduce((total, asset) => {
      const weight = Math.sqrt(asset.marketCap ?? 0);
      return total + asset.percentChange24h * weight;
    }, 0) /
    validAssets.reduce(
      (total, asset) => total + Math.sqrt(asset.marketCap ?? 0),
      0
    );

  return Math.round(
    clamp(50 + breadth * 30 + weightedChange * 2, 0, 100)
  );
}

function getMarketBias(score: number): MarketAnalysis["marketBias"] {
  if (score >= 60) return "bullish";
  if (score <= 40) return "bearish";
  return "mixed";
}

export function analyzeMarket(
  assets: MarketAsset[]
): MarketAnalysis {
  const rankedAssets = [...assets]
    .filter((asset) => asset.rank !== null)
    .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));

  const topGainers = [...rankedAssets]
    .sort(
      (a, b) =>
        b.percentChange24h - a.percentChange24h
    )
    .slice(0, 5);

  const topLosers = [...rankedAssets]
    .sort(
      (a, b) =>
        a.percentChange24h - b.percentChange24h
    )
    .slice(0, 5);

  const volumeLeaders = [...rankedAssets]
    .sort(
      (a, b) =>
        b.volumeChange24h - a.volumeChange24h
    )
    .slice(0, 5);

  const signals: MarketSignal[] = [];

  for (const asset of rankedAssets) {
    const momentum = calculateMomentum(asset);

    if (momentum >= 40) {
      signals.push({
        type: "momentum",
        score: Math.round(momentum),
        title: `${asset.name} showing strong momentum`,
        description:
          `${asset.symbol} is up ${asset.percentChange24h.toFixed(
            2
          )}% over 24h and ${asset.percentChange7d.toFixed(
            2
          )}% over 7d, with volume changing ${asset.volumeChange24h.toFixed(
            2
          )}%.`,
        asset,
      });
    }

    if (asset.volumeChange24h >= 50) {
      signals.push({
        type: "volume_surge",
        score: Math.round(
          clamp(asset.volumeChange24h, 0, 100)
        ),
        title: `${asset.name} has a volume surge`,
        description:
          `Trading volume is up ${asset.volumeChange24h.toFixed(
            2
          )}% over the comparison period while price is ${asset.percentChange24h >= 0 ? "up" : "down"} ${Math.abs(
            asset.percentChange24h
          ).toFixed(2)}% over 24h.`,
        asset,
      });
    }

    if (asset.percentChange24h <= -10) {
      signals.push({
        type: "selloff",
        score: Math.round(
          clamp(Math.abs(asset.percentChange24h) * 5, 0, 100)
        ),
        title: `${asset.name} is experiencing a heavy selloff`,
        description:
          `${asset.symbol} is down ${Math.abs(
            asset.percentChange24h
          ).toFixed(2)}% over 24h.`,
        asset,
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
        title: `${asset.name} shows unusual market activity`,
        description:
          `${asset.symbol} moved ${asset.percentChange24h.toFixed(
            2
          )}% in 24h while volume changed ${asset.volumeChange24h.toFixed(
            2
          )}%.`,
        asset,
      });
    }
  }

  signals.sort((a, b) => b.score - a.score);

  const marketScore = calculateMarketScore(rankedAssets);

  return {
    marketBias: getMarketBias(marketScore),
    marketScore,
    signals: signals.slice(0, 15),
    topGainers,
    topLosers,
    volumeLeaders,
  };
}