export type CmcQuote = {
  price: number | null;
  volume_24h: number;
  volume_change_24h: number;
  percent_change_1h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  percent_change_30d: number;
  market_cap: number | null;
  market_cap_dominance: number;
  fully_diluted_market_cap: number | null;
  last_updated: string;
};

export type CmcAsset = {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number | null;
  circulating_supply: number | null;
  total_supply: number | null;
  max_supply: number | null;
  quote: {
    USD: CmcQuote;
  };
};

export type CmcQuotesResponse = {
  data: Record<string, CmcAsset[]>;
};

export type MarketAsset = {
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