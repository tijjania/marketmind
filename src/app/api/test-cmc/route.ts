import { NextResponse } from "next/server";
import { cmcFetch } from "@/lib/cmc/client";

type CmcAsset = {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number | null;
  quote: {
    USD: {
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
  };
};

type CmcResponse = {
  data: Record<string, CmcAsset[]>;
};

export async function GET() {
  try {
    const result = await cmcFetch<CmcResponse>(
      "/v2/cryptocurrency/quotes/latest",
      {
        symbol: "BTC",
        convert: "USD",
      }
    );

    const assets = result.data["BTC"];

    if (!assets) {
      throw new Error("BTC data was not returned by CoinMarketCap");
    }

    // Find the canonical Bitcoin asset by CMC ID.
    const btc = assets.find((asset) => asset.id === 1);

    if (!btc) {
      throw new Error("Canonical Bitcoin asset was not returned by CoinMarketCap");
    }

    const usd = btc.quote.USD;

    return NextResponse.json({
      success: true,
      source: "CoinMarketCap",
      data: {
        id: btc.id,
        name: btc.name,
        symbol: btc.symbol,
        slug: btc.slug,
        rank: btc.cmc_rank,
        price: usd.price,
        percentChange24h: usd.percent_change_24h,
        marketCap: usd.market_cap,
        volume24h: usd.volume_24h,
        volumeChange24h: usd.volume_change_24h,
        lastUpdated: usd.last_updated,
      },
    });
  } catch (error) {
    console.error("CMC test error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}