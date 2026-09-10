import { NextResponse } from "next/server";
import { getTokenQuote } from "@/lib/cmc/service";
import { analyzeToken } from "@/lib/analytics/token";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return NextResponse.json(
        {
          success: false,
          error: "Token ID is required",
        },
        { status: 400 }
      );
    }

    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Token ID must be a positive integer",
        },
        { status: 400 }
      );
    }

    const asset = await getTokenQuote(id);

    if (!asset) {
      return NextResponse.json(
        {
          success: false,
          error: "Token not found",
        },
        { status: 404 }
      );
    }

    const analysis = analyzeToken(asset);

return NextResponse.json({
  success: true,
  source: "CoinMarketCap",
  data: asset,
  analysis,
});
  } catch (error) {
    console.error("Token API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch token data",
      },
      { status: 500 }
    );
  }
}