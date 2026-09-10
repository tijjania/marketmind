import { NextResponse } from "next/server";
import { getMarketListings } from "@/lib/cmc/service";
import { analyzeMarket } from "@/lib/analytics/market";

export async function GET() {
  try {
    const assets = await getMarketListings(50);
    const analysis = analyzeMarket(assets);

    return NextResponse.json({
      success: true,
      source: "CoinMarketCap",
      count: assets.length,
      data: assets,
      analysis,
    });
  } catch (error) {
    console.error("Market API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch market data",
      },
      { status: 500 }
    );
  }
}