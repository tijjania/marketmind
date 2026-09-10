import { cmcFetch } from "./client";
import type {
  CmcAsset,
  CmcQuotesResponse,
  MarketAsset,
} from "./types";

function normalizeAsset(asset: CmcAsset): MarketAsset {
  const usd = asset.quote.USD;

  return {
    id: asset.id,
    name: asset.name,
    symbol: asset.symbol,
    slug: asset.slug,
    rank: asset.cmc_rank,
    price: usd.price,
    marketCap: usd.market_cap,
    volume24h: usd.volume_24h,
    volumeChange24h: usd.volume_change_24h,
    percentChange1h: usd.percent_change_1h,
    percentChange24h: usd.percent_change_24h,
    percentChange7d: usd.percent_change_7d,
    percentChange30d: usd.percent_change_30d,
    marketCapDominance: usd.market_cap_dominance,
    lastUpdated: usd.last_updated,
  };
}

export async function getTokenQuote(
  id: number
): Promise<MarketAsset | null> {
  const result = await cmcFetch<CmcQuotesResponse>(
    "/v2/cryptocurrency/quotes/latest",
    {
      id: String(id),
      convert: "USD",
    }
  );

  const assets = Object.values(result.data).flat();
  const asset = assets.find((item) => item.id === id);

  return asset ? normalizeAsset(asset) : null;
}

export async function getMarketListings(
  limit = 100
): Promise<MarketAsset[]> {
  const result = await cmcFetch<{
    data: CmcAsset[];
  }>("/v1/cryptocurrency/listings/latest", {
    start: "1",
    limit: String(limit),
    convert: "USD",
  });

  return result.data.map(normalizeAsset);
}